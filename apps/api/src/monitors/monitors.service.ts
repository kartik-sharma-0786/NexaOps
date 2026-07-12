import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { db, incidentEvents, monitorChecks, monitors } from '@nexaops/database';
import { and, desc, eq, gte, isNull, lt, lte, or, sql } from 'drizzle-orm';
import { IncidentsService } from '../incidents/incidents.service';
import { CreateMonitorDto, UpdateMonitorDto } from './dto/monitor.dto';

const CHECK_TIMEOUT_MS = 10_000;

type MonitorRow = typeof monitors.$inferSelect;

@Injectable()
export class MonitorsService {
  private readonly logger = new Logger(MonitorsService.name);

  constructor(private readonly incidentsService: IncidentsService) {}

  // ---- CRUD ----

  async findAll(tenantId: string) {
    return db
      .select()
      .from(monitors)
      .where(eq(monitors.tenantId, tenantId))
      .orderBy(monitors.createdAt);
  }

  async create(dto: CreateMonitorDto, tenantId: string) {
    const [monitor] = await db
      .insert(monitors)
      .values({
        tenantId,
        name: dto.name,
        url: dto.url,
        intervalMinutes: dto.intervalMinutes ?? 5,
        isPublic: dto.isPublic ?? true,
      })
      .returning();
    return monitor;
  }

