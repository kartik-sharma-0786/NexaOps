import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TEAM_MANAGE_ROLES } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  status(@Request() req: any) {
    return this.billingService.getStatus(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @Post('checkout')
  checkout(@Request() req: any) {
    return this.billingService.createCheckoutSession(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @Post('portal')
  portal(@Request() req: any) {
    return this.billingService.createPortalSession(req.user.tenantId);
  }

  // Called by Stripe, authenticated via signature over the raw body.
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(
      req.rawBody ?? Buffer.from(''),
      signature ?? '',
    );
  }
}
