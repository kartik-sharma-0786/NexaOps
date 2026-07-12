import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MonitorsService } from './monitors.service';

@Injectable()
export class MonitorsScheduler {
  private readonly logger = new Logger(MonitorsScheduler.name);
  private running = false;

  constructor(private readonly monitorsService: MonitorsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    if (this.running) return; // slow checks must not overlap the next tick
    this.running = true;
    try {
      const checked = await this.monitorsService.checkDueMonitors();
      if (checked > 0) {
        this.logger.debug(`Monitor sweep: ${checked} check(s) run`);
      }
    } catch (err) {
      this.logger.error(`Monitor sweep failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }
}
