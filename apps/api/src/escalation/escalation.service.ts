import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import {
  db,
  escalationPolicies,
  incidentEvents,
  incidents,
  tenantMembers,
  users,
} from '@nexaops/database';
import { Queue } from 'bullmq';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { ChatopsService } from '../notifications/chatops.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpsertEscalationPolicyDto } from './dto/upsert-escalation-policy.dto';

const queueEnabled = process.env.NOTIFICATIONS_QUEUE_ENABLED !== 'false';

const ROLE_HIERARCHY = ['OWNER', 'ADMIN', 'RESPONDER', 'OBSERVER', 'VIEWER'];

function rolesAtOrAbove(role: string): string[] {
  const idx = ROLE_HIERARCHY.indexOf(role);
  return idx === -1 ? [role] : ROLE_HIERARCHY.slice(0, idx + 1);
}

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly chatopsService: ChatopsService,
    @Optional() @InjectQueue('escalation') private readonly escalationQueue?: Queue,
  ) {}

  async findAll(tenantId: string) {
    return db
      .select()
      .from(escalationPolicies)
      .where(eq(escalationPolicies.tenantId, tenantId));
  }

  async create(dto: UpsertEscalationPolicyDto, tenantId: string) {
    const [policy] = await db
      .insert(escalationPolicies)
      .values({
        tenantId,
        name: dto.name ?? 'Default',
        severity: dto.severity ?? 'CRITICAL',
        delayMinutes: dto.delayMinutes ?? 15,
        notifyRole: dto.notifyRole ?? 'OWNER',
        enabled: dto.enabled ?? true,
      })
      .returning();
    return policy;
  }

  async update(id: string, dto: UpsertEscalationPolicyDto, tenantId: string) {
    const [policy] = await db
      .update(escalationPolicies)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.severity !== undefined && { severity: dto.severity }),
        ...(dto.delayMinutes !== undefined && { delayMinutes: dto.delayMinutes }),
        ...(dto.notifyRole !== undefined && { notifyRole: dto.notifyRole }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      })
      .where(and(eq(escalationPolicies.id, id), eq(escalationPolicies.tenantId, tenantId)))
      .returning();

    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async remove(id: string, tenantId: string) {
    const [policy] = await db
      .delete(escalationPolicies)
      .where(and(eq(escalationPolicies.id, id), eq(escalationPolicies.tenantId, tenantId)))
      .returning();

    if (!policy) throw new NotFoundException('Policy not found');
    return { deleted: true };
  }

  async enqueueCheck(
    incidentId: string,
    tenantId: string,
    severity: string,
  ) {
    if (!queueEnabled) return;

    // Find the matching active policy
    const [policy] = await db
      .select()
      .from(escalationPolicies)
      .where(
        and(
          eq(escalationPolicies.tenantId, tenantId),
          eq(escalationPolicies.severity, severity),
          eq(escalationPolicies.enabled, true),
        ),
      )
      .limit(1);

    if (!policy || !this.escalationQueue) return;

    await this.escalationQueue.add(
      'check',
      { incidentId, tenantId, policyId: policy.id, notifyRole: policy.notifyRole },
      { delay: policy.delayMinutes * 60 * 1000 },
    );
  }

  /**
   * Cron-driven sweep: escalate every OPEN incident whose enabled policy
   * delay has elapsed without acknowledgement. The ESCALATED timeline event
   * doubles as the dedupe marker, so each incident escalates at most once.
   * Runs without Redis — this is the escalation path in production.
   */
  async escalateOverdueIncidents(): Promise<number> {
    const overdue = await db
      .select({
        incidentId: incidents.id,
        tenantId: incidents.tenantId,
        title: incidents.title,
        severity: incidents.severity,
        delayMinutes: escalationPolicies.delayMinutes,
        notifyRole: escalationPolicies.notifyRole,
        policyName: escalationPolicies.name,
      })
      .from(incidents)
      .innerJoin(
        escalationPolicies,
        and(
          eq(escalationPolicies.tenantId, incidents.tenantId),
          // policy severity is text, incident severity is a pg enum — cast to compare
          sql`"escalation_policies"."severity" = "incidents"."severity"::text`,
          eq(escalationPolicies.enabled, true),
        ),
      )
      .where(
        and(
          eq(incidents.status, 'OPEN'),
          sql`"incidents"."created_at" <= now() - make_interval(mins => "escalation_policies"."delay_minutes")`,
          sql`not exists (
            select 1 from incident_events ie
            where ie.incident_id = "incidents"."id"
              and ie.action_type = 'ESCALATED'
          )`,
        ),
      );

    for (const row of overdue) {
      try {
        await this.escalate(row);
      } catch (err) {
        this.logger.error(
          `Escalation failed for incident ${row.incidentId}: ${String(err)}`,
        );
      }
    }
    return overdue.length;
  }

  private async escalate(row: {
    incidentId: string;
    tenantId: string;
    title: string;
    severity: string;
    delayMinutes: number;
    notifyRole: string;
  }): Promise<void> {
    // Write the timeline marker first — it is also the dedupe guard, so a
    // notification failure never causes a repeat escalation storm.
    await db.insert(incidentEvents).values({
      incidentId: row.incidentId,
      tenantId: row.tenantId,
      actionType: 'ESCALATED',
      message: `Escalated to ${row.notifyRole} — unacknowledged for ${row.delayMinutes} minute(s)`,
    });

    const recipients = await db
      .select({ email: users.email })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(
        and(
          eq(tenantMembers.tenantId, row.tenantId),
          inArray(
            tenantMembers.role,
            rolesAtOrAbove(row.notifyRole) as Array<
              'OWNER' | 'ADMIN' | 'RESPONDER' | 'OBSERVER' | 'VIEWER'
            >,
          ),
        ),
      );

    await Promise.allSettled(
      recipients.map((r) =>
        this.notificationsService.enqueueEmail({
          to: r.email,
          subject: `[ESCALATION] ${row.severity} incident unacknowledged: ${row.title}`,
          text:
            `An incident has gone unacknowledged for ${row.delayMinutes} minute(s) ` +
            `and has been escalated to you.\n\nTitle: ${row.title}\nSeverity: ${row.severity}\n\n` +
            `Please acknowledge or resolve it immediately.`,
        }),
      ),
    );

    void this.chatopsService.notify(
      row.tenantId,
      `⏫ [${row.severity}] ESCALATED to ${row.notifyRole}: "${row.title}" — unacknowledged for ${row.delayMinutes}m`,
    );

    this.logger.log(
      `Escalated incident ${row.incidentId} to ${row.notifyRole} (${recipients.length} recipient(s))`,
    );
  }
}
