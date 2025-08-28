import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  SALES_MANAGER = 'sales_manager',
  SALES_AGENT = 'sales_agent',
  MARKETING = 'marketing',
  SUPPORT = 'support'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SALES_AGENT
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  permissions: Record<string, any>;

  @Column({ nullable: true })
  last_login_at: Date;

  @Column({ type: 'int', default: 0 })
  login_attempts: number;

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_phone_verified: boolean;

  @Column({ nullable: true })
  email_verification_token: string;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ type: 'date', nullable: true })
  password_reset_expires_at: Date;

  @Column({ type: 'boolean', default: true })
  receive_notifications: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, company => company.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Lead, lead => lead.assigned_to)
  assigned_leads: Lead[];

  @OneToMany(() => Activity, activity => activity.user)
  activities: Activity[];

  // Virtual fields
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
