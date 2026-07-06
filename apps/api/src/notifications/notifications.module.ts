import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';

const queueEnabled = process.env.NOTIFICATIONS_QUEUE_ENABLED !== 'false';

@Module({
  imports: queueEnabled
    ? [
        BullModule.registerQueue({
          name: 'notifications',
        }),
      ]
    : [],
  providers: [
    NotificationsService,
    ...(queueEnabled ? [NotificationsProcessor] : []),
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
