import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { db, tenants } from '@nexaops/database';
import { createHmac, timingSafeEqual } from 'crypto';
import { eq } from 'drizzle-orm';
import Razorpay from 'razorpay';

// Razorpay subscriptions require a finite total_count of billing cycles.
// 120 monthly cycles = 10 years, effectively "recurring until cancelled"
// for a product at this stage.
const TOTAL_BILLING_CYCLES = 120;

type Actor = {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
};

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly razorpay?: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      this.logger.log('Razorpay billing configured');
    } else {
      this.logger.warn(
        'RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not set — billing endpoints are disabled',
      );
    }
  }

  private requireRazorpay(): Razorpay {
    if (!this.razorpay) {
      throw new ServiceUnavailableException(
        'Billing is not configured on this deployment',
      );
    }
    return this.razorpay;
  }

  private isConfigured(): boolean {
    return !!this.razorpay && !!process.env.RAZORPAY_PLAN_ID;
  }

  async getStatus(tenantId: string) {
    const [tenant] = await db
      .select({
        plan: tenants.plan,
        currentPeriodEnd: tenants.currentPeriodEnd,
        razorpaySubscriptionId: tenants.razorpaySubscriptionId,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      plan: tenant.plan,
      currentPeriodEnd: tenant.currentPeriodEnd,
      configured: this.isConfigured(),
      hasSubscription: !!tenant.razorpaySubscriptionId,
    };
  }

  async createSubscription(actor: Actor) {
    const razorpay = this.requireRazorpay();
    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      throw new ServiceUnavailableException(
        'RAZORPAY_PLAN_ID is not configured',
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: TOTAL_BILLING_CYCLES,
      notes: { tenantId: actor.tenantId },
    });

    return {
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  async verifyPayment(
    tenantId: string,
    paymentId: string,
    subscriptionId: string,
    signature: string,
  ) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new ServiceUnavailableException('Billing is not configured');
    }

    const expected = createHmac('sha256', keySecret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest('hex');

    if (!timingSafeEqualHex(expected, signature)) {
      throw new BadRequestException('Invalid payment signature');
    }

    await db
      .update(tenants)
      .set({
        plan: 'PRO',
        razorpaySubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    this.logger.log(`Tenant ${tenantId} upgraded to PRO (payment verified)`);
    return { message: 'Subscription activated' };
  }

  async cancelSubscription(tenantId: string) {
    const razorpay = this.requireRazorpay();
    const [tenant] = await db
      .select({ razorpaySubscriptionId: tenants.razorpaySubscriptionId })
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant?.razorpaySubscriptionId) {
      throw new BadRequestException(
        'No active subscription for this workspace',
      );
    }

    await razorpay.subscriptions.cancel(tenant.razorpaySubscriptionId);
    await db
      .update(tenants)
      .set({ plan: 'FREE', updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    return { message: 'Subscription cancelled' };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new ServiceUnavailableException(
        'RAZORPAY_WEBHOOK_SECRET is not configured',
      );
    }

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!signature || !timingSafeEqualHex(expected, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as {
      event: string;
      payload?: {
        subscription?: {
          entity?: {
            id: string;
            status: string;
            current_end?: number | null;
            notes?: { tenantId?: string };
          };
        };
      };
    };

    const sub = event.payload?.subscription?.entity;
    if (!sub) return { received: true };

    const tenantId = sub.notes?.tenantId ?? (await this.resolveTenant(sub.id));
    if (!tenantId) return { received: true };

    const activeStatuses = ['active', 'authenticated'];
    const isActive = activeStatuses.includes(sub.status);

    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted':
      case 'subscription.paused':
        await db
          .update(tenants)
          .set({
            plan: isActive ? 'PRO' : 'FREE',
            razorpaySubscriptionId: isActive ? sub.id : null,
            currentPeriodEnd: sub.current_end
              ? new Date(sub.current_end * 1000)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, tenantId));
        this.logger.log(
          `Tenant ${tenantId} plan set to ${isActive ? 'PRO' : 'FREE'} (${event.event})`,
        );
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async resolveTenant(subscriptionId: string): Promise<string | null> {
    const [tenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.razorpaySubscriptionId, subscriptionId));
    return tenant?.id ?? null;
  }
}
