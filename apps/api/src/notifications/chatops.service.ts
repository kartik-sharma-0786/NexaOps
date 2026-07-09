import { Injectable, Logger } from '@nestjs/common';
import { db, tenantIntegrations } from '@nexaops/database';
import { eq } from 'drizzle-orm';

/**
 * Sends incident notifications to a tenant's configured chat webhooks
 * (Slack / Discord). Failures are logged, never thrown — chat outages
 * must not break incident handling.
 */
@Injectable()
export class ChatopsService {
  private readonly logger = new Logger(ChatopsService.name);

  async notify(tenantId: string, text: string): Promise<void> {
    try {
      const [integration] = await db
        .select()
        .from(tenantIntegrations)
        .where(eq(tenantIntegrations.tenantId, tenantId));
      if (!integration) return;

      const jobs: Promise<void>[] = [];
      if (integration.slackWebhookUrl) {
        jobs.push(this.post(integration.slackWebhookUrl, { text }, 'Slack'));
      }
      if (integration.discordWebhookUrl) {
        jobs.push(
          this.post(
            integration.discordWebhookUrl,
            { content: text },
            'Discord',
          ),
        );
      }
      await Promise.allSettled(jobs);
    } catch (error) {
      this.logger.warn(`Chat notification failed: ${String(error)}`);
    }
  }

  private async post(
    url: string,
    body: Record<string, string>,
    label: string,
  ): Promise<void> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) {
        this.logger.warn(`${label} webhook responded ${res.status}`);
      }
    } catch (error) {
      this.logger.warn(`${label} webhook failed: ${String(error)}`);
    }
  }
}
