import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { EscalationController } from './escalation.controller';
import { EscalationProcessor } from './escalation.processor';
import { EscalationScheduler } from './escalation.scheduler';
import { EscalationService } from './escalation.service';

const queueEnabled = process.env.NOTIFICATIONS_QUEUE_ENABLED !== 'false';

@Module({
  imports: [
    NotificationsModule,
    ...(queueEnabled ? [BullModule.registerQueue({ name: 'escalation' })] : []),
  ],
  controllers: [EscalationController],
  providers: [
    EscalationService,
    EscalationScheduler,
    ...(queueEnabled ? [EscalationProcessor] : []),
  ],
  exports: [EscalationService],
})
export class EscalationModule {}
