import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  db,
  incidentEvents,
  incidents,
  tenantMembers,
  users,
} from '@nexaops/database';
import { and, desc, eq, inArray } from 'drizzle-orm';
import {
  publicUserColumns,
  stripPasswordHashFromIncident,
} from '../common/public-user';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateIncidentDto, userId: string, tenantId: string) {
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

    // Add Email Job
    if (incidentWithCreator?.creator?.email) {
      await this.notificationsService.enqueueEmail({
        to: incidentWithCreator.creator.email,
        subject: `[${incident.severity}] New Incident: ${incident.title}`,
        text: `A new incident has been reported.\n\nTitle: ${incident.title}\nDescription: ${incident.description}\nSeverity: ${incident.severity}`,
      });
    }

    return incident;
  }

  async findAll(tenantId: string, assigneeId?: string) {
    const rows = await db.query.incidents.findMany({
      where: assigneeId
        ? and(
            eq(incidents.tenantId, tenantId),
            eq(incidents.assigneeId, assigneeId),
          )
        : eq(incidents.tenantId, tenantId),
      orderBy: [desc(incidents.createdAt)],
      with: {
        creator: publicUserColumns,
        assignee: publicUserColumns,
      },
    });
    return rows.map(stripPasswordHashFromIncident);
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

    // Notify the tenant's responders rather than a hardcoded address.
    const recipients = await this.getNotifiableMemberEmails(tenantId);
    await Promise.all(
      recipients.map((to) =>
        this.notificationsService.enqueueEmail({
          to,
          subject: `Incident Updated: ${incident.title}`,
          text: `Status changed from ${incident.status} to ${dto.status}`,
        }),
      ),
    );

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
      await this.notificationsService.enqueueEmail({
        to: assigneeEmail,
        subject: `[${incident.severity}] Incident assigned to you: ${incident.title}`,
        text: `You have been assigned to the incident "${incident.title}".\n\nStatus: ${incident.status}\nSeverity: ${incident.severity}`,
      });
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
