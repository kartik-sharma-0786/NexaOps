import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TEAM_MANAGE_ROLES } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { IncidentsService } from '../incidents/incidents.service';
import {
  CreateApiKeyDto,
  IngestAlertDto,
  UpdateIntegrationsDto,
} from './dto/integrations.dto';
import { IntegrationsService } from './integrations.service';

@Controller()
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly incidentsService: IncidentsService,
  ) {}

  // ---- Chat webhook settings (OWNER/ADMIN) ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Get('integrations')
  getSettings(@Request() req: any) {
    return this.integrationsService.getSettings(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Put('integrations')
  updateSettings(@Request() req: any, @Body() dto: UpdateIntegrationsDto) {
    return this.integrationsService.updateSettings(
      req.user.tenantId,
      dto.slackWebhookUrl,
      dto.discordWebhookUrl,
    );
  }

  // ---- API keys (OWNER/ADMIN) ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Post('integrations/api-keys')
  createKey(@Request() req: any, @Body() dto: CreateApiKeyDto) {
    return this.integrationsService.createApiKey(req.user.tenantId, dto.name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Get('integrations/api-keys')
  listKeys(@Request() req: any) {
    return this.integrationsService.listApiKeys(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Delete('integrations/api-keys/:id')
  revokeKey(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.integrationsService.revokeApiKey(req.user.tenantId, id);
  }

  // ---- Public alert ingestion (monitoring tools) ----

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('alerts/ingest')
  async ingest(
    @Headers('x-api-key') apiKey: string,
    @Body() dto: IngestAlertDto,
  ) {
    const tenantId = await this.integrationsService.resolveApiKey(apiKey);
    const incident = await this.incidentsService.create(
      {
        title: dto.title,
        description: dto.description,
        severity: dto.severity ?? 'MEDIUM',
      },
      null,
      tenantId,
    );
    return { id: incident.id, status: incident.status };
  }
}
