import { Injectable } from '@nestjs/common';
import { db, incidents } from '@nexaops/database';
import { desc, eq } from 'drizzle-orm';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  async create(dto: CreateIncidentDto, userId: string, tenantId: string) {
    const [incident] = await db
      .insert(incidents)
      .values({
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        status: 'OPEN',
        tenantId: tenantId,
        creatorId: userId,
      })
      .returning();

    return incident;
  }

  async findAll(tenantId: string) {
    return db.query.incidents.findMany({
      where: eq(incidents.tenantId, tenantId),
      orderBy: [desc(incidents.createdAt)],
      with: {
        creator: true,
      },
    });
  }
}
