import { Module } from '@nestjs/common';
import { MonitorsModule } from '../monitors/monitors.module';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  imports: [MonitorsModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
