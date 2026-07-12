import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EscalationService } from './escalation.service';

/**
 * Redis-free escalation engine: sweeps for overdue unacknowledged incidents
 * every minute. This is the escalation path in production, where no BullMQ
 * queue is available.
 */
@Injectable()
export class EscalationScheduler {
  private readonly logger = new Logger(EscalationScheduler.name);
  private running = false;

  constructor(private readonly escalationService: EscalationService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    if (this.running) return; // guard against overlapping runs on slow DBs
    this.running = true;
    try {
      const escalated = await this.escalationService.escalateOverdueIncidents();
      if (escalated > 0) {
        this.logger.log(`Escalation sweep: ${escalated} incident(s) escalated`);
      }
    } catch (err) {
      this.logger.error(`Escalation sweep failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }
}
