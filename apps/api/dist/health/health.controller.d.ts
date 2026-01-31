import { HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { DrizzleHealthIndicator } from './drizzle.health';
export declare class HealthController {
    private health;
    private memory;
    private db;
    constructor(health: HealthCheckService, memory: MemoryHealthIndicator, db: DrizzleHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
