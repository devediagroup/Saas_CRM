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
import { Developer } from '../../developers/entities/developer.entity';
import { Property } from '../../properties/entities/property.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  MIXED_USE = 'mixed_use',
  INDUSTRIAL = 'industrial',
  INFRASTRUCTURE = 'infrastructure',
  OTHER = 'other',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.RESIDENTIAL,
  })
  type: ProjectType;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_completion_date: Date;

  @Column({ type: 'date', nullable: true })
  actual_completion_date: Date;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true })
  videos: string[];

  @Column({ type: 'json', nullable: true })
  documents: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_area: number; // in square meters

  @Column({ type: 'int', nullable: true })
  total_units: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_investment: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  current_investment: number;

  @Column({ type: 'int', nullable: true })
  floors: number;

  @Column({ type: 'json', nullable: true })
  amenities: string[];

  @Column({ type: 'json', nullable: true })
  features: string[];

  @Column({ type: 'json', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  progress_updates: Array<{
    date: Date;
    description: string;
    percentage: number;
    images?: string[];
  }>;

  @Column({ type: 'json', nullable: true })
  team: Array<{
    name: string;
    role: string;
    contact: string;
  }>;

  @Column({ type: 'json', nullable: true })
  milestones: Array<{
    name: string;
    description: string;
    target_date: Date;
    completed_date?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  }>;

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

  @Column('uuid')
  developer_id: string;

  @ManyToOne(() => Developer, (developer) => developer.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'developer_id' })
  developer: Developer;

  @OneToMany(() => Property, (property) => property.project)
  properties: Property[];
}
