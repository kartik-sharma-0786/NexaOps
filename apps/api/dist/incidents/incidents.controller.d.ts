import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentsService } from './incidents.service';
export declare class IncidentsController {
    private readonly incidentsService;
    constructor(incidentsService: IncidentsService);
    create(req: any, createIncidentDto: CreateIncidentDto): Promise<{
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
    findAll(req: any): Promise<{
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
