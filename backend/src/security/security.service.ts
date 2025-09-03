import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import {
  AuditLog,
  AuditAction,
  AuditStatus,
  AuditSeverity,
} from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  action: AuditAction;
  resource: string;
  resource_id?: string;
  description?: string;
  status?: AuditStatus;
  severity?: AuditSeverity;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_data?: Record<string, any>;
  response_data?: Record<string, any>;
  response_time_ms?: number;
  error_message?: string;
  stack_trace?: string;
  affected_fields?: string[];
  is_sensitive?: boolean;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createAuditLog(
    createAuditLogDto: CreateAuditLogDto & {
      company_id: string;
      user_id?: string;
    },
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    const savedLog = await this.auditLogRepository.save(auditLog);

    this.logger.log(
      `Audit log created: ${createAuditLogDto.action} on ${createAuditLogDto.resource}`,
    );

    return savedLog;
  }

  async findAll(companyId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { company_id: companyId },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['company', 'user'],
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async getAuditLogsByAction(
    companyId: string,
    action: AuditAction,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        company_id: companyId,
        action,
      },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAuditLogsByResource(
    companyId: string,
    resource: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        company_id: companyId,
        resource,
      },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAuditLogsByUser(
    companyId: string,
    userId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        company_id: companyId,
        user_id: userId,
      },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAuditLogsByStatus(
    companyId: string,
    status: AuditStatus,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAuditLogsBySeverity(
    companyId: string,
    severity: AuditSeverity,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        company_id: companyId,
        severity,
      },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAuditLogsByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        company_id: companyId,
        created_at: Between(startDate, endDate),
      },
      relations: ['company', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async searchAuditLogs(
    companyId: string,
    searchTerm: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.company_id = :companyId', { companyId })
      .andWhere(
        '(auditLog.description LIKE :search OR auditLog.resource LIKE :search OR auditLog.action LIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .leftJoinAndSelect('auditLog.company', 'company')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.created_at', 'DESC')
      .getMany();
  }

  async getSecurityStats(companyId: string) {
    const auditLogs = await this.findAll(companyId);

    const stats = {
      total: auditLogs.length,
      byAction: {
        [AuditAction.CREATE]: auditLogs.filter(
          (log) => log.action === AuditAction.CREATE,
        ).length,
        [AuditAction.READ]: auditLogs.filter(
          (log) => log.action === AuditAction.READ,
        ).length,
        [AuditAction.UPDATE]: auditLogs.filter(
          (log) => log.action === AuditAction.UPDATE,
        ).length,
        [AuditAction.DELETE]: auditLogs.filter(
          (log) => log.action === AuditAction.DELETE,
        ).length,
        [AuditAction.LOGIN]: auditLogs.filter(
          (log) => log.action === AuditAction.LOGIN,
        ).length,
        [AuditAction.LOGOUT]: auditLogs.filter(
          (log) => log.action === AuditAction.LOGOUT,
        ).length,
        [AuditAction.LOGIN_FAILED]: auditLogs.filter(
          (log) => log.action === AuditAction.LOGIN_FAILED,
        ).length,
        [AuditAction.PASSWORD_CHANGE]: auditLogs.filter(
          (log) => log.action === AuditAction.PASSWORD_CHANGE,
        ).length,
        [AuditAction.ROLE_CHANGE]: auditLogs.filter(
          (log) => log.action === AuditAction.ROLE_CHANGE,
        ).length,
        [AuditAction.PERMISSION_CHANGE]: auditLogs.filter(
          (log) => log.action === AuditAction.PERMISSION_CHANGE,
        ).length,
        [AuditAction.DATA_EXPORT]: auditLogs.filter(
          (log) => log.action === AuditAction.DATA_EXPORT,
        ).length,
        [AuditAction.DATA_IMPORT]: auditLogs.filter(
          (log) => log.action === AuditAction.DATA_IMPORT,
        ).length,
        [AuditAction.SYSTEM_CONFIG]: auditLogs.filter(
          (log) => log.action === AuditAction.SYSTEM_CONFIG,
        ).length,
        [AuditAction.BACKUP]: auditLogs.filter(
          (log) => log.action === AuditAction.BACKUP,
        ).length,
        [AuditAction.RESTORE]: auditLogs.filter(
          (log) => log.action === AuditAction.RESTORE,
        ).length,
        [AuditAction.OTHER]: auditLogs.filter(
          (log) => log.action === AuditAction.OTHER,
        ).length,
      },
      byStatus: {
        [AuditStatus.SUCCESS]: auditLogs.filter(
          (log) => log.status === AuditStatus.SUCCESS,
        ).length,
        [AuditStatus.FAILED]: auditLogs.filter(
          (log) => log.status === AuditStatus.FAILED,
        ).length,
        [AuditStatus.PENDING]: auditLogs.filter(
          (log) => log.status === AuditStatus.PENDING,
        ).length,
      },
      bySeverity: {
        [AuditSeverity.LOW]: auditLogs.filter(
          (log) => log.severity === AuditSeverity.LOW,
        ).length,
        [AuditSeverity.MEDIUM]: auditLogs.filter(
          (log) => log.severity === AuditSeverity.MEDIUM,
        ).length,
        [AuditSeverity.HIGH]: auditLogs.filter(
          (log) => log.severity === AuditSeverity.HIGH,
        ).length,
        [AuditSeverity.CRITICAL]: auditLogs.filter(
          (log) => log.severity === AuditSeverity.CRITICAL,
        ).length,
      },
      failedActions: auditLogs.filter(
        (log) => log.status === AuditStatus.FAILED,
      ).length,
      highSeverityLogs: auditLogs.filter(
        (log) =>
          log.severity === AuditSeverity.HIGH ||
          log.severity === AuditSeverity.CRITICAL,
      ).length,
      sensitiveLogs: auditLogs.filter((log) => log.is_sensitive).length,
      averageResponseTime:
        auditLogs.filter((log) => log.response_time_ms).length > 0
          ? auditLogs
              .filter((log) => log.response_time_ms)
              .reduce((sum, log) => sum + log.response_time_ms, 0) /
            auditLogs.filter((log) => log.response_time_ms).length
          : 0,
    };

    return stats;
  }

  async getSecurityAlerts(
    companyId: string,
    limit: number = 10,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.company_id = :companyId', { companyId })
      .andWhere('auditLog.severity IN (:...severities)', {
        severities: [AuditSeverity.HIGH, AuditSeverity.CRITICAL],
      })
      .orderBy('auditLog.created_at', 'DESC')
      .limit(limit)
      .leftJoinAndSelect('auditLog.company', 'company')
      .leftJoinAndSelect('auditLog.user', 'user')
      .getMany();
  }

  async getFailedLoginAttempts(
    companyId: string,
    limit: number = 20,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.company_id = :companyId', { companyId })
      .andWhere('auditLog.action = :action', {
        action: AuditAction.LOGIN_FAILED,
      })
      .orderBy('auditLog.created_at', 'DESC')
      .limit(limit)
      .leftJoinAndSelect('auditLog.company', 'company')
      .leftJoinAndSelect('auditLog.user', 'user')
      .getMany();
  }

  async getDataAccessLogs(
    companyId: string,
    resource?: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.company_id = :companyId', { companyId })
      .andWhere('auditLog.action IN (:...actions)', {
        actions: [
          AuditAction.READ,
          AuditAction.CREATE,
          AuditAction.UPDATE,
          AuditAction.DELETE,
        ],
      })
      .orderBy('auditLog.created_at', 'DESC')
      .limit(limit)
      .leftJoinAndSelect('auditLog.company', 'company')
      .leftJoinAndSelect('auditLog.user', 'user');

    if (resource) {
      query.andWhere('auditLog.resource = :resource', { resource });
    }

    return query.getMany();
  }

  async exportAuditLogs(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AuditLog[]> {
    const logs = await this.getAuditLogsByDateRange(
      companyId,
      startDate,
      endDate,
    );

    // Mark logs as exported
    await this.auditLogRepository.update(
      { company_id: companyId, created_at: Between(startDate, endDate) },
      { is_exported: true, exported_at: new Date() },
    );

    return logs;
  }

  async cleanupOldLogs(
    companyId: string,
    daysToKeep: number = 365,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository.delete({
      company_id: companyId,
      created_at: Between(new Date(0), cutoffDate),
      is_sensitive: false, // Don't delete sensitive logs
    });

    return result.affected || 0;
  }

  async logSecurityEvent(
    companyId: string,
    userId: string | undefined,
    action: AuditAction,
    resource: string,
    description: string,
    metadata?: Record<string, any>,
    severity: AuditSeverity = AuditSeverity.MEDIUM,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource,
      description,
      severity,
      metadata,
      company_id: companyId,
      user_id: userId,
      status: AuditStatus.SUCCESS,
    });
  }

  async logSecurityViolation(
    companyId: string,
    userId: string | undefined,
    action: AuditAction,
    resource: string,
    description: string,
    errorMessage: string,
    metadata?: Record<string, any>,
    severity: AuditSeverity = AuditSeverity.HIGH,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource,
      description,
      severity,
      metadata,
      error_message: errorMessage,
      status: AuditStatus.FAILED,
      company_id: companyId,
      user_id: userId,
    });
  }
}
