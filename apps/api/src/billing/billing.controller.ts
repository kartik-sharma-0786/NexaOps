import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TEAM_MANAGE_ROLES } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BillingService } from './billing.service';
import { VerifyPaymentDto } from './dto/billing.dto';

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
    return this.billingService.createSubscription(req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  verify(@Request() req: any, @Body() dto: VerifyPaymentDto) {
    return this.billingService.verifyPayment(
      req.user.tenantId,
      dto.razorpay_payment_id,
      dto.razorpay_subscription_id,
      dto.razorpay_signature,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TEAM_MANAGE_ROLES)
  @HttpCode(HttpStatus.OK)
  @Post('cancel')
  cancel(@Request() req: any) {
    return this.billingService.cancelSubscription(req.user.tenantId);
  }

  // Called by Razorpay, authenticated via signature over the raw body.
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(
      req.rawBody ?? Buffer.from(''),
      signature ?? '',
    );
  }
}
