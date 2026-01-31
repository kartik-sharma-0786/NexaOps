"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const database_1 = require("@nexaops/database");
const drizzle_orm_1 = require("drizzle-orm");
let DrizzleHealthIndicator = class DrizzleHealthIndicator extends terminus_1.HealthIndicator {
    async isHealthy(key) {
        try {
            await database_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
            return this.getStatus(key, true);
        }
        catch (error) {
            throw new terminus_1.HealthCheckError('DrizzleHealthCheckFailed', this.getStatus(key, false, { message: error.message }));
        }
    }
};
exports.DrizzleHealthIndicator = DrizzleHealthIndicator;
exports.DrizzleHealthIndicator = DrizzleHealthIndicator = __decorate([
    (0, common_1.Injectable)()
], DrizzleHealthIndicator);
//# sourceMappingURL=drizzle.health.js.map