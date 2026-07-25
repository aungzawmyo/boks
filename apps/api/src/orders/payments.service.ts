import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Payment abstraction: uses Stripe when STRIPE_SECRET_KEY is configured,
 * otherwise falls back to a mock provider that auto-succeeds so the full
 * checkout flow works in local development.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe | null = null;

  constructor(config: ConfigService) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    if (key) {
      this.stripe = new Stripe(key);
      this.logger.log('Stripe payments enabled');
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set — using mock payments');
    }
  }

  get provider(): 'stripe' | 'mock' {
    return this.stripe ? 'stripe' : 'mock';
  }

  async createIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    orderNumber: string;
  }): Promise<{ intentId: string; clientSecret: string | null }> {
    if (!this.stripe) {
      return {
        intentId: `mock_pi_${params.orderId}`,
        clientSecret: null,
      };
    }
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency.toLowerCase(),
      metadata: { orderId: params.orderId, orderNumber: params.orderNumber },
      automatic_payment_methods: { enabled: true },
    });
    return { intentId: intent.id, clientSecret: intent.client_secret };
  }

  /** Returns true when the payment can be considered settled. */
  async verifyIntent(intentId: string | null): Promise<boolean> {
    if (!this.stripe) return true; // mock provider auto-succeeds
    if (!intentId) return false;
    const intent = await this.stripe.paymentIntents.retrieve(intentId);
    return intent.status === 'succeeded';
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event | null {
    if (!this.stripe) return null;
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
