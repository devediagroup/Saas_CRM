import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import type {
  CreatePaymentIntentDto,
  CreateSubscriptionDto,
} from './payments.service';
import { Payment } from './entities/payment.entity';
import { Subscription } from './entities/subscription.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Payments & Subscriptions')
@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @Permissions('payments.create')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
  })
  async createPaymentIntent(
    @Body() paymentData: CreatePaymentIntentDto,
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.paymentsService.createPaymentIntent({
      ...paymentData,
      metadata: { ...paymentData.metadata, company_id: companyId },
    });
  }

  @Post('confirm-payment/:paymentIntentId')
  @Permissions('payments.update')
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmPayment(
    @Param('paymentIntentId') paymentIntentId: string,
  ): Promise<any> {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Post('create-subscription')
  @Permissions('payments.create')
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription created successfully',
  })
  async createSubscription(
    @Body() subscriptionData: CreateSubscriptionDto,
  ): Promise<any> {
    return this.paymentsService.createSubscription(subscriptionData);
  }

  @Post('cancel-subscription/:subscriptionId')
  @Permissions('payments.update')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<any> {
    return this.paymentsService.cancelSubscription(subscriptionId);
  }

  @Post('reactivate-subscription/:subscriptionId')
  @Permissions('payments.update')
  @ApiOperation({ summary: 'Reactivate subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription reactivated successfully',
  })
  async reactivateSubscription(
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<any> {
    return this.paymentsService.reactivateSubscription(subscriptionId);
  }

  @Get('subscription/:subscriptionId')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details retrieved successfully',
  })
  async getSubscriptionDetails(
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<any> {
    return this.paymentsService.getSubscriptionDetails(subscriptionId);
  }

  @Get('plans')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getAvailablePlans(): Promise<any> {
    return this.paymentsService.getAvailablePlans();
  }

  @Get('history/payments')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
    type: [Payment],
  })
  async getPaymentHistory(
    @User('companyId') companyId: string,
  ): Promise<Payment[]> {
    return this.paymentsService.getPaymentHistory(companyId);
  }

  @Get('history/subscriptions')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get subscription history' })
  @ApiResponse({
    status: 200,
    description: 'Subscription history retrieved successfully',
    type: [Subscription],
  })
  async getSubscriptionHistory(
    @User('companyId') companyId: string,
  ): Promise<Subscription[]> {
    return this.paymentsService.getSubscriptionHistory(companyId);
  }

  @Post('generate-invoice/:subscriptionId')
  @ApiOperation({ summary: 'Generate invoice' })
  @ApiResponse({ status: 200, description: 'Invoice generated successfully' })
  async generateInvoice(
    @Param('subscriptionId') subscriptionId: string,
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.paymentsService.generateInvoice(companyId, subscriptionId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: any): Promise<any> {
    return this.paymentsService.handleStripeWebhook(webhookData);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get payment analytics' })
  @ApiResponse({
    status: 200,
    description: 'Payment analytics retrieved successfully',
  })
  async getPaymentAnalytics(
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.paymentsService.getPaymentAnalytics(companyId);
  }

  // Subscription management endpoints
  @Get('current-subscription')
  @ApiOperation({ summary: 'Get current company subscription' })
  @ApiResponse({
    status: 200,
    description: 'Current subscription retrieved successfully',
  })
  async getCurrentSubscription(
    @User('companyId') companyId: string,
  ): Promise<any> {
    const subscriptions =
      await this.paymentsService.getSubscriptionHistory(companyId);
    const current = subscriptions.find((sub) => sub.is_active);

    if (!current) {
      return {
        success: true,
        subscription: null,
        plan: 'free',
        message: 'No active subscription found',
      };
    }

    return {
      success: true,
      subscription: current,
      plan: current.plan,
      limits: current.plan_limits,
      daysUntilRenewal: current.days_until_renewal,
      trialDaysRemaining: current.trial_days_remaining,
    };
  }

  @Post('upgrade-subscription')
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription upgraded successfully',
  })
  async upgradeSubscription(
    @Body() body: { newPlanId: string; paymentMethodId?: string },
    @User('companyId') companyId: string,
  ): Promise<any> {
    // In a real implementation, this would handle plan upgrades
    // For now, we'll return a mock response
    return {
      success: true,
      message: 'Subscription upgrade initiated',
      newPlan: body.newPlanId,
      effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  @Post('downgrade-subscription')
  @ApiOperation({ summary: 'Downgrade subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription downgraded successfully',
  })
  async downgradeSubscription(
    @Body() body: { newPlanId: string },
    @User('companyId') companyId: string,
  ): Promise<any> {
    // In a real implementation, this would handle plan downgrades
    return {
      success: true,
      message: 'Subscription will be downgraded at next billing cycle',
      newPlan: body.newPlanId,
      effectiveDate: 'Next billing cycle',
    };
  }

  // Usage tracking endpoints
  @Get('usage/current')
  @ApiOperation({ summary: 'Get current usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Current usage retrieved successfully',
  })
  async getCurrentUsage(@User('companyId') companyId: string): Promise<any> {
    // In a real implementation, you would calculate actual usage
    // For now, we'll return mock data
    return {
      success: true,
      usage: {
        users: { current: 12, limit: 25 },
        properties: { current: 45, limit: 500 },
        leads: { current: 234, limit: 1000 },
        deals: { current: 89, limit: 500 },
        whatsapp_messages: { current: 456, limit: 1000 },
        api_calls: { current: 3456, limit: 10000 },
      },
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  @Get('usage/history')
  @ApiOperation({ summary: 'Get usage history' })
  @ApiResponse({
    status: 200,
    description: 'Usage history retrieved successfully',
  })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getUsageHistory(
    @User('companyId') companyId: string,
    @Query('months') months: string = '6',
  ): Promise<any> {
    const monthsNum = parseInt(months);

    // Generate mock usage history
    const history: any[] = [];
    for (let i = monthsNum - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const usageHistory = {
        month: date.toISOString().substring(0, 7),
        users: Math.floor(Math.random() * 20) + 5,
        properties: Math.floor(Math.random() * 400) + 50,
        leads: Math.floor(Math.random() * 800) + 100,
        deals: Math.floor(Math.random() * 400) + 50,
        whatsapp_messages: Math.floor(Math.random() * 800) + 100,
        api_calls: Math.floor(Math.random() * 8000) + 1000,
      };
      history.push(usageHistory);
    }

    return {
      success: true,
      history,
      period: `${monthsNum} months`,
    };
  }

  // Billing and invoice endpoints
  @Get('invoices')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get invoice history' })
  @ApiResponse({
    status: 200,
    description: 'Invoice history retrieved successfully',
  })
  async getInvoiceHistory(@User('companyId') companyId: string): Promise<any> {
    // Generate mock invoice history
    const invoices: any[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const invoice = {
        id: `inv_${Date.now()}_${i}`,
        date: date.toISOString(),
        amount: 299,
        currency: 'SAR',
        status: i === 0 ? 'pending' : 'paid',
        downloadUrl: `https://api.echoops.com/invoices/inv_${Date.now()}_${i}.pdf`,
        period: {
          start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          end: new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0,
          ).toISOString(),
        },
      };
      invoices.push(invoice);
    }

    return {
      success: true,
      invoices,
      total: invoices.length,
    };
  }

  @Get('billing-info')
  @Permissions('payments.read')
  @ApiOperation({ summary: 'Get billing information' })
  @ApiResponse({
    status: 200,
    description: 'Billing information retrieved successfully',
  })
  async getBillingInfo(@User('companyId') companyId: string): Promise<any> {
    return {
      success: true,
      billingInfo: {
        companyName: 'Sample Real Estate Company',
        address: '123 Business District, Riyadh, Saudi Arabia',
        taxId: '1234567890',
        email: 'billing@company.com',
        phone: '+966501234567',
        paymentMethod: {
          type: 'credit_card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
        },
      },
    };
  }

  @Post('update-billing-info')
  @Permissions('payments.update')
  @ApiOperation({ summary: 'Update billing information' })
  @ApiResponse({
    status: 200,
    description: 'Billing information updated successfully',
  })
  async updateBillingInfo(
    @Body() billingInfo: any,
    @User('companyId') companyId: string,
  ): Promise<any> {
    // In a real implementation, you would update the billing information
    return {
      success: true,
      message: 'Billing information updated successfully',
      updatedInfo: billingInfo,
    };
  }

  @Post('update-payment-method')
  @Permissions('payments.update')
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method updated successfully',
  })
  async updatePaymentMethod(
    @Body() paymentMethodData: any,
    @User('companyId') companyId: string,
  ): Promise<any> {
    // In a real implementation, you would update the payment method with Stripe
    return {
      success: true,
      message: 'Payment method updated successfully',
      paymentMethod: {
        id: 'pm_mock_id',
        type: paymentMethodData.type,
        last4: '4242',
        brand: 'visa',
      },
    };
  }
}
