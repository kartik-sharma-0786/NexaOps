import { Injectable, NotFoundException } from '@nestjs/common';
import {
  db,
  onCallOverrides,
  onCallSchedules,
  tenantMembers,
  users,
} from '@nexaops/database';
import { and, eq, gte, lte } from 'drizzle-orm';
import { CreateOverrideDto } from './dto/create-override.dto';
import { UpsertScheduleDto } from './dto/upsert-schedule.dto';

@Injectable()
export class OnCallService {
  async getSchedule(tenantId: string) {
    const schedule = await db.query.onCallSchedules.findFirst({
      where: eq(onCallSchedules.tenantId, tenantId),
      with: { overrides: { with: { user: true } } },
    });
    if (!schedule) return null;

    const currentUserId = await this.resolveCurrentOnCall(schedule);
    return { ...schedule, currentUserId };
  }

  async upsertSchedule(dto: UpsertScheduleDto, tenantId: string) {
    const existing = await db.query.onCallSchedules.findFirst({
      where: eq(onCallSchedules.tenantId, tenantId),
    });

    const values = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.memberOrder !== undefined && { memberOrder: dto.memberOrder }),
      ...(dto.shiftDays !== undefined && { shiftDays: dto.shiftDays }),
      ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(onCallSchedules)
        .set(values)
        .where(eq(onCallSchedules.tenantId, tenantId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(onCallSchedules)
      .values({
        tenantId,
        name: dto.name ?? 'Primary',
        memberOrder: dto.memberOrder ?? [],
        shiftDays: dto.shiftDays ?? 7,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      })
      .returning();
    return created;
  }

  async getCurrentOnCall(tenantId: string) {
    const schedule = await db.query.onCallSchedules.findFirst({
      where: eq(onCallSchedules.tenantId, tenantId),
      with: { overrides: { with: { user: true } } },
    });

    if (!schedule || schedule.memberOrder.length === 0) return null;

    const now = new Date();

    // Check active overrides first
    const activeOverride = schedule.overrides.find(
      (o) => new Date(o.startsAt) <= now && new Date(o.endsAt) >= now,
    );
    if (activeOverride) {
      return { userId: activeOverride.userId, user: activeOverride.user, via: 'override' };
    }

    const userId = this.computeRotationUserId(schedule);
    if (!userId) return null;

    const [member] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return { userId, user: member ?? null, via: 'rotation' };
  }

  async getMembers(tenantId: string) {
    return db
      .select({ userId: tenantMembers.userId, name: users.name, email: users.email })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(eq(tenantMembers.tenantId, tenantId));
  }

  async addOverride(dto: CreateOverrideDto, tenantId: string) {
    const schedule = await db.query.onCallSchedules.findFirst({
      where: eq(onCallSchedules.tenantId, tenantId),
    });
    if (!schedule) throw new NotFoundException('No schedule found for this tenant');

    const [override] = await db
      .insert(onCallOverrides)
      .values({
        scheduleId: schedule.id,
        userId: dto.userId,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
      })
      .returning();
    return override;
  }

  async removeOverride(id: string, tenantId: string) {
    const schedule = await db.query.onCallSchedules.findFirst({
      where: eq(onCallSchedules.tenantId, tenantId),
    });
    if (!schedule) throw new NotFoundException('No schedule found');

    const [deleted] = await db
      .delete(onCallOverrides)
      .where(and(eq(onCallOverrides.id, id), eq(onCallOverrides.scheduleId, schedule.id)))
      .returning();

    if (!deleted) throw new NotFoundException('Override not found');
    return { deleted: true };
  }

  private computeRotationUserId(schedule: {
    memberOrder: string[];
    shiftDays: number;
    startDate: Date | string;
  }): string | null {
    const order = schedule.memberOrder;
    if (order.length === 0) return null;
    const start = new Date(schedule.startDate).getTime();
    const now = Date.now();
    const shiftMs = schedule.shiftDays * 24 * 60 * 60 * 1000;
    const idx = Math.floor((now - start) / shiftMs) % order.length;
    return order[idx < 0 ? 0 : idx];
  }

  private async resolveCurrentOnCall(schedule: {
    memberOrder: string[];
    shiftDays: number;
    startDate: Date | string;
    overrides: Array<{ userId: string; user: any; startsAt: Date | string; endsAt: Date | string }>;
  }): Promise<string | null> {
    const now = new Date();
    const active = schedule.overrides.find(
      (o) => new Date(o.startsAt) <= now && new Date(o.endsAt) >= now,
    );
    if (active) return active.userId;
    return this.computeRotationUserId(schedule);
  }
}
