"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@nexaops/database");
const drizzle_orm_1 = require("drizzle-orm");
let IncidentsService = class IncidentsService {
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
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)()
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map