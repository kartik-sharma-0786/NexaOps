import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { db } from '@nexaops/database';

@Injectable()
export class AppService {
  // Public banner: reports service/database status only.
  // Never expose tenant or user data here — this endpoint is unauthenticated.
  async getHello() {
    if (!process.env.DATABASE_URL) {
      return {
        service: 'NexaOps API',
        databaseStatus: 'missing',
        message:
          'Database not configured for this deployment. Set DATABASE_URL to a hosted Postgres instance.',
      };
    }

    try {
      await db.execute(sql`select 1`);
      return {
        service: 'NexaOps API',
        databaseStatus: 'connected',
        message: 'NexaOps API is running. See /api/docs for documentation.',
      };
    } catch {
      return {
        service: 'NexaOps API',
        databaseStatus: 'error',
        message:
          'Database connection failed for this deployment. Check DATABASE_URL and network access to Postgres.',
      };
    }
  }
}
