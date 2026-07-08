import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TEAM_MANAGE_ROLES } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AcceptInviteDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from './dto/team.dto';
import { TeamService } from './team.service';

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // ---- Members (authenticated) ----

  @UseGuards(JwtAuthGuard)
  @Get('members')
  listMembers(@Request() req: any) {
    return this.teamService.listMembers(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Patch('members/:userId/role')
  updateRole(
    @Request() req: any,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamService.updateMemberRole(req.user, userId, dto.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Delete('members/:userId')
  removeMember(
    @Request() req: any,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.teamService.removeMember(req.user, userId);
  }

  // ---- Invitations ----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Post('invitations')
  invite(@Request() req: any, @Body() dto: InviteMemberDto) {
    return this.teamService.createInvitation(req.user, dto.email, dto.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Get('invitations')
  listInvitations(@Request() req: any) {
    return this.teamService.listInvitations(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @Delete('invitations/:id')
  revoke(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.teamService.revokeInvitation(req.user.tenantId, id);
  }

  // ---- Public accept flow ----

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('invitations/preview')
  preview(@Query('token') token: string) {
    return this.teamService.previewInvitation(token ?? '');
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('invitations/accept')
  accept(@Body() dto: AcceptInviteDto) {
    return this.teamService.acceptInvitation(dto.token, dto.password, dto.name);
  }
}
