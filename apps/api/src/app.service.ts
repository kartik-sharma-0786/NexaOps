import { Injectable } from '@nestjs/common';
import { db, tenants } from '@nexaops/database';

@Injectable()
export class AppService {
  async getHello() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      return {
        message:
          'Database not configured for this deployment. Set DATABASE_URL to a hosted Postgres instance.',
        tenants: [],
        databaseStatus: 'missing',
      };
    }

    try {
      const allTenants = await db.select().from(tenants);
      return {
        message: 'Hello World! Database is connected.',
        tenants: allTenants,
        databaseStatus: 'connected',
      };
    } catch {
      return {
        message:
          'Database connection failed for this deployment. Check DATABASE_URL and network access to Postgres.',
        tenants: [],
        databaseStatus: 'error',
      };
    }
  }
}
