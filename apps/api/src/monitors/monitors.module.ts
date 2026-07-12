import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { MonitorsController } from './monitors.controller';
import { MonitorsScheduler } from './monitors.scheduler';
import { MonitorsService } from './monitors.service';

@Module({
  imports: [IncidentsModule],
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsScheduler],
  exports: [MonitorsService],
})
export class MonitorsModule {}
