import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class DrizzleHealthIndicator extends HealthIndicator {
    isHealthy(key: string): Promise<HealthIndicatorResult>;
}
