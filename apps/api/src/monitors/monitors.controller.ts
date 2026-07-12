import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TEAM_MANAGE_ROLES } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateMonitorDto, UpdateMonitorDto } from './dto/monitor.dto';
import { MonitorsService } from './monitors.service';

@Controller('monitors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.monitorsService.findAll(req.user.tenantId);
  }

  @Post()
  @Roles(...TEAM_MANAGE_ROLES)
  create(@Request() req: any, @Body() dto: CreateMonitorDto) {
    return this.monitorsService.create(dto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles(...TEAM_MANAGE_ROLES)
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMonitorDto,
  ) {
    return this.monitorsService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(...TEAM_MANAGE_ROLES)
  remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.monitorsService.remove(id, req.user.tenantId);
  }
}
