import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { db, incidents, tenantMembers, users } from '@nexaops/database';
import { Job } from 'bullmq';
import { and, eq, inArray } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';

interface EscalationJobData {
  incidentId: string;
  tenantId: string;
  policyId: string;
  notifyRole: string;
}

@Processor('escalation')
export class EscalationProcessor extends WorkerHost {
  private readonly logger = new Logger(EscalationProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<EscalationJobData>) {
    const { incidentId, tenantId, notifyRole } = job.data;

    const [incident] = await db
      .select({ id: incidents.id, title: incidents.title, status: incidents.status, severity: incidents.severity })
      .from(incidents)
      .where(and(eq(incidents.id, incidentId), eq(incidents.tenantId, tenantId)))
      .limit(1);

    if (!incident) {
      this.logger.warn(`Escalation job: incident ${incidentId} not found`);
      return;
    }

    // Only escalate if still unresolved
    if (incident.status === 'RESOLVED') {
      this.logger.log(`Escalation skipped — incident ${incidentId} already resolved`);
      return;
    }

    // Gather emails for the role to notify
    const rolesToNotify = this.rolesAtOrAbove(notifyRole);
    const recipients = await db
      .select({ email: users.email, name: users.name })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          inArray(
            tenantMembers.role,
            rolesToNotify as Array<'OWNER' | 'ADMIN' | 'RESPONDER' | 'OBSERVER' | 'VIEWER'>,
          ),
        ),
      );

    if (recipients.length === 0) {
      this.logger.log(`Escalation: no recipients found for role ${notifyRole} in tenant ${tenantId}`);
      return;
    }

    await Promise.all(
      recipients.map((r) =>
        this.notificationsService.enqueueEmail({
          to: r.email,
          subject: `[ESCALATION] ${incident.severity} incident still open: ${incident.title}`,
          text: `This incident has not been resolved and has been escalated to you.\n\nTitle: ${incident.title}\nSeverity: ${incident.severity}\nStatus: ${incident.status}\n\nPlease take action immediately.`,
        }),
      ),
    );

    this.logger.log(
      `Escalation sent for incident ${incidentId} to ${recipients.length} recipient(s)`,
    );
  }

  private rolesAtOrAbove(role: string): string[] {
    const hierarchy = ['OWNER', 'ADMIN', 'RESPONDER', 'OBSERVER', 'VIEWER'];
    const idx = hierarchy.indexOf(role);
    return idx === -1 ? [role] : hierarchy.slice(0, idx + 1);
  }
}
