import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { LeadSource } from './lead-source.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  company_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zip_code: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget_min: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget_max: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ nullable: true })
  timeline: string;

  @Column({ nullable: true })
  location_preference: string;

  @Column({ nullable: true })
  property_type_preference: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  requirements: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadPriority,
    default: LeadPriority.MEDIUM
  })
  priority: LeadPriority;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_converted: boolean;

  @Column({ type: 'date', nullable: true })
  converted_at: Date;

  @Column({ type: 'date', nullable: true })
  last_contacted_at: Date;

  @Column({ type: 'date', nullable: true })
  next_follow_up_at: Date;

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
  assigned_to_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @Column('uuid', { nullable: true })
  lead_source_id: string;

  @ManyToOne(() => LeadSource, { nullable: true })
  @JoinColumn({ name: 'lead_source_id' })
  lead_source: LeadSource;

  @OneToMany(() => Deal, deal => deal.lead)
  deals: Deal[];

  @OneToMany(() => Activity, activity => activity.lead)
  activities: Activity[];

  // Virtual fields
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
