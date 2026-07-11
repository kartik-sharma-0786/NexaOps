import {
  Body,
  Controller,
  Delete,
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
import { UpsertEscalationPolicyDto } from './dto/upsert-escalation-policy.dto';
import { EscalationService } from './escalation.service';

@Controller('escalation-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EscalationController {
  constructor(private readonly escalationService: EscalationService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.escalationService.findAll(req.user.tenantId);
  }

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Request() req: any, @Body() dto: UpsertEscalationPolicyDto) {
    return this.escalationService.create(dto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpsertEscalationPolicyDto,
  ) {
    return this.escalationService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.escalationService.remove(id, req.user.tenantId);
  }
}
