import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  ROLE_CHANGE = 'role_change',
  PERMISSION_CHANGE = 'permission_change',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  SYSTEM_CONFIG = 'system_config',
  BACKUP = 'backup',
  RESTORE = 'restore',
  OTHER = 'other',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  resource: string; // e.g., 'users', 'properties', 'deals'

  @Column({ nullable: true })
  resource_id: string; // ID of the affected resource

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AuditStatus,
    default: AuditStatus.SUCCESS,
  })
  status: AuditStatus;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.LOW,
  })
  severity: AuditSeverity;

  @Column({ type: 'json', nullable: true })
  old_values: Record<string, any>; // Previous values before change

  @Column({ type: 'json', nullable: true })
  new_values: Record<string, any>; // New values after change

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Additional context information

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  session_id: string;

  @Column({ type: 'json', nullable: true })
  request_data: Record<string, any>; // Request body, headers, etc.

  @Column({ type: 'json', nullable: true })
  response_data: Record<string, any>; // Response data

  @Column({ type: 'int', nullable: true })
  response_time_ms: number; // Response time in milliseconds

  @Column({ type: 'text', nullable: true })
  error_message: string; // Error message if action failed

  @Column({ type: 'text', nullable: true })
  stack_trace: string; // Stack trace if error occurred

  @Column({ type: 'json', nullable: true })
  affected_fields: string[]; // Fields that were modified

  @Column({ type: 'boolean', default: false })
  is_sensitive: boolean; // Whether this log contains sensitive information

  @Column({ type: 'boolean', default: false })
  is_exported: boolean; // Whether this log has been exported

  @Column({ type: 'date', nullable: true })
  exported_at: Date; // When this log was exported

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column('uuid', { nullable: true })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
