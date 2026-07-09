import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ChatopsService } from './chatops.service';
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
    ChatopsService,
    ...(queueEnabled ? [NotificationsProcessor] : []),
  ],
  exports: [NotificationsService, ChatopsService],
})
export class NotificationsModule {}
