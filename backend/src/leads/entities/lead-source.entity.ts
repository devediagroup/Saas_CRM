import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from './lead.entity';

export enum LeadSourceType {
  WEBSITE = 'website',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  EMAIL = 'email',
  PHONE = 'phone',
  WALK_IN = 'walk_in',
  ADVERTISING = 'advertising',
  OTHER = 'other',
}

export enum LeadSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('lead_sources')
export class LeadSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LeadSourceType,
    default: LeadSourceType.WEBSITE,
  })
  type: LeadSourceType;

  @Column({
    type: 'enum',
    enum: LeadSourceStatus,
    default: LeadSourceStatus.ACTIVE,
  })
  status: LeadSourceStatus;

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversion_rate: number;

  @Column({ type: 'int', default: 0 })
  total_leads: number;

  @Column({ type: 'int', default: 0 })
  converted_leads: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_revenue: number;

  @Column({ type: 'int', default: 0 })
  cost_per_lead: number;

  @Column({ nullable: true })
  tracking_url: string;

  @Column({ type: 'json', nullable: true })
  utm_parameters: Record<string, any>;

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

  @OneToMany(() => Lead, (lead) => lead.lead_source)
  leads: Lead[];
}
