import { Queue } from 'bullmq';
import { EventsGateway } from '../events/events.gateway';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
export declare class IncidentsService {
    private readonly eventsGateway;
    private notificationsQueue;
    constructor(eventsGateway: EventsGateway, notificationsQueue: Queue);
    create(dto: CreateIncidentDto, userId: string, tenantId: string): Promise<{
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
    findAll(tenantId: string): Promise<{
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
    findOne(id: string, tenantId: string): Promise<{
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
    updateStatus(id: string, dto: UpdateIncidentStatusDto, userId: string, tenantId: string): Promise<{
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
    addComment(id: string, message: string, userId: string, tenantId: string): Promise<{
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
