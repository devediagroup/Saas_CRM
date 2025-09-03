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
import { Project } from '../../projects/entities/project.entity';

export enum DeveloperStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum DeveloperType {
  REAL_ESTATE_DEVELOPER = 'real_estate_developer',
  CONSTRUCTION_COMPANY = 'construction_company',
  INVESTMENT_COMPANY = 'investment_company',
  PROPERTY_MANAGEMENT = 'property_management',
  OTHER = 'other',
}

@Entity('developers')
export class Developer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DeveloperType,
    default: DeveloperType.REAL_ESTATE_DEVELOPER,
  })
  type: DeveloperType;

  @Column({
    type: 'enum',
    enum: DeveloperStatus,
    default: DeveloperStatus.ACTIVE,
  })
  status: DeveloperStatus;

  @Column({ type: 'json', nullable: true })
  contact_info: {
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    website?: string;
  };

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ type: 'json', nullable: true })
  social_media: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };

  @Column({ type: 'json', nullable: true })
  business_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };

  @Column({ type: 'json', nullable: true })
  specializations: string[];

  @Column({ type: 'json', nullable: true })
  certifications: string[];

  @Column({ type: 'json', nullable: true })
  awards: string[];

  @Column({ type: 'int', default: 0 })
  years_experience: number;

  @Column({ type: 'int', default: 0 })
  completed_projects: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_investment: number;

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  seo_data: Record<string, any>;

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

  @OneToMany(() => Project, (project) => project.developer)
  projects: Project[];
}
