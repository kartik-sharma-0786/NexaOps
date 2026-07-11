import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateOverrideDto } from './dto/create-override.dto';
import { UpsertScheduleDto } from './dto/upsert-schedule.dto';
import { OnCallService } from './oncall.service';

@Controller('oncall')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OnCallController {
  constructor(private readonly onCallService: OnCallService) {}

  @Get('schedule')
  getSchedule(@Request() req: any) {
    return this.onCallService.getSchedule(req.user.tenantId);
  }

  @Put('schedule')
  @Roles('OWNER', 'ADMIN')
  upsertSchedule(@Request() req: any, @Body() dto: UpsertScheduleDto) {
    return this.onCallService.upsertSchedule(dto, req.user.tenantId);
  }

  @Get('current')
  getCurrentOnCall(@Request() req: any) {
    return this.onCallService.getCurrentOnCall(req.user.tenantId);
  }

  @Get('members')
  getMembers(@Request() req: any) {
    return this.onCallService.getMembers(req.user.tenantId);
  }

  @Post('overrides')
  @Roles('OWNER', 'ADMIN')
  addOverride(@Request() req: any, @Body() dto: CreateOverrideDto) {
    return this.onCallService.addOverride(dto, req.user.tenantId);
  }

  @Delete('overrides/:id')
  @Roles('OWNER', 'ADMIN')
  removeOverride(@Request() req: any, @Param('id') id: string) {
    return this.onCallService.removeOverride(id, req.user.tenantId);
  }
}
