import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  db,
  incidentEvents,
  incidents,
  tenantMembers,
  users,
} from '@nexaops/database';
import { and, desc, eq, gte, ilike, inArray, sql, SQL } from 'drizzle-orm';
import {
  publicUserColumns,
  stripPasswordHashFromIncident,
} from '../common/public-user';
import { EscalationService } from '../escalation/escalation.service';
import { EventsGateway } from '../events/events.gateway';
import { AiSummaryService } from './ai-summary.service';
import { ChatopsService } from '../notifications/chatops.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly chatopsService: ChatopsService,
    private readonly aiSummaryService: AiSummaryService,
    private readonly escalationService: EscalationService,
  ) {}

  // userId is null when the incident comes from the alert-ingestion API.
  async create(
    dto: CreateIncidentDto,
    userId: string | null,
    tenantId: string,
  ) {
    if (dto.assigneeId) {
      await this.assertTenantMember(tenantId, dto.assigneeId);
    }

    const [incident] = await db
      .insert(incidents)
      .values({
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: 'OPEN',
        tenantId: tenantId,
        creatorId: userId,
        assigneeId: dto.assigneeId,
      })
      .returning();

    // Fetch creator details to emit complete object
    const incidentWithCreator = await db.query.incidents.findFirst({
      where: eq(incidents.id, incident.id),
      with: {
        creator: publicUserColumns,
        assignee: publicUserColumns,
      },
    });

    const safePayload = incidentWithCreator
      ? stripPasswordHashFromIncident(incidentWithCreator)
      : incidentWithCreator;

    this.eventsGateway.server
      .to(`tenant:${tenantId}`)
      .emit('incidentCreated', safePayload);

    void this.chatopsService.notify(
      tenantId,
      `🚨 [${incident.severity}] New incident: ${incident.title}`,
    );

    // Enqueue escalation check for high-priority incidents
    if (dto.severity === 'CRITICAL' || dto.severity === 'HIGH') {
      void this.escalationService.enqueueCheck(incident.id, tenantId, dto.severity);
    }

    // Fire-and-forget — email failures must never fail the HTTP response
    if (incidentWithCreator?.creator?.email) {
      void this.notificationsService.enqueueEmail({
        to: incidentWithCreator.creator.email,
        subject: `[${incident.severity}] New Incident: ${incident.title}`,
        text: `A new incident has been reported.\n\nTitle: ${incident.title}\nDescription: ${incident.description}\nSeverity: ${incident.severity}`,
      }).catch((err) => this.logger.error(`Failed to send creation email: ${String(err)}`));
    }

    return incident;
  }

  async findAll(
    tenantId: string,
    opts: {
      assigneeId?: string;
      status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
      severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      q?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;

    const conditions: SQL[] = [eq(incidents.tenantId, tenantId)];
    if (opts.assigneeId) {
      conditions.push(eq(incidents.assigneeId, opts.assigneeId));
    }
    if (opts.status) {
      conditions.push(eq(incidents.status, opts.status));
    }
    if (opts.severity) {
      conditions.push(eq(incidents.severity, opts.severity));
    }
    if (opts.q) {
      conditions.push(ilike(incidents.title, `%${opts.q}%`));
    }
    const where = and(...conditions);

    const [rows, countRows] = await Promise.all([
      db.query.incidents.findMany({
        where,
        orderBy: [desc(incidents.createdAt)],
        with: {
          creator: publicUserColumns,
          assignee: publicUserColumns,
        },
        limit,
        offset: (page - 1) * limit,
      }),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(incidents)
        .where(where),
    ]);

    const total = Number(countRows[0]?.count ?? 0);
    return {
      data: rows.map(stripPasswordHashFromIncident),
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // Tenant-wide counters for the dashboard summary cards (not affected by
  // pagination or filters).
  async stats(tenantId: string) {
    const rows = await db
      .select({
        status: incidents.status,
        severity: incidents.severity,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(incidents)
      .where(eq(incidents.tenantId, tenantId))
      .groupBy(incidents.status, incidents.severity);

    const out = {
      total: 0,
      active: 0,
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    for (const row of rows) {
      const count = Number(row.count);
      out.total += count;
      if (row.status === 'OPEN' || row.status === 'ACKNOWLEDGED') {
        out.active += count;
      }
      out[row.severity] += count;
    }
    return out;
  }

  async analytics(tenantId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily incident counts
    const dailyCounts = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${incidents.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(incidents)
      .where(and(eq(incidents.tenantId, tenantId), gte(incidents.createdAt, since)))
      .groupBy(sql`date_trunc('day', ${incidents.createdAt})`)
      .orderBy(sql`date_trunc('day', ${incidents.createdAt})`);

    // MTTR: avg minutes between createdAt and the STATUS_CHANGE→RESOLVED event
    let mttrRows: { severity: string; avgMinutes: number; resolved: number }[] = [];
    try {
      mttrRows = await db
        .select({
          severity: incidents.severity,
          avgMinutes: sql<number>`
            cast(coalesce(avg(
              extract(epoch from (
                (select ie.created_at
                 from incident_events ie
                 where ie.incident_id = ${incidents.id}
                   and ie.action_type = 'STATUS_CHANGE'
                   and ie.message like '%RESOLVED%'
                 order by ie.created_at asc
                 limit 1)
                - ${incidents.createdAt}
              )) / 60, 0) as int)
          `,
          resolved: sql<number>`cast(count(*) as int)`,
        })
        .from(incidents)
        .where(
          and(
            eq(incidents.tenantId, tenantId),
            eq(incidents.status, 'RESOLVED'),
            gte(incidents.createdAt, since),
          ),
        )
        .groupBy(incidents.severity);
    } catch (err) {
      this.logger.error(`MTTR query failed: ${String(err)}`);
    }

    // Severity distribution (all time for this tenant)
    const severityDist = await db
      .select({
        severity: incidents.severity,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(incidents)
      .where(eq(incidents.tenantId, tenantId))
      .groupBy(incidents.severity);

    // Status distribution
    const statusDist = await db
      .select({
        status: incidents.status,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(incidents)
      .where(eq(incidents.tenantId, tenantId))
      .groupBy(incidents.status);

    return {
      days,
      dailyCounts,
      mttr: mttrRows,
      severityDistribution: severityDist,
      statusDistribution: statusDist,
    };
  }

  async findOne(id: string, tenantId: string) {
    const incident = await db.query.incidents.findFirst({
      where: and(eq(incidents.id, id), eq(incidents.tenantId, tenantId)),
      with: {
        creator: publicUserColumns,
        assignee: publicUserColumns,
        events: {
          orderBy: [desc(incidentEvents.createdAt)],
          with: {
            actor: publicUserColumns,
          },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return stripPasswordHashFromIncident(incident);
  }

  async updateStatus(
    id: string,
    dto: UpdateIncidentStatusDto,
    userId: string,
    tenantId: string,
  ) {
    // Verify existence and ownership
    const incident = await this.findOne(id, tenantId);

    if (incident.status === dto.status) return incident;

    await db.transaction(async (tx: typeof db) => {
      // Update status
      await tx
        .update(incidents)
        .set({ status: dto.status })
        .where(eq(incidents.id, id));

      // Add timeline event
      await tx.insert(incidentEvents).values({
        incidentId: id,
        tenantId: tenantId,
        actorId: userId,
        actionType: 'STATUS_CHANGE',
        message: `Changed status from ${incident.status} to ${dto.status}`,
        payload: { oldStatus: incident.status, newStatus: dto.status },
      });
    });

    const updated = await this.findOne(id, tenantId);
    this.eventsGateway.server
      .to(`tenant:${tenantId}`)
      .emit('incidentUpdated', updated);

    void this.chatopsService.notify(
      tenantId,
      `${dto.status === 'RESOLVED' ? '✅' : '🔁'} Incident "${incident.title}": ${incident.status} → ${dto.status}`,
    );

    // Fire-and-forget — email failures must never fail the HTTP response
    void this.getNotifiableMemberEmails(tenantId).then((recipients) =>
      Promise.all(
        recipients.map((to) =>
          this.notificationsService.enqueueEmail({
            to,
            subject: `Incident Updated: ${incident.title}`,
            text: `Status changed from ${incident.status} to ${dto.status}`,
          }),
        ),
      ),
    ).catch((err) => this.logger.error(`Failed to send status-change emails: ${String(err)}`));

    return updated;
  }

  async assign(
    id: string,
    assigneeId: string | null,
    userId: string,
    tenantId: string,
  ) {
    const incident = await this.findOne(id, tenantId);

    let assigneeEmail: string | undefined;
    let assigneeName: string | undefined;
    if (assigneeId) {
      const member = await this.assertTenantMember(tenantId, assigneeId);
      assigneeEmail = member.email;
      assigneeName = member.name;
    }

    await db.transaction(async (tx: typeof db) => {
      await tx
        .update(incidents)
        .set({ assigneeId })
        .where(eq(incidents.id, id));

      await tx.insert(incidentEvents).values({
        incidentId: id,
        tenantId: tenantId,
        actorId: userId,
        actionType: 'ASSIGNMENT',
        message: assigneeId
          ? `Assigned to ${assigneeName ?? assigneeEmail}`
          : 'Unassigned',
        payload: { assigneeId },
      });
    });

    const updated = await this.findOne(id, tenantId);
    this.eventsGateway.server
      .to(`tenant:${tenantId}`)
      .emit('incidentUpdated', updated);

    if (assigneeEmail) {
      void this.chatopsService.notify(
        tenantId,
        `👤 Incident "${incident.title}" assigned to ${assigneeName ?? assigneeEmail}`,
      );
      void this.notificationsService.enqueueEmail({
        to: assigneeEmail,
        subject: `[${incident.severity}] Incident assigned to you: ${incident.title}`,
        text: `You have been assigned to the incident "${incident.title}".\n\nStatus: ${incident.status}\nSeverity: ${incident.severity}`,
      }).catch((err) => this.logger.error(`Failed to send assignment email: ${String(err)}`));
    }

    return updated;
  }

  private async assertTenantMember(tenantId: string, userId: string) {
    const [member] = await db
      .select({ email: users.email, name: users.name })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          eq(tenantMembers.userId, userId),
        ),
      );
    if (!member) {
      throw new BadRequestException('Assignee must be a member of your tenant');
    }
    return member;
  }

  private async getNotifiableMemberEmails(tenantId: string) {
    const rows = await db
      .select({ email: users.email })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          inArray(tenantMembers.role, ['OWNER', 'ADMIN', 'RESPONDER']),
        ),
      );
    return rows.map((row) => row.email);
  }

  async summarize(id: string, tenantId: string) {
    const incident = await this.findOne(id, tenantId);
    const summary = await this.aiSummaryService.summarize({
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      createdAt: new Date(incident.createdAt),
      events: (incident.events ?? []).map((e: any) => ({
        actionType: e.actionType,
        message: e.message,
        createdAt: new Date(e.createdAt),
      })),
    });
    return { summary };
  }

  async addComment(
    id: string,
    message: string,
    userId: string,
    tenantId: string,
  ) {
    // Verify existence
    await this.findOne(id, tenantId);

    await db.insert(incidentEvents).values({
      incidentId: id,
      tenantId: tenantId,
      actorId: userId,
      actionType: 'COMMENT',
      message: message,
    });

    const updated = await this.findOne(id, tenantId);
    this.eventsGateway.server
      .to(`tenant:${tenantId}`)
      .emit('incidentUpdated', updated);
    return updated;
  }
}
