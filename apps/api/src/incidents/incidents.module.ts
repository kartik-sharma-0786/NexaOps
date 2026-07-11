import { Module } from '@nestjs/common';
import { EscalationModule } from '../escalation/escalation.module';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiSummaryService } from './ai-summary.service';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [EventsModule, NotificationsModule, EscalationModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, AiSummaryService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