  async update(id: string, dto: UpdateMonitorDto, tenantId: string) {
    const [monitor] = await db
      .update(monitors)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.intervalMinutes !== undefined && {
          intervalMinutes: dto.intervalMinutes,
        }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      })
      .where(and(eq(monitors.id, id), eq(monitors.tenantId, tenantId)))
      .returning();
    if (!monitor) throw new NotFoundException('Monitor not found');
    return monitor;
  }

  async remove(id: string, tenantId: string) {
    const [monitor] = await db
      .delete(monitors)
      .where(and(eq(monitors.id, id), eq(monitors.tenantId, tenantId)))
      .returning();
    if (!monitor) throw new NotFoundException('Monitor not found');
    return { deleted: true };
  }

  // ---- Checker (called by the cron scheduler) ----

  /** Check every enabled monitor whose interval has elapsed. */
  async checkDueMonitors(): Promise<number> {
    const due = await db
      .select()
      .from(monitors)
      .where(
        and(
          eq(monitors.enabled, true),
          or(
            isNull(monitors.lastCheckedAt),
            lte(
              monitors.lastCheckedAt,
              sql`now() - make_interval(mins => "monitors"."interval_minutes")`,
            ),
          ),
        ),
      );

    for (const monitor of due) {
      try {
        await this.checkOne(monitor);
      } catch (err) {
        this.logger.error(
          `Monitor check failed unexpectedly for ${monitor.id}: ${String(err)}`,
        );
      }
    }
    return due.length;
  }

  private async checkOne(monitor: MonitorRow): Promise<void> {
    const started = Date.now();
    let up = false;
    let error: string | null = null;
    let httpStatus: number | null = null;

    try {
      const res = await fetch(monitor.url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
        headers: { 'User-Agent': 'NexaOps-Monitor/1.0' },
      });
      httpStatus = res.status;
      up = res.status < 500; // 5xx and network failures count as down
      if (!up) error = `HTTP ${res.status}`;
    } catch (err) {
      error =
        err instanceof Error && err.name === 'TimeoutError'
          ? `Timed out after ${CHECK_TIMEOUT_MS / 1000}s`
          : String(err instanceof Error ? err.message : err).slice(0, 200);
    }
    const responseMs = Date.now() - started;

    // Record history (best-effort — a failed insert must not break the check)
    try {
      await db.insert(monitorChecks).values({
        monitorId: monitor.id,
        tenantId: monitor.tenantId,
        up,
        responseMs,
      });
    } catch (err) {
      this.logger.warn(`Failed to record check history: ${String(err)}`);
    }

    if (up) {
      await db
        .update(monitors)
        .set({
          status: 'UP',
          lastCheckedAt: new Date(),
          lastResponseMs: responseMs,
          lastError: null,
          incidentId: null,
        })
        .where(eq(monitors.id, monitor.id));

      // Recovered: auto-resolve the incident this monitor opened.
      if (monitor.status === 'DOWN' && monitor.incidentId) {
        await this.resolveIncident(monitor, responseMs, httpStatus);
      }
      return;
    }

    // Down. Keep the existing open incident if there is one.
    let incidentId = monitor.incidentId;
    if (monitor.status !== 'DOWN' || !incidentId) {
      incidentId = await this.openIncident(monitor, error ?? 'Unknown error');
    }

    await db
      .update(monitors)
      .set({
        status: 'DOWN',
        lastCheckedAt: new Date(),
        lastResponseMs: responseMs,
        lastError: error,
        incidentId,
      })
      .where(eq(monitors.id, monitor.id));
  }

  // ---- History & uptime ----

  /**
   * Per-monitor recent checks (for sparklines) plus 24h/7d uptime percentages.
   * Shaped as a map keyed by monitor id so the dashboard can join client-side.
   */
  async history(tenantId: string) {
    const uptimeRows = await db
      .select({
        monitorId: monitorChecks.monitorId,
        up24: sql<number | null>`
          avg(case when "monitor_checks"."up" then 1.0 else 0.0 end)
            filter (where "monitor_checks"."checked_at" >= now() - interval '24 hours')
        `,
        up7d: sql<number | null>`
          avg(case when "monitor_checks"."up" then 1.0 else 0.0 end)
        `,
      })
      .from(monitorChecks)
      .where(
        and(
          eq(monitorChecks.tenantId, tenantId),
          gte(monitorChecks.checkedAt, sql`now() - interval '7 days'`),
        ),
      )
      .groupBy(monitorChecks.monitorId);

    const tenantMonitors = await db
      .select({ id: monitors.id })
      .from(monitors)
      .where(eq(monitors.tenantId, tenantId));

    const out: Record<
      string,
      {
        checks: { t: Date; up: boolean; ms: number | null }[];
        uptime24h: number | null;
        uptime7d: number | null;
      }
    > = {};

    for (const { id } of tenantMonitors) {
      const recent = await db
        .select({
          t: monitorChecks.checkedAt,
          up: monitorChecks.up,
          ms: monitorChecks.responseMs,
        })
        .from(monitorChecks)
        .where(eq(monitorChecks.monitorId, id))
        .orderBy(desc(monitorChecks.checkedAt))
        .limit(30);

      const agg = uptimeRows.find((r) => r.monitorId === id);
      out[id] = {
        checks: recent.reverse(),
        uptime24h: agg?.up24 != null ? Math.round(Number(agg.up24) * 1000) / 10 : null,
        uptime7d: agg?.up7d != null ? Math.round(Number(agg.up7d) * 1000) / 10 : null,
      };
    }
    return out;
  }

  /** Daily uptime buckets for the public status page (last 30 days). */
  async publicDailyUptime(tenantId: string) {
    const rows = await db
      .select({
        monitorId: monitorChecks.monitorId,
        day: sql<string>`to_char(date_trunc('day', "monitor_checks"."checked_at"), 'YYYY-MM-DD')`,
        pct: sql<number>`avg(case when "monitor_checks"."up" then 1.0 else 0.0 end)`,
      })
      .from(monitorChecks)
      .where(
        and(
          eq(monitorChecks.tenantId, tenantId),
          gte(monitorChecks.checkedAt, sql`now() - interval '30 days'`),
        ),
      )
      .groupBy(monitorChecks.monitorId, sql`date_trunc('day', "monitor_checks"."checked_at")`);

    const byMonitor: Record<string, { day: string; pct: number }[]> = {};
    for (const r of rows) {
      (byMonitor[r.monitorId] ??= []).push({
        day: r.day,
        pct: Math.round(Number(r.pct) * 1000) / 10,
      });
    }
    for (const list of Object.values(byMonitor)) {
      list.sort((a, b) => a.day.localeCompare(b.day));
    }
    return byMonitor;
  }

  /** Drop check rows older than 30 days. Called hourly by the scheduler. */
  async pruneOldChecks(): Promise<void> {
    await db
      .delete(monitorChecks)
      .where(lt(monitorChecks.checkedAt, sql`now() - interval '30 days'`));
  }

  private async openIncident(
    monitor: MonitorRow,
    error: string,
  ): Promise<string | null> {
    try {
      const incident = await this.incidentsService.create(
        {
          title: `Monitor DOWN: ${monitor.name}`,
          description:
            `Uptime monitor "${monitor.name}" failed.\n\n` +
            `URL: ${monitor.url}\nError: ${error}\n\n` +
            `This incident was created automatically and will auto-resolve when the check recovers.`,
          severity: 'HIGH',
        },
        null,
        monitor.tenantId,
      );
      this.logger.warn(
        `Monitor "${monitor.name}" DOWN (${error}) — opened incident ${incident.id}`,
      );
      return incident.id;
    } catch (err) {
      this.logger.error(
        `Failed to open incident for monitor ${monitor.id}: ${String(err)}`,
      );
      return null;
    }
  }

  private async resolveIncident(
    monitor: MonitorRow,
    responseMs: number,
    httpStatus: number | null,
  ): Promise<void> {
    if (!monitor.incidentId) return;
    try {
      await this.incidentsService.updateStatus(
        monitor.incidentId,
        { status: 'RESOLVED' },
        null,
        monitor.tenantId,
      );
      await db.insert(incidentEvents).values({
        incidentId: monitor.incidentId,
        tenantId: monitor.tenantId,
        actionType: 'COMMENT',
        message: `Monitor "${monitor.name}" recovered (HTTP ${httpStatus ?? '?'}, ${responseMs}ms) — auto-resolved`,
      });
      this.logger.log(
        `Monitor "${monitor.name}" recovered — resolved incident ${monitor.incidentId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to auto-resolve incident ${monitor.incidentId}: ${String(err)}`,
      );
    }
  }
}
