import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { db, incidentEvents, incidents } from '@nexaops/database';
import { Queue } from 'bullmq';
import { and, desc, eq } from 'drizzle-orm';
import { EventsGateway } from '../events/events.gateway';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly eventsGateway: EventsGateway,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async create(dto: CreateIncidentDto, userId: string, tenantId: string) {
    const [incident] = await db
      .insert(incidents)
      .values({
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: 'OPEN',
        tenantId: tenantId,
        creatorId: userId,
      })
      .returning();

    // Fetch creator details to emit complete object
    const incidentWithCreator = await db.query.incidents.findFirst({
      where: eq(incidents.id, incident.id),
      with: {
        creator: true,
      },
    });

    this.eventsGateway.server
      .to(`tenant:${tenantId}`)
      .emit('incidentCreated', incidentWithCreator);

    // Add Email Job
    if (incidentWithCreator?.creator?.email) {
      await this.notificationsQueue.add('send-email', {
        to: incidentWithCreator.creator.email,
        subject: `[${incident.severity}] New Incident: ${incident.title}`,
        text: `A new incident has been reported.\n\nTitle: ${incident.title}\nDescription: ${incident.description}\nSeverity: ${incident.severity}`,
      });
    }

    return incident;
  }

  async findAll(tenantId: string) {
    return db.query.incidents.findMany({
      where: eq(incidents.tenantId, tenantId),
      orderBy: [desc(incidents.createdAt)],
      with: {
        creator: true,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const incident = await db.query.incidents.findFirst({
      where: and(eq(incidents.id, id), eq(incidents.tenantId, tenantId)),
      with: {
        creator: true,
        events: {
          orderBy: [desc(incidentEvents.createdAt)],
          with: {
            actor: true,
          },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return incident;
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

    // Add Email Job
    await this.notificationsQueue.add('send-email', {
      to: 'team@nexaops.com', // In real world, fetch subscribers
      subject: `Incident Updated: ${incident.title}`,
      text: `Status changed from ${incident.status} to ${dto.status}`,
    });

    return updated;
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
