import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { db } from '@nexaops/database';
import { sql } from 'drizzle-orm';

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!process.env.DATABASE_URL) {
      throw new HealthCheckError(
        'DrizzleHealthCheckFailed',
        this.getStatus(key, false, { message: 'DATABASE_URL is not set' }),
      );
    }

    try {
      await db.execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        'DrizzleHealthCheckFailed',
        this.getStatus(key, false, { message }),
      );
    }
  }
}
