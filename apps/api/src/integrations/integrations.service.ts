import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { apiKeys, db, tenantIntegrations } from '@nexaops/database';
import { createHash, randomBytes } from 'crypto';
import { and, eq } from 'drizzle-orm';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function assertWebhookHost(url: string, allowedHosts: string[], label: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new BadRequestException(`${label} webhook URL is not a valid URL`);
  }
  if (parsed.protocol !== 'https:' || !allowedHosts.includes(parsed.hostname)) {
    throw new BadRequestException(
      `${label} webhook URL must be an https URL on ${allowedHosts.join(' or ')}`,
    );
  }
}

@Injectable()
export class IntegrationsService {
  // ---- Chat webhooks ----

  async getSettings(tenantId: string) {
    const [row] = await db
      .select()
      .from(tenantIntegrations)
      .where(eq(tenantIntegrations.tenantId, tenantId));
    return {
      slackConfigured: !!row?.slackWebhookUrl,
      discordConfigured: !!row?.discordWebhookUrl,
    };
  }

  async updateSettings(
    tenantId: string,
    slackWebhookUrl?: string | null,
    discordWebhookUrl?: string | null,
  ) {
    if (slackWebhookUrl) {
      assertWebhookHost(slackWebhookUrl, ['hooks.slack.com'], 'Slack');
    }
    if (discordWebhookUrl) {
      assertWebhookHost(
        discordWebhookUrl,
        ['discord.com', 'discordapp.com'],
        'Discord',
      );
    }

    const values = {
      // undefined = leave unchanged; '' or null = clear
      ...(slackWebhookUrl !== undefined && {
        slackWebhookUrl: slackWebhookUrl || null,
      }),
      ...(discordWebhookUrl !== undefined && {
        discordWebhookUrl: discordWebhookUrl || null,
      }),
      updatedAt: new Date(),
    };

    await db
      .insert(tenantIntegrations)
      .values({ tenantId, ...values })
      .onConflictDoUpdate({
        target: tenantIntegrations.tenantId,
        set: values,
      });

    return this.getSettings(tenantId);
  }

  // ---- API keys ----

  async createApiKey(tenantId: string, name?: string) {
    const key = `nxo_${randomBytes(24).toString('hex')}`;
    const [row] = await db
      .insert(apiKeys)
      .values({
        tenantId,
        name: name ?? 'Default',
        keyHash: hashKey(key),
      })
      .returning({ id: apiKeys.id, name: apiKeys.name });

    // The plaintext key is returned exactly once and never stored.
    return { id: row.id, name: row.name, key };
  }

  async listApiKeys(tenantId: string) {
    return db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId));
  }

  async revokeApiKey(tenantId: string, id: string) {
    const [row] = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.tenantId, tenantId)));
    if (!row) {
      throw new NotFoundException('API key not found');
    }
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
    return { message: 'API key revoked' };
  }

  /** Resolves an ingestion key to its tenant; throws 401 on unknown keys. */
  async resolveApiKey(key: string): Promise<string> {
    if (!key) {
      throw new UnauthorizedException('Missing x-api-key header');
    }
    const [row] = await db
      .select({ id: apiKeys.id, tenantId: apiKeys.tenantId })
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, hashKey(key)));
    if (!row) {
      throw new UnauthorizedException('Invalid API key');
    }
    void db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, row.id))
      .catch(() => {});
    return row.tenantId;
  }
}
