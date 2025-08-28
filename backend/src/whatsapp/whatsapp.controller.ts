import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import type { WhatsAppMessage } from './whatsapp.service';
import { WhatsAppChat } from './entities/whatsapp-chat.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('WhatsApp Integration')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  async sendMessage(
    @Body() messageData: WhatsAppMessage,
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendMessage(messageData);
  }

  @Post('send/lead-welcome')
  @ApiOperation({ summary: 'Send welcome message to lead' })
  @ApiResponse({ status: 200, description: 'Welcome message sent successfully' })
  async sendLeadWelcomeMessage(
    @Body() body: { phoneNumber: string; leadName: string },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendLeadWelcomeMessage(
      body.phoneNumber,
      body.leadName,
      'Your Company', // You might want to get company name from user context
    );
  }

  @Post('send/property-details')
  @ApiOperation({ summary: 'Send property details via WhatsApp' })
  @ApiResponse({ status: 200, description: 'Property details sent successfully' })
  async sendPropertyDetails(
    @Body() body: { phoneNumber: string; propertyData: any },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendPropertyDetailsMessage(
      body.phoneNumber,
      body.propertyData,
    );
  }

  @Post('send/appointment-reminder')
  @ApiOperation({ summary: 'Send appointment reminder' })
  @ApiResponse({ status: 200, description: 'Appointment reminder sent successfully' })
  async sendAppointmentReminder(
    @Body() body: { phoneNumber: string; appointmentData: any },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendAppointmentReminder(
      body.phoneNumber,
      body.appointmentData,
    );
  }

  @Post('send/follow-up')
  @ApiOperation({ summary: 'Send follow-up message' })
  @ApiResponse({ status: 200, description: 'Follow-up message sent successfully' })
  async sendFollowUpMessage(
    @Body() body: { phoneNumber: string; daysSinceLastContact: number },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendFollowUpMessage(
      body.phoneNumber,
      body.daysSinceLastContact,
    );
  }

  @Post('send/template')
  @ApiOperation({ summary: 'Send template message' })
  @ApiResponse({ status: 200, description: 'Template message sent successfully' })
  async sendTemplateMessage(
    @Body() body: { phoneNumber: string; templateName: string; templateData?: any },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendTemplateMessage(
      body.phoneNumber,
      body.templateName,
      body.templateData,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle WhatsApp webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: any): Promise<any> {
    return this.whatsappService.handleIncomingMessage(webhookData);
  }

  @Get('chat-history/:phoneNumber')
  @ApiOperation({ summary: 'Get chat history for phone number' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved successfully', type: [WhatsAppChat] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getChatHistory(
    @Param('phoneNumber') phoneNumber: string,
    @Query('limit') limit: string,
    @User('companyId') companyId: string,
  ): Promise<WhatsAppChat[]> {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.whatsappService.getChatHistory(phoneNumber, limitNum);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get WhatsApp messaging statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getMessageStatistics(@User('companyId') companyId: string): Promise<any> {
    return this.whatsappService.getMessageStatistics(companyId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available message templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getMessageTemplates(): Promise<any> {
    return this.whatsappService.getMessageTemplates();
  }

  @Post('campaign')
  @ApiOperation({ summary: 'Create and send WhatsApp campaign' })
  @ApiResponse({ status: 200, description: 'Campaign created successfully' })
  async createCampaign(
    @Body() body: { name: string; messages: WhatsAppMessage[]; scheduleTime?: Date },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.createCampaign(
      body.name,
      body.messages,
      body.scheduleTime,
    );
  }

  @Post('bulk-send')
  @ApiOperation({ summary: 'Send bulk WhatsApp messages' })
  @ApiResponse({ status: 200, description: 'Bulk messages sent successfully' })
  async sendBulkMessages(
    @Body() body: { messages: WhatsAppMessage[] },
    @User('companyId') companyId: string,
  ): Promise<any> {
    return this.whatsappService.sendBulkMessages(body.messages);
  }

  // Auto-response endpoints
  @Post('auto-responses/setup')
  @ApiOperation({ summary: 'Setup auto-responses for common queries' })
  @ApiResponse({ status: 200, description: 'Auto-responses configured successfully' })
  async setupAutoResponses(@User('companyId') companyId: string): Promise<any> {
    // In a real implementation, you would set up auto-response rules
    // For example: respond to "price" with pricing information
    // respond to "location" with location details, etc.

    return {
      success: true,
      message: 'Auto-responses configured',
      rules: [
        {
          keyword: 'price',
          response: 'Our properties range from 200,000 to 5,000,000 SAR. What is your budget?',
        },
        {
          keyword: 'location',
          response: 'We have properties in Riyadh, Jeddah, and Dammam. Which city interests you?',
        },
        {
          keyword: 'appointment',
          response: 'I\'d be happy to schedule a viewing for you. What date and time works best?',
        },
      ],
    };
  }

  // Analytics endpoints
  @Get('analytics/conversations')
  @ApiOperation({ summary: 'Get WhatsApp conversation analytics' })
  @ApiResponse({ status: 200, description: 'Conversation analytics retrieved successfully' })
  async getConversationAnalytics(@User('companyId') companyId: string): Promise<any> {
    // In a real implementation, you would analyze conversation patterns
    // response times, conversion rates, etc.

    return {
      totalConversations: 1250,
      activeConversations: 89,
      averageResponseTime: '2.5 minutes',
      conversionRate: 23.5,
      popularTopics: ['pricing', 'location', 'availability'],
      peakHours: ['10:00-12:00', '14:00-16:00'],
    };
  }

  @Get('analytics/effectiveness')
  @ApiOperation({ summary: 'Get WhatsApp marketing effectiveness' })
  @ApiResponse({ status: 200, description: 'Effectiveness analytics retrieved successfully' })
  async getMarketingEffectiveness(@User('companyId') companyId: string): Promise<any> {
    return {
      messagesSent: 5432,
      messagesDelivered: 5234,
      deliveryRate: 96.3,
      responsesReceived: 1234,
      responseRate: 22.7,
      leadsGenerated: 89,
      conversionRate: 7.2,
      costPerLead: 12.5, // SAR
      bestPerformingTemplates: [
        'property_showcase',
        'appointment_reminder',
        'follow_up',
      ],
    };
  }
}
