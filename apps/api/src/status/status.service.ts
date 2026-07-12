import { Injectable, NotFoundException } from '@nestjs/common';
import {
  db,
  incidentEvents,
  incidents,
  monitors,
  tenants,
} from '@nexaops/database';
import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import { MonitorsService } from '../monitors/monitors.service';

const RECENT_DAYS = 7;

@Injectable()
export class StatusService {
  constructor(private readonly monitorsService: MonitorsService) {}

  async getStatus(slug: string) {
    const [tenant] = await db
      .select({ id: tenants.id, name: tenants.name, slug: tenants.slug })
      .from(tenants)
      .where(eq(tenants.slug, slug));

    if (!tenant) throw new NotFoundException('Status page not found');

    const since = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000);

    const recentIncidents = await db.query.incidents.findMany({
      where: and(
        eq(incidents.tenantId, tenant.id),
        gte(incidents.createdAt, since),
      ),
      orderBy: [desc(incidents.createdAt)],
      columns: {
        id: true,
        title: true,
        status: true,
        severity: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        events: {
          orderBy: [desc(incidentEvents.createdAt)],
          columns: { message: true, actionType: true, createdAt: true },
        },
      },
    });

    const active = recentIncidents.filter(
      (i) => i.status === 'OPEN' || i.status === 'ACKNOWLEDGED',
    );

    // Compute per-incident resolved timestamps from STATUS_CHANGE events.
    const enriched = recentIncidents.map((inc) => {
      const resolvedEvent = inc.events.find(
        (e) =>
          e.actionType === 'STATUS_CHANGE' && e.message.includes('RESOLVED'),
      );
      return {
        id: inc.id,
        title: inc.title,
        status: inc.status,
        severity: inc.severity,
        createdAt: inc.createdAt,
        resolvedAt: resolvedEvent?.createdAt ?? null,
        latestUpdate:
          inc.events[0]?.message ??
          (inc.status === 'OPEN' ? 'Investigating' : null),
      };
    });

    // Public uptime monitors for this tenant.
    const publicMonitors = await db
      .select({
        id: monitors.id,
        name: monitors.name,
        status: monitors.status,
        lastCheckedAt: monitors.lastCheckedAt,
        lastResponseMs: monitors.lastResponseMs,
      })
      .from(monitors)
      .where(
        and(
          eq(monitors.tenantId, tenant.id),
          eq(monitors.isPublic, true),
          eq(monitors.enabled, true),
        ),
      )
      .orderBy(monitors.createdAt);

    const dailyUptime =
      publicMonitors.length > 0
        ? await this.monitorsService.publicDailyUptime(tenant.id)
        : {};
    const monitorsWithHistory = publicMonitors.map((m) => {
      const days = dailyUptime[m.id] ?? [];
      const uptime30d =
        days.length > 0
          ? Math.round(
              (days.reduce((s, d) => s + d.pct, 0) / days.length) * 10,
            ) / 10
          : null;
      return { ...m, days, uptime30d };
    });

    let overallStatus: 'operational' | 'degraded' | 'outage' = 'operational';
    if (
      active.some((i) => i.severity === 'CRITICAL') ||
      publicMonitors.some((m) => m.status === 'DOWN')
    ) {
      overallStatus = 'outage';
    } else if (active.length > 0) {
      overallStatus = 'degraded';
    }

    return {
      tenant: { name: tenant.name, slug: tenant.slug },
      status: overallStatus,
      activeCount: active.length,
      incidents: enriched,
      monitors: monitorsWithHistory,
      updatedAt: new Date(),
    };
  }

  async getActiveIncidentIds(tenantIds: string[]): Promise<string[]> {
    if (tenantIds.length === 0) return [];
    const rows = await db
      .select({ id: incidents.id })
      .from(incidents)
      .where(
        and(
          inArray(incidents.tenantId, tenantIds),
          inArray(incidents.status, ['OPEN', 'ACKNOWLEDGED']),
        ),
      );
    return rows.map((r) => r.id);
  }
}
