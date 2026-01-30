import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Request() req, @Body() createIncidentDto: CreateIncidentDto) {
    const user = req.user;
    return this.incidentsService.create(
      createIncidentDto,
      user.userId,
      user.tenantId,
    );
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user;
    return this.incidentsService.findAll(user.tenantId);
  }
}
