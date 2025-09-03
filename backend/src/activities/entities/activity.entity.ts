import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Property } from '../../properties/entities/property.entity';
import { Deal } from '../../deals/entities/deal.entity';

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  WHATSAPP = 'whatsapp',
  SITE_VISIT = 'site_visit',
  NOTE = 'note',
  TASK = 'task',
  FOLLOW_UP = 'follow_up',
  PRESENTATION = 'presentation',
  CONTRACT = 'contract',
  OTHER = 'other',
}

export enum ActivityStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.SCHEDULED,
  })
  status: ActivityStatus;

  @Column({
    type: 'enum',
    enum: ActivityPriority,
    default: ActivityPriority.MEDIUM,
  })
  priority: ActivityPriority;

  @Column({ type: 'datetime' })
  scheduled_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ type: 'json', nullable: true })
  participants: Record<string, any>[];

  @Column({ type: 'boolean', default: false })
  is_recurring: boolean;

  @Column({ nullable: true })
  recurrence_pattern: string;

  @Column({ type: 'boolean', default: false })
  send_notification: boolean;

  @Column({ type: 'int', default: 0 })
  reminder_minutes_before: number;

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { nullable: true })
  lead_id: string;

  @ManyToOne(() => Lead, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column('uuid', { nullable: true })
  property_id: string;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column('uuid', { nullable: true })
  deal_id: string;

  @ManyToOne(() => Deal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  // Virtual fields
  get is_overdue(): boolean {
    return (
      this.status === ActivityStatus.SCHEDULED && new Date() > this.scheduled_at
    );
  }

  get is_today(): boolean {
    const today = new Date();
    const activityDate = new Date(this.scheduled_at);
    return activityDate.toDateString() === today.toDateString();
  }

  get is_completed(): boolean {
    return this.status === ActivityStatus.COMPLETED;
  }

  get is_upcoming(): boolean {
    return (
      this.status === ActivityStatus.SCHEDULED && new Date() < this.scheduled_at
    );
  }
}
