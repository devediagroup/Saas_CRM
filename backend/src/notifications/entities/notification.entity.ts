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

export enum NotificationType {
  LEAD_ASSIGNED = 'lead_assigned',
  DEAL_UPDATED = 'deal_updated',
  ACTIVITY_REMINDER = 'activity_reminder',
  ACTIVITY_OVERDUE = 'activity_overdue',
  PROPERTY_INQUIRY = 'property_inquiry',
  SYSTEM = 'system',
  PAYMENT = 'payment',
  REPORT = 'report',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  read_at: Date;

  @Column({ nullable: true })
  related_entity_id: string;

  @Column({ nullable: true })
  related_entity_type: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Virtual fields
  get is_overdue(): boolean {
    // For activity reminders, check if notification is older than 1 hour
    if (this.type === NotificationType.ACTIVITY_REMINDER) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return this.created_at < oneHourAgo;
    }
    return false;
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
}
