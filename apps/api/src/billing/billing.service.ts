import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { db, tenants } from '@nexaops/database';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

function getWebAppUrl(): string {
  return (
    process.env.WEB_APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.CORS_ORIGINS?.split(',')[0]?.trim() ??
    'http://localhost:3000'
  );
}

type Actor = {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe?: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key);
      this.logger.log('Stripe billing configured');
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY not set — billing endpoints are disabled',
      );
    }
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Billing is not configured on this deployment',
      );
    }
    return this.stripe;
  }

  async getStatus(tenantId: string) {
    const [tenant] = await db
      .select({
        plan: tenants.plan,
        currentPeriodEnd: tenants.currentPeriodEnd,
        stripeCustomerId: tenants.stripeCustomerId,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      plan: tenant.plan,
      currentPeriodEnd: tenant.currentPeriodEnd,
      configured: !!this.stripe && !!process.env.STRIPE_PRICE_ID,
      hasCustomer: !!tenant.stripeCustomerId,
    };
  }

  async createCheckoutSession(actor: Actor) {
    const stripe = this.requireStripe();
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      throw new ServiceUnavailableException(
        'STRIPE_PRICE_ID is not configured',
      );
    }

    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, actor.tenantId));
    if (!tenant) throw new NotFoundException('Tenant not found');

    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenant.name,
        email: actor.email,
        metadata: { tenantId: tenant.id },
      });
      customerId = customer.id;
      await db
        .update(tenants)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(tenants.id, tenant.id));
    }

    const webUrl = getWebAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${webUrl}/dashboard/settings?billing=success`,
      cancel_url: `${webUrl}/dashboard/settings?billing=cancelled`,
      metadata: { tenantId: tenant.id },
      subscription_data: { metadata: { tenantId: tenant.id } },
    });

    return { url: session.url };
  }

  async createPortalSession(tenantId: string) {
    const stripe = this.requireStripe();
    const [tenant] = await db
      .select({ stripeCustomerId: tenants.stripeCustomerId })
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (!tenant?.stripeCustomerId) {
      throw new BadRequestException('No billing account for this workspace');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${getWebAppUrl()}/dashboard/settings`,
    });
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const stripe = this.requireStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new ServiceUnavailableException(
        'STRIPE_WEBHOOK_SECRET is not configured',
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const tenantId = session.metadata?.tenantId;
        if (tenantId) {
          await db
            .update(tenants)
            .set({
              plan: 'PRO',
              stripeSubscriptionId:
                typeof session.subscription === 'string'
                  ? session.subscription
                  : (session.subscription?.id ?? null),
              updatedAt: new Date(),
            })
            .where(eq(tenants.id, tenantId));
          this.logger.log(`Tenant ${tenantId} upgraded to PRO`);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const tenantId = await this.resolveTenantForSubscription(sub);
        if (!tenantId) break;

        const active =
          event.type !== 'customer.subscription.deleted' &&
          (sub.status === 'active' || sub.status === 'trialing');

        const periodEndSeconds =
          (sub as unknown as { current_period_end?: number })
            .current_period_end ??
          sub.items?.data?.[0]?.current_period_end ??
          null;

        await db
          .update(tenants)
          .set({
            plan: active ? 'PRO' : 'FREE',
            stripeSubscriptionId: active ? sub.id : null,
            currentPeriodEnd: periodEndSeconds
              ? new Date(periodEndSeconds * 1000)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, tenantId));
        this.logger.log(
          `Tenant ${tenantId} plan set to ${active ? 'PRO' : 'FREE'} (${event.type})`,
        );
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  private async resolveTenantForSubscription(
    sub: Stripe.Subscription,
  ): Promise<string | null> {
    if (sub.metadata?.tenantId) return sub.metadata.tenantId;

    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
    if (!customerId) return null;

    const [tenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.stripeCustomerId, customerId));
    return tenant?.id ?? null;
  }
}
