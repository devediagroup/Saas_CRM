import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SecurityService } from './security.service';
import type { CreateAuditLogDto } from './security.service';
import {
  AuditLog,
  AuditAction,
  AuditStatus,
  AuditSeverity,
} from './entities/audit-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Security & Audit')
@Controller('security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('audit-log')
  @ApiOperation({ summary: 'Create audit log entry' })
  @ApiResponse({
    status: 201,
    description: 'Audit log created successfully',
    type: AuditLog,
  })
  async createAuditLog(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @User('companyId') companyId: string,
    @User('id') userId: string,
  ): Promise<AuditLog> {
    return this.securityService.createAuditLog({
      ...createAuditLogDto,
      company_id: companyId,
      user_id: userId,
    });
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get all audit logs for company' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AuditStatus })
  @ApiQuery({ name: 'severity', required: false, enum: AuditSeverity })
  @ApiQuery({ name: 'user', required: false })
  @ApiQuery({ name: 'start_date', required: false, type: Date })
  @ApiQuery({ name: 'end_date', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false })
  async getAuditLogs(
    @User('companyId') companyId: string,
    @Query('action') action?: AuditAction,
    @Query('resource') resource?: string,
    @Query('status') status?: AuditStatus,
    @Query('severity') severity?: AuditSeverity,
    @Query('user') userId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('search') search?: string,
  ): Promise<AuditLog[]> {
    if (action) {
      return this.securityService.getAuditLogsByAction(companyId, action);
    }

    if (resource) {
      return this.securityService.getAuditLogsByResource(companyId, resource);
    }

    if (status) {
      return this.securityService.getAuditLogsByStatus(companyId, status);
    }

    if (severity) {
      return this.securityService.getAuditLogsBySeverity(companyId, severity);
    }

    if (userId) {
      return this.securityService.getAuditLogsByUser(companyId, userId);
    }

    if (startDate && endDate) {
      return this.securityService.getAuditLogsByDateRange(
        companyId,
        new Date(startDate),
        new Date(endDate),
      );
    }

    if (search) {
      return this.securityService.searchAuditLogs(companyId, search);
    }

    return this.securityService.findAll(companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get security statistics' })
  @ApiResponse({
    status: 200,
    description: 'Security statistics retrieved successfully',
  })
  async getSecurityStats(@User('companyId') companyId: string) {
    return this.securityService.getSecurityStats(companyId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get security alerts' })
  @ApiResponse({
    status: 200,
    description: 'Security alerts retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSecurityAlerts(
    @User('companyId') companyId: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.securityService.getSecurityAlerts(companyId, limitNum);
  }

  @Get('failed-logins')
  @ApiOperation({ summary: 'Get failed login attempts' })
  @ApiResponse({
    status: 200,
    description: 'Failed login attempts retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFailedLoginAttempts(
    @User('companyId') companyId: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.securityService.getFailedLoginAttempts(companyId, limitNum);
  }

  @Get('data-access')
  @ApiOperation({ summary: 'Get data access logs' })
  @ApiResponse({
    status: 200,
    description: 'Data access logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDataAccessLogs(
    @User('companyId') companyId: string,
    @Query('resource') resource?: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLog[]> {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.securityService.getDataAccessLogs(
      companyId,
      resource,
      limitNum,
    );
  }

  @Get('audit-logs/export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs exported successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'start_date', required: true, type: Date })
  @ApiQuery({ name: 'end_date', required: true, type: Date })
  async exportAuditLogs(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.exportAuditLogs(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('audit-logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
    type: AuditLog,
  })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async getAuditLog(@Param('id') id: string): Promise<AuditLog> {
    return this.securityService.findOne(id);
  }

  @Get('by-action/:action')
  @ApiOperation({ summary: 'Get audit logs by action' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  async getAuditLogsByAction(
    @Param('action') action: AuditAction,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.getAuditLogsByAction(companyId, action);
  }

  @Get('by-resource/:resource')
  @ApiOperation({ summary: 'Get audit logs by resource' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  async getAuditLogsByResource(
    @Param('resource') resource: string,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.getAuditLogsByResource(companyId, resource);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  async getAuditLogsByUser(
    @Param('userId') userId: string,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.getAuditLogsByUser(companyId, userId);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get audit logs by status' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  async getAuditLogsByStatus(
    @Param('status') status: AuditStatus,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.getAuditLogsByStatus(companyId, status);
  }

  @Get('by-severity/:severity')
  @ApiOperation({ summary: 'Get audit logs by severity' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  async getAuditLogsBySeverity(
    @Param('severity') severity: AuditSeverity,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.getAuditLogsBySeverity(companyId, severity);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'q', required: true })
  async searchAuditLogs(
    @Query('q') searchTerm: string,
    @User('companyId') companyId: string,
  ): Promise<AuditLog[]> {
    return this.securityService.searchAuditLogs(companyId, searchTerm);
  }
}
