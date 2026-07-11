import { Module } from '@nestjs/common';
import { OnCallController } from './oncall.controller';
import { OnCallService } from './oncall.service';

@Module({
  controllers: [OnCallController],
  providers: [OnCallService],
  exports: [OnCallService],
})
export class OnCallModule {}
