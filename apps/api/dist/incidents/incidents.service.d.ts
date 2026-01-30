import { CreateIncidentDto } from './dto/create-incident.dto';
export declare class IncidentsService {
    create(dto: CreateIncidentDto, userId: string, tenantId: string): Promise<{
        title: string;
        description: string | null;
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        id: string;
        tenantId: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        creatorId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(tenantId: string): Promise<{
        title: string;
        description: string | null;
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        id: string;
        tenantId: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        creatorId: string | null;
        createdAt: Date;
        updatedAt: Date;
        creator: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            email: string;
            passwordHash: string;
            role: "ADMIN" | "RESPONDER" | "VIEWER";
        } | null;
    }[]>;
}
