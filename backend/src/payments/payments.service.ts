import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Company } from '../companies/entities/company.entity';

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionDto {
  companyId: string;
  planId: string;
  paymentMethodId: string;
  trialDays?: number;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    properties: number;
    leads: number;
    deals: number;
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;
  private readonly isEnabled: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    this.isEnabled = !!stripeSecretKey;

    if (this.isEnabled) {
      this.stripe = new Stripe(stripeSecretKey || '', {
        apiVersion: '2025-07-30.basil' as any,
      });
      this.logger.log('Stripe payment service initialized successfully');
    } else {
      this.logger.warn('Stripe service disabled - missing API key');
    }
  }

  async createPaymentIntent(paymentData: CreatePaymentIntentDto): Promise<any> {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Payment service disabled',
        mock: true,
        clientSecret: 'mock_payment_intent_secret',
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency,
        description: paymentData.description,
        metadata: paymentData.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Log the payment intent
      await this.paymentsRepository.save({
        stripe_payment_id: paymentIntent.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        status: PaymentStatus.PENDING,
        metadata: paymentData.metadata,
        created_at: new Date(),
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    if (!this.isEnabled) {
      return { success: true, mock: true };
    }

    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Update payment status
      await this.paymentsRepository.update(
        { stripe_payment_id: paymentIntentId },
        {
          status: paymentIntent.status as PaymentStatus,
          updated_at: new Date(),
        },
      );

      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      };
    } catch (error) {
      this.logger.error(`Failed to confirm payment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async createSubscription(
    subscriptionData: CreateSubscriptionDto,
  ): Promise<any> {
    if (!this.isEnabled) {
      return {
        success: true,
        mock: true,
        subscriptionId: 'mock_subscription_id',
        status: 'active',
      };
    }

    try {
      const company = await this.companiesRepository.findOne({
        where: { id: subscriptionData.companyId },
      });

      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      // Create customer if doesn't exist
      let customerId = company.stripe_customer_id;
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          name: company.name,
          email: company.contact_email,
          metadata: {
            company_id: company.id,
          },
        });
        customerId = customer.id;

        // Update company with customer ID
        await this.companiesRepository.update(company.id, {
          stripe_customer_id: customerId,
        });
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: subscriptionData.planId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: subscriptionData.trialDays,
        metadata: {
          company_id: subscriptionData.companyId,
        },
      });

      // Save subscription record
      await this.subscriptionsRepository.save({
        stripe_subscription_id: subscription.id,
        company_id: subscriptionData.companyId,
        status: subscription.status as any,
        current_period_start: (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000)
          : new Date(),
        current_period_end: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : new Date(),
        trial_start: subscription.trial_start
          ? new Date(subscription.trial_start * 1000)
          : null,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        metadata: subscription.metadata as any,
        created_at: new Date(),
      } as any);

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent
          ?.client_secret,
      };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    if (!this.isEnabled) {
      return { success: true, mock: true };
    }

    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        },
      );

      // Update local record
      await this.subscriptionsRepository.update(
        { stripe_subscription_id: subscriptionId },
        {
          cancel_at_period_end: true,
          updated_at: new Date(),
        },
      );

      return {
        success: true,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<any> {
    if (!this.isEnabled) {
      return { success: true, mock: true };
    }

    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: false,
        },
      );

      // Update local record
      await this.subscriptionsRepository.update(
        { stripe_subscription_id: subscriptionId },
        {
          cancel_at_period_end: false,
          updated_at: new Date(),
        },
      );

      return {
        success: true,
        status: subscription.status,
      };
    } catch (error) {
      this.logger.error(`Failed to reactivate subscription: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    if (!this.isEnabled) {
      return {
        success: true,
        mock: true,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }

    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : new Date(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get subscription details: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  getAvailablePlans(): PaymentPlan[] {
    return [
      {
        id: 'price_free',
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        currency: 'SAR',
        interval: 'month',
        features: [
          'Up to 5 users',
          '100 leads per month',
          '50 properties',
          'Basic support',
        ],
        limits: {
          users: 5,
          properties: 50,
          leads: 100,
          deals: 50,
        },
      },
      {
        id: 'price_basic',
        name: 'Basic',
        description: 'Great for small real estate teams',
        price: 99,
        currency: 'SAR',
        interval: 'month',
        features: [
          'Up to 25 users',
          '1,000 leads per month',
          '500 properties',
          'WhatsApp integration',
          'Email support',
          'Basic analytics',
        ],
        limits: {
          users: 25,
          properties: 500,
          leads: 1000,
          deals: 500,
        },
      },
      {
        id: 'price_pro',
        name: 'Professional',
        description: 'Ideal for growing real estate businesses',
        price: 299,
        currency: 'SAR',
        interval: 'month',
        features: [
          'Up to 100 users',
          '5,000 leads per month',
          'Unlimited properties',
          'Advanced WhatsApp integration',
          'AI-powered insights',
          'Priority support',
          'Custom integrations',
        ],
        limits: {
          users: 100,
          properties: -1, // Unlimited
          leads: 5000,
          deals: -1,
        },
      },
      {
        id: 'price_enterprise',
        name: 'Enterprise',
        description: 'For large real estate organizations',
        price: 999,
        currency: 'SAR',
        interval: 'month',
        features: [
          'Unlimited users',
          'Unlimited leads',
          'Unlimited properties',
          'White-label solution',
          'Dedicated account manager',
          'Custom development',
          'On-premise deployment',
        ],
        limits: {
          users: -1,
          properties: -1,
          leads: -1,
          deals: -1,
        },
      },
    ];
  }

  async getPaymentHistory(companyId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { company_id: companyId },
      order: { created_at: 'DESC' },
    });
  }

  async getSubscriptionHistory(companyId: string): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { company_id: companyId },
      order: { created_at: 'DESC' },
    });
  }

  async generateInvoice(
    companyId: string,
    subscriptionId: string,
  ): Promise<any> {
    if (!this.isEnabled) {
      return {
        success: true,
        mock: true,
        invoiceId: 'mock_invoice_id',
        amount: 299,
        currency: 'SAR',
        status: 'paid',
      };
    }

    try {
      const subscription = await this.subscriptionsRepository.findOne({
        where: { stripe_subscription_id: subscriptionId },
      });

      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      // In a real implementation, you would generate a PDF invoice
      // and send it via email

      return {
        success: true,
        invoiceId: `inv_${Date.now()}`,
        subscriptionId,
        companyId,
        amount: 299,
        currency: 'SAR',
        periodStart: subscription.current_period_start,
        periodEnd: subscription.current_period_end,
        status: 'generated',
        downloadUrl: `https://api.echoops.com/invoices/inv_${Date.now()}.pdf`,
      };
    } catch (error) {
      this.logger.error(`Failed to generate invoice: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Webhook handler for Stripe events
  async handleStripeWebhook(event: any): Promise<any> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${event.type}`);
      }

      return { success: true, received: true };
    } catch (error) {
      this.logger.error(`Failed to handle webhook: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Update payment status
    await this.paymentsRepository.update(
      { stripe_payment_id: invoice.payment_intent },
      { status: PaymentStatus.SUCCEEDED, updated_at: new Date() },
    );

    this.logger.log(`Payment succeeded for invoice: ${invoice.id}`);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Update payment status
    await this.paymentsRepository.update(
      { stripe_payment_id: invoice.payment_intent },
      { status: PaymentStatus.FAILED, updated_at: new Date() },
    );

    this.logger.log(`Payment failed for invoice: ${invoice.id}`);
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    // Update subscription status
    await this.subscriptionsRepository.update(
      { stripe_subscription_id: subscription.id },
      {
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000,
        ),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date(),
      },
    );

    this.logger.log(`Subscription updated: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    // Update subscription status
    await this.subscriptionsRepository.update(
      { stripe_subscription_id: subscription.id },
      {
        status: SubscriptionStatus.CANCELED,
        updated_at: new Date(),
      },
    );

    this.logger.log(`Subscription deleted: ${subscription.id}`);
  }

  // Analytics and reporting
  async getPaymentAnalytics(companyId: string): Promise<any> {
    const payments = await this.getPaymentHistory(companyId);
    const subscriptions = await this.getSubscriptionHistory(companyId);

    const totalRevenue = payments
      .filter((p) => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = payments
      .filter(
        (p) =>
          p.status === 'succeeded' &&
          p.created_at.getMonth() === new Date().getMonth(),
      )
      .reduce((sum, p) => sum + p.amount, 0);

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === 'active',
    ).length;

    return {
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      paymentMethods: this.getPaymentMethodStats(payments),
      subscriptionTrends: this.getSubscriptionTrends(subscriptions),
      churnRate: this.calculateChurnRate(subscriptions),
    };
  }

  private getPaymentMethodStats(payments: Payment[]): any {
    // In a real implementation, you would analyze payment methods
    return {
      creditCard: payments.length,
      bankTransfer: 0,
      digitalWallet: 0,
    };
  }

  private getSubscriptionTrends(subscriptions: Subscription[]): any {
    const monthly = subscriptions.reduce((acc, sub) => {
      const month = sub.created_at.getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return monthly;
  }

  private calculateChurnRate(subscriptions: Subscription[]): number {
    const total = subscriptions.length;
    const canceled = subscriptions.filter(
      (s) => s.status === 'canceled',
    ).length;

    return total > 0 ? (canceled / total) * 100 : 0;
  }
}
