import { AddCommentDto } from './dto/add-comment.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { IncidentsService } from './incidents.service';
export declare class IncidentsController {
    private readonly incidentsService;
    constructor(incidentsService: IncidentsService);
    create(req: any, createIncidentDto: CreateIncidentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tenantId: string;
        title: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        creatorId: string | null;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tenantId: string;
        title: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        creatorId: string | null;
        creator: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
        } | null;
    }[]>;
    findOne(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tenantId: string;
        title: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        creatorId: string | null;
        creator: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            tenantId: string;
            incidentId: string;
            actorId: string | null;
            actionType: string;
            message: string;
            payload: unknown;
            actor: {
                id: string;
                name: string;
                createdAt: Date;
                email: string;
                passwordHash: string;
            } | null;
        }[];
    }>;
    updateStatus(req: any, id: string, dto: UpdateIncidentStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tenantId: string;
        title: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        creatorId: string | null;
        creator: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            tenantId: string;
            incidentId: string;
            actorId: string | null;
            actionType: string;
            message: string;
            payload: unknown;
            actor: {
                id: string;
                name: string;
                createdAt: Date;
                email: string;
                passwordHash: string;
            } | null;
        }[];
    }>;
    addComment(req: any, id: string, dto: AddCommentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        tenantId: string;
        title: string;
        status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
        severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        creatorId: string | null;
        creator: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            passwordHash: string;
        } | null;
        events: {
            id: string;
            createdAt: Date;
            tenantId: string;
            incidentId: string;
            actorId: string | null;
            actionType: string;
            message: string;
            payload: unknown;
            actor: {
                id: string;
                name: string;
                createdAt: Date;
                email: string;
                passwordHash: string;
            } | null;
        }[];
    }>;
}
