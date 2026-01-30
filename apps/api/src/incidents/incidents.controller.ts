import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddCommentDto } from './dto/add-comment.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles('ADMIN', 'RESPONDER')
  create(@Request() req: any, @Body() createIncidentDto: CreateIncidentDto) {
    const user = req.user;
    return this.incidentsService.create(
      createIncidentDto,
      user.userId,
      user.tenantId,
    );
  }

  @Get()
  findAll(@Request() req: any) {
    const user = req.user;
    return this.incidentsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    return this.incidentsService.findOne(id, user.tenantId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'RESPONDER')
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
