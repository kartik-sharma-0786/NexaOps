"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@nexaops/database");
const drizzle_orm_1 = require("drizzle-orm");
const events_gateway_1 = require("../events/events.gateway");
let IncidentsService = class IncidentsService {
    eventsGateway;
    constructor(eventsGateway) {
        this.eventsGateway = eventsGateway;
    }
    async create(dto, userId, tenantId) {
        const [incident] = await database_1.db
            .insert(database_1.incidents)
            .values({
            title: dto.title,
            description: dto.description,
            severity: dto.severity,
            status: 'OPEN',
            tenantId: tenantId,
            creatorId: userId,
        })
            .returning();
        const incidentWithCreator = await database_1.db.query.incidents.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.incidents.id, incident.id),
            with: {
                creator: true,
            },
        });
        this.eventsGateway.server
            .to(`tenant:${tenantId}`)
            .emit('incidentCreated', incidentWithCreator);
        return incident;
    }
    async findAll(tenantId) {
        return database_1.db.query.incidents.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.incidents.tenantId, tenantId),
            orderBy: [(0, drizzle_orm_1.desc)(database_1.incidents.createdAt)],
            with: {
                creator: true,
            },
        });
    }
    async findOne(id, tenantId) {
        const incident = await database_1.db.query.incidents.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.incidents.id, id), (0, drizzle_orm_1.eq)(database_1.incidents.tenantId, tenantId)),
            with: {
                creator: true,
                events: {
                    orderBy: [(0, drizzle_orm_1.desc)(database_1.incidentEvents.createdAt)],
                    with: {
                        actor: true,
                    },
                },
            },
        });
        if (!incident) {
            throw new common_1.NotFoundException('Incident not found');
        }
        return incident;
    }
    async updateStatus(id, dto, userId, tenantId) {
        const incident = await this.findOne(id, tenantId);
        if (incident.status === dto.status)
            return incident;
        await database_1.db.transaction(async (tx) => {
            await tx
                .update(database_1.incidents)
                .set({ status: dto.status })
                .where((0, drizzle_orm_1.eq)(database_1.incidents.id, id));
            await tx.insert(database_1.incidentEvents).values({
                incidentId: id,
                tenantId: tenantId,
                actorId: userId,
                actionType: 'STATUS_CHANGE',
                message: `Changed status from ${incident.status} to ${dto.status}`,
                payload: { oldStatus: incident.status, newStatus: dto.status },
            });
        });
        const updated = await this.findOne(id, tenantId);
        this.eventsGateway.server
            .to(`tenant:${tenantId}`)
            .emit('incidentUpdated', updated);
        return updated;
    }
    async addComment(id, message, userId, tenantId) {
        await this.findOne(id, tenantId);
        await database_1.db.insert(database_1.incidentEvents).values({
            incidentId: id,
            tenantId: tenantId,
            actorId: userId,
            actionType: 'COMMENT',
            message: message,
        });
        const updated = await this.findOne(id, tenantId);
        this.eventsGateway.server
            .to(`tenant:${tenantId}`)
            .emit('incidentUpdated', updated);
        return updated;
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_gateway_1.EventsGateway])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map