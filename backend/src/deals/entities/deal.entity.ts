import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum DealStage {
  PROSPECT = 'prospect',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CONTRACT = 'contract',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

export enum DealPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum DealType {
  SALE = 'sale',
  RENT = 'rent',
  MANAGEMENT = 'management',
  CONSULTATION = 'consultation'
}

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({
    type: 'enum',
    enum: DealStage,
    default: DealStage.PROSPECT
  })
  stage: DealStage;

  @Column({
    type: 'enum',
    enum: DealPriority,
    default: DealPriority.MEDIUM
  })
  priority: DealPriority;

  @Column({
    type: 'enum',
    enum: DealType,
    default: DealType.SALE
  })
  deal_type: DealType;

  @Column({ type: 'int', default: 0 })
  probability: number; // 0-100

  @Column({ type: 'date', nullable: true })
  expected_close_date: Date;

  @Column({ type: 'date', nullable: true })
  actual_close_date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  requirements: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  competitors: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'date', nullable: true })
  last_activity_at: Date;

  @Column({ type: 'int', default: 0 })
  activity_count: number;

  @Column({ type: 'int', default: 0 })
  document_count: number;

  @Column({ type: 'json', nullable: true })
  documents: string[];

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
  assigned_to_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @OneToMany(() => Activity, activity => activity.deal)
  activities: Activity[];

  // Virtual fields
  get weighted_amount(): number {
    return (this.amount * this.probability) / 100;
  }

  get days_in_pipeline(): number {
    const endDate = this.actual_close_date || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.created_at.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get is_overdue(): boolean {
    return this.expected_close_date && this.expected_close_date < new Date() && !this.actual_close_date;
  }
}