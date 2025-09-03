import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  WhatsAppChat,
  MessageDirection,
  MessageStatus,
} from './entities/whatsapp-chat.entity';

export interface WhatsAppMessage {
  to: string;
  message?: string;
  type?: 'text' | 'image' | 'document' | 'template';
  mediaUrl?: string;
  fileName?: string;
  templateName?: string;
  templateData?: Record<string, any>;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components: any[];
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly httpClient: AxiosInstance;
  private readonly isEnabled: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRepository(WhatsAppChat)
    private whatsappChatsRepository: Repository<WhatsAppChat>,
  ) {
    const apiKey = this.configService.get<string>('WHATSAPP_API_KEY');
    const apiUrl = this.configService.get<string>(
      'WHATSAPP_API_URL',
      'https://graph.facebook.com/v17.0',
    );

    this.isEnabled = !!(apiKey && apiUrl);

    if (this.isEnabled) {
      this.httpClient = axios.create({
        baseURL: apiUrl,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('WhatsApp service initialized successfully');
    } else {
      this.logger.warn('WhatsApp service disabled - missing API credentials');
    }
  }

  async sendMessage(messageData: WhatsAppMessage): Promise<any> {
    if (!this.isEnabled) {
      this.logger.warn('WhatsApp service disabled - message not sent');
      return { success: false, message: 'WhatsApp service disabled' };
    }

    try {
      let messagePayload: any;

      switch (messageData.type) {
        case 'image':
          messagePayload = {
            messaging_product: 'whatsapp',
            to: messageData.to,
            type: 'image',
            image: {
              link: messageData.mediaUrl,
            },
          };
          break;

        case 'document':
          messagePayload = {
            messaging_product: 'whatsapp',
            to: messageData.to,
            type: 'document',
            document: {
              link: messageData.mediaUrl,
              filename: messageData.fileName,
            },
          };
          break;

        case 'template':
          messagePayload = {
            messaging_product: 'whatsapp',
            to: messageData.to,
            type: 'template',
            template: {
              name: messageData.templateName,
              language: { code: 'en_US' },
              components: messageData.templateData?.components || [],
            },
          };
          break;

        default: // text
          messagePayload = {
            messaging_product: 'whatsapp',
            to: messageData.to,
            type: 'text',
            text: {
              body: messageData.message,
            },
          };
      }

      const phoneNumberId = this.configService.get<string>(
        'WHATSAPP_PHONE_NUMBER_ID',
      );
      const response = await this.httpClient.post(
        `/${phoneNumberId}/messages`,
        messagePayload,
      );

      // Log the message
      await this.logMessage({
        from_phone: phoneNumberId,
        to_phone: messageData.to,
        message_type: messageData.type || 'text',
        message_content: messageData.message,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.SENT,
        metadata: messagePayload,
      });

      this.logger.log(`WhatsApp message sent to ${messageData.to}`);
      return { success: true, data: response.data };
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp message: ${error.message}`,
        error.stack,
      );
      return { success: false, error: error.message };
    }
  }

  async sendLeadWelcomeMessage(
    phoneNumber: string,
    leadName: string,
    companyName: string,
  ): Promise<any> {
    const message = `مرحباً ${leadName}! 👋

شكراً لتواصلك مع ${companyName}.

سنقوم بمساعدتك في العثور على العقار المثالي لك.

هل يمكنك إخبارنا بما تبحث عنه بالضبط؟
🏠 نوع العقار
💰 الميزانية المتاحة
📍 الموقع المفضل

نحن هنا لمساعدتك! 😊`;

    return this.sendMessage({
      to: phoneNumber,
      message,
      type: 'text',
    });
  }

  async sendPropertyDetailsMessage(
    phoneNumber: string,
    propertyData: any,
  ): Promise<any> {
    const message = `🏠 ${propertyData.title}

📍 ${propertyData.address}
💰 السعر: ${propertyData.price?.toLocaleString()} ريال
🛏️ غرف نوم: ${propertyData.bedrooms}
🛁 دورات مياه: ${propertyData.bathrooms}
📐 المساحة: ${propertyData.area} م²

${propertyData.description}

هل تريد معرفة المزيد عن هذا العقار؟`;

    const result = await this.sendMessage({
      to: phoneNumber,
      message,
      type: 'text',
    });

    // Send property image if available
    if (propertyData.images && propertyData.images.length > 0) {
      await this.sendMessage({
        to: phoneNumber,
        type: 'image',
        mediaUrl: propertyData.images[0],
      });
    }

    return result;
  }

  async sendAppointmentReminder(
    phoneNumber: string,
    appointmentData: any,
  ): Promise<any> {
    const message = `⏰ تذكير بميعادك

📅 ${appointmentData.date}
🕐 ${appointmentData.time}
📍 ${appointmentData.location}
👤 ${appointmentData.agentName}

نتطلع لرؤيتك!`;

    return this.sendMessage({
      to: phoneNumber,
      message,
      type: 'text',
    });
  }

  async sendFollowUpMessage(
    phoneNumber: string,
    daysSinceLastContact: number,
  ): Promise<any> {
    let message = '';

    if (daysSinceLastContact === 0) {
      message = 'كيف كان الميعاد اليوم؟ هل تحتاج مساعدة في أي شيء؟';
    } else if (daysSinceLastContact <= 3) {
      message = 'مرحباً! كيف حالك؟ هل لديك أي أسئلة حول العقارات؟';
    } else {
      message =
        'مرحباً! نتمنى أن تكون بخير. هل ما زلت تبحث عن عقار؟ يمكننا مساعدتك!';
    }

    return this.sendMessage({
      to: phoneNumber,
      message,
      type: 'text',
    });
  }

  async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    templateData?: any,
  ): Promise<any> {
    return this.sendMessage({
      to: phoneNumber,
      type: 'template',
      templateName,
      templateData,
    });
  }

  async getMessageTemplates(): Promise<WhatsAppTemplate[]> {
    // Return predefined templates
    return [
      {
        name: 'welcome_message',
        language: 'ar',
        components: [
          {
            type: 'body',
            text: 'مرحباً {{1}}! شكراً لتواصلك مع {{2}}.',
          },
        ],
      },
      {
        name: 'appointment_reminder',
        language: 'ar',
        components: [
          {
            type: 'body',
            text: 'تذكير بميعادك في {{1}} الساعة {{2}}.',
          },
        ],
      },
      {
        name: 'property_inquiry',
        language: 'ar',
        components: [
          {
            type: 'body',
            text: 'شكراً لاستفسارك عن {{1}}. سنتواصل معك قريباً.',
          },
        ],
      },
    ];
  }

  async logMessage(messageData: Partial<WhatsAppChat>): Promise<WhatsAppChat> {
    const message = this.whatsappChatsRepository.create({
      ...messageData,
      created_at: new Date(),
    });

    return this.whatsappChatsRepository.save(message);
  }

  async getChatHistory(
    phoneNumber: string,
    limit: number = 50,
  ): Promise<WhatsAppChat[]> {
    return this.whatsappChatsRepository.find({
      where: [{ from_phone: phoneNumber }, { to_phone: phoneNumber }],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getMessageStatistics(companyId: string): Promise<any> {
    const totalMessages = await this.whatsappChatsRepository.count({
      where: { company_id: companyId },
    });

    const outboundMessages = await this.whatsappChatsRepository.count({
      where: { company_id: companyId, direction: MessageDirection.OUTBOUND },
    });

    const inboundMessages = await this.whatsappChatsRepository.count({
      where: { company_id: companyId, direction: MessageDirection.INBOUND },
    });

    const recentMessages = await this.whatsappChatsRepository.count({
      where: {
        company_id: companyId,
        created_at: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
      },
    });

    return {
      totalMessages,
      outboundMessages,
      inboundMessages,
      recentMessages,
      responseRate:
        totalMessages > 0 ? (inboundMessages / totalMessages) * 100 : 0,
    };
  }

  // Webhook handler for incoming messages
  async handleIncomingMessage(webhookData: any): Promise<any> {
    try {
      const { from, text, type } = webhookData;

      // Log the incoming message
      await this.logMessage({
        from_phone: from,
        message_type: type,
        message_content: text?.body || '',
        direction: MessageDirection.INBOUND,
        status: MessageStatus.RECEIVED,
        metadata: webhookData,
      });

      // Here you could implement auto-response logic
      // For example, respond to common queries

      this.logger.log(`Incoming WhatsApp message from ${from}`);

      return { success: true, message: 'Message processed successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to process incoming WhatsApp message: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  // Bulk messaging for campaigns
  async sendBulkMessages(messages: WhatsAppMessage[]): Promise<any[]> {
    const results: any[] = [];

    for (const message of messages) {
      const result = await this.sendMessage(message);
      results.push(result);

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return results;
  }

  // Campaign management
  async createCampaign(
    name: string,
    messages: WhatsAppMessage[],
    scheduleTime?: Date,
  ): Promise<any> {
    // In a real implementation, you would store campaign data
    // and schedule messages for future sending

    if (scheduleTime && scheduleTime > new Date()) {
      // Schedule for future
      return {
        success: true,
        campaignId: `campaign_${Date.now()}`,
        status: 'scheduled',
        scheduledFor: scheduleTime,
      };
    } else {
      // Send immediately
      const results = await this.sendBulkMessages(messages);
      return {
        success: true,
        campaignId: `campaign_${Date.now()}`,
        status: 'completed',
        results,
      };
    }
  }
}
