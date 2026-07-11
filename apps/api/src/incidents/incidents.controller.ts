import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { INCIDENT_WRITE_ROLES } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddCommentDto } from './dto/add-comment.dto';
import { AssignIncidentDto } from './dto/assign-incident.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { ListIncidentsQueryDto } from './dto/list-incidents.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles(...INCIDENT_WRITE_ROLES)
  create(@Request() req: any, @Body() createIncidentDto: CreateIncidentDto) {
    const user = req.user;
    return this.incidentsService.create(
      createIncidentDto,
      user.userId,
      user.tenantId,
    );
  }

  @Get()
  findAll(@Request() req: any, @Query() query: ListIncidentsQueryDto) {
    const user = req.user;
    const assigneeId = query.assignee === 'me' ? user.userId : query.assignee;
    return this.incidentsService.findAll(user.tenantId, {
      assigneeId,
      status: query.status,
      severity: query.severity,
      q: query.q,
      page: query.page,
      limit: query.limit,
    });
  }

  // Must stay above the ':id' route.
  @Get('stats')
  stats(@Request() req: any) {
    return this.incidentsService.stats(req.user.tenantId);
  }

  @Get('analytics')
  analytics(@Request() req: any) {
    return this.incidentsService.analytics(req.user.tenantId);
  }

  @Patch(':id/assign')
  @Roles(...INCIDENT_WRITE_ROLES)
  assign(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AssignIncidentDto,
  ) {
    const user = req.user;
    return this.incidentsService.assign(
      id,
      dto.assigneeId ?? null,
      user.userId,
      user.tenantId,
    );
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    return this.incidentsService.findOne(id, user.tenantId);
  }

  @Patch(':id/status')
  @Roles(...INCIDENT_WRITE_ROLES)
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    const user = req.user;
    return this.incidentsService.updateStatus(
      id,
      dto,
      user.userId,
      user.tenantId,
    );
  }

  @Post(':id/summarize')
  summarize(@Request() req: any, @Param('id') id: string) {
    return this.incidentsService.summarize(id, req.user.tenantId);
  }

  @Post(':id/comments')
  addComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
  ) {
    const user = req.user;
    return this.incidentsService.addComment(
      id,
      dto.message,
      user.userId,
      user.tenantId,
    );
  }
}
