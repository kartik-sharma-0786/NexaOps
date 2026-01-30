import { Injectable } from '@nestjs/common';
import { db, tenants } from '@nexaops/database';

@Injectable()
export class AppService {
  async getHello() {
    // Determine if DB is connected by fetching tenants
    try {
      const allTenants = await db.select().from(tenants);
      return {
        message: 'Hello World! Database is connected.',
        tenants: allTenants,
      };
    } catch (e) {
      return {
        message: 'Database error',
        error: e,
      };
    }
  }
}
