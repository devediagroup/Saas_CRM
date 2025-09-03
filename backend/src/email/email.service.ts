import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    // Only create transporter if SMTP credentials are provided
    if (smtpConfig.auth.user && smtpConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(smtpConfig);
      this.logger.log('Email transporter initialized successfully');
    } else {
      this.logger.warn(
        'SMTP credentials not provided. Email service will be disabled.',
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        'Email transporter not initialized. Skipping email send.',
      );
      return false;
    }

    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_USER'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendWelcomeEmail(
    to: string,
    userName: string,
    companyName: string,
  ): Promise<boolean> {
    const subject = `Welcome to ${companyName} CRM`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to EchoOps CRM!</h2>
        <p>Dear ${userName},</p>
        <p>Welcome to <strong>${companyName}</strong>'s CRM system. You can now:</p>
        <ul>
          <li>Manage your leads and customers</li>
          <li>Track properties and deals</li>
          <li>Schedule and manage activities</li>
          <li>View comprehensive reports and analytics</li>
        </ul>
        <p>Login to your account to get started.</p>
        <p>Best regards,<br>EchoOps CRM Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendLeadAssignedEmail(
    to: string,
    leadName: string,
    agentName: string,
    companyName: string,
  ): Promise<boolean> {
    const subject = `New Lead Assigned: ${leadName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Lead Assigned</h2>
        <p>Dear ${agentName},</p>
        <p>A new lead has been assigned to you:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Lead Name:</strong> ${leadName}<br>
          <strong>Company:</strong> ${companyName}<br>
          <strong>Assigned Date:</strong> ${new Date().toLocaleDateString()}
        </div>
        <p>Please contact the lead as soon as possible to start the sales process.</p>
        <p>Best regards,<br>${companyName} CRM System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendDealStageChangedEmail(
    to: string,
    dealName: string,
    newStage: string,
    agentName: string,
    companyName: string,
  ): Promise<boolean> {
    const subject = `Deal Stage Changed: ${dealName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Deal Stage Updated</h2>
        <p>Dear ${agentName},</p>
        <p>The following deal has been moved to a new stage:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Deal:</strong> ${dealName}<br>
          <strong>New Stage:</strong> ${newStage}<br>
          <strong>Updated Date:</strong> ${new Date().toLocaleDateString()}
        </div>
        <p>Please take the necessary actions for this stage transition.</p>
        <p>Best regards,<br>${companyName} CRM System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendActivityReminderEmail(
    to: string,
    activityTitle: string,
    scheduledTime: Date,
    agentName: string,
    companyName: string,
  ): Promise<boolean> {
    const subject = `Activity Reminder: ${activityTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Activity Reminder</h2>
        <p>Dear ${agentName},</p>
        <p>This is a reminder for your upcoming activity:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Activity:</strong> ${activityTitle}<br>
          <strong>Scheduled Time:</strong> ${scheduledTime.toLocaleString()}<br>
          <strong>Company:</strong> ${companyName}
        </div>
        <p>Please be prepared for this activity.</p>
        <p>Best regards,<br>${companyName} CRM System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendOverdueActivityEmail(
    to: string,
    activityTitle: string,
    scheduledTime: Date,
    agentName: string,
    companyName: string,
  ): Promise<boolean> {
    const subject = `⚠️ Overdue Activity: ${activityTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Overdue Activity Alert</h2>
        <p>Dear ${agentName},</p>
        <p>The following activity is now overdue:</p>
        <div style="background-color: #ffeaea; border: 1px solid #e74c3c; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Activity:</strong> ${activityTitle}<br>
          <strong>Scheduled Time:</strong> ${scheduledTime.toLocaleString()}<br>
          <strong>Company:</strong> ${companyName}<br>
          <strong>Status:</strong> <span style="color: #e74c3c; font-weight: bold;">OVERDUE</span>
        </div>
        <p>Please update the activity status and take necessary actions.</p>
        <p>Best regards,<br>${companyName} CRM System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendWeeklyReportEmail(
    to: string,
    agentName: string,
    companyName: string,
    stats: any,
  ): Promise<boolean> {
    const subject = `Weekly CRM Report - ${companyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Weekly CRM Report</h2>
        <p>Dear ${agentName},</p>
        <p>Here's your weekly performance summary:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">This Week's Performance</h3>
          <ul>
            <li><strong>New Leads:</strong> ${stats.newLeads || 0}</li>
            <li><strong>Closed Deals:</strong> ${stats.closedDeals || 0}</li>
            <li><strong>Revenue Generated:</strong> ${stats.revenue || 0}</li>
            <li><strong>Activities Completed:</strong> ${stats.completedActivities || 0}</li>
            <li><strong>Conversion Rate:</strong> ${stats.conversionRate || 0}%</li>
          </ul>
        </div>

        <p>Keep up the great work!</p>
        <p>Best regards,<br>${companyName} CRM System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendPropertyInquiryEmail(
    to: string,
    propertyTitle: string,
    inquiryDetails: any,
    companyName: string,
  ): Promise<boolean> {
    const subject = `Property Inquiry: ${propertyTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Property Inquiry</h2>
        <p>Dear Agent,</p>
        <p>You have received a new inquiry for the following property:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Property:</strong> ${propertyTitle}<br>
          <strong>Company:</strong> ${companyName}<br>
          <strong>Inquiry Date:</strong> ${new Date().toLocaleDateString()}
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Inquiry Details:</h4>
          <p><strong>Name:</strong> ${inquiryDetails.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${inquiryDetails.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${inquiryDetails.phone || 'N/A'}</p>
          <p><strong>Message:</strong> ${inquiryDetails.message || 'N/A'}</p>
        </div>

        <p>Please respond to this inquiry as soon as possible.</p>
        <p>Best regards,<br>${companyName} CRM System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}
