import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { db, escalationPolicies } from '@nexaops/database';
import { Queue } from 'bullmq';
import { and, eq } from 'drizzle-orm';
import { UpsertEscalationPolicyDto } from './dto/upsert-escalation-policy.dto';

@Injectable()

export class EscalationService {
  constructor(
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
}
