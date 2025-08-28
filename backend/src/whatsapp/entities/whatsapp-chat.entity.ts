import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  RECEIVED = 'received',
}

@Entity('whatsapp_chats')
export class WhatsAppChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  from_phone: string;

  @Column()
  to_phone: string;

  @Column()
  message_type: string; // text, image, document, template, etc.

  @Column({ type: 'text' })
  message_content: string;

  @Column({
    type: 'enum',
    enum: MessageDirection,
  })
  direction: MessageDirection;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ nullable: true })
  message_id: string; // WhatsApp message ID

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional WhatsApp API response data

  @Column({ type: 'json', nullable: true })
  attachments: string[]; // URLs to media attachments

  @Column({ nullable: true })
  campaign_id: string; // For bulk campaign messages

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid', { nullable: true })
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column('uuid', { nullable: true })
  lead_id: string;

  @ManyToOne(() => Lead, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  // Virtual fields
  get is_inbound(): boolean {
    return this.direction === MessageDirection.INBOUND;
  }

  get is_outbound(): boolean {
    return this.direction === MessageDirection.OUTBOUND;
  }

  get is_successful(): boolean {
    return this.status !== MessageStatus.FAILED;
  }

  get time_ago(): string {
    const now = new Date();
    const diffInMs = now.getTime() - this.created_at.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  }

  get formatted_phone(): string {
    // Format phone number for display
    if (this.to_phone.startsWith('966')) {
      return `+${this.to_phone}`;
    }
    return this.to_phone;
  }
}
