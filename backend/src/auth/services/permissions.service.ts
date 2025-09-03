import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user.entity';
import { PERMISSION_PATTERNS } from '../interfaces/permissions.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      return [];
    }

    const rolePermissions = await this.getRolePermissions(user.role);
    const customPermissions = user.permissions || {};

    // Combine role permissions with custom permissions
    const allPermissions = [...rolePermissions];

    // Add custom permissions that are explicitly set to true
    Object.entries(customPermissions).forEach(([permission, enabled]) => {
      if (enabled === true && !allPermissions.includes(permission)) {
        allPermissions.push(permission);
      }
    });

    return allPermissions;
  }

  async hasPermission(
    userId: string,
    requiredPermission: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    // Check exact permission
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check wildcard permissions (e.g., 'users.*' covers 'users.read')
    const resource = requiredPermission.split('.')[0];
    const wildcardPermission = `${resource}.*`;

    return userPermissions.includes(wildcardPermission);
  }

  async hasAnyPermission(
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    for (const permission of requiredPermissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    for (const permission of requiredPermissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  async updateUserPermissions(
    userId: string,
    permissions: Record<string, boolean>,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      permissions: permissions as any,
    });
  }

  async getRolePermissions(role: UserRole): Promise<string[]> {
    const rolePermissionMap: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: [
        // All permissions
        PERMISSION_PATTERNS.USERS_ALL,
        PERMISSION_PATTERNS.COMPANIES_ALL,
        PERMISSION_PATTERNS.LEADS_ALL,
        PERMISSION_PATTERNS.PROPERTIES_ALL,
        PERMISSION_PATTERNS.DEALS_ALL,
        PERMISSION_PATTERNS.ACTIVITIES_ALL,
        PERMISSION_PATTERNS.DEVELOPERS_ALL,
        PERMISSION_PATTERNS.PROJECTS_ALL,
        PERMISSION_PATTERNS.ANALYTICS_ALL,
        PERMISSION_PATTERNS.REPORTS_ALL,
        PERMISSION_PATTERNS.SETTINGS_ALL,
        PERMISSION_PATTERNS.NOTIFICATIONS_ALL,
        PERMISSION_PATTERNS.PAYMENTS_ALL,
        PERMISSION_PATTERNS.AI_ALL,
        PERMISSION_PATTERNS.CAMPAIGNS_ALL,
        PERMISSION_PATTERNS.LEADS_ASSIGN,
        PERMISSION_PATTERNS.DEALS_APPROVE,
        PERMISSION_PATTERNS.AUDIT_LOGS_READ,
      ],
      [UserRole.COMPANY_ADMIN]: [
        // Company-level permissions
        PERMISSION_PATTERNS.USERS_READ,
        PERMISSION_PATTERNS.USERS_CREATE,
        PERMISSION_PATTERNS.USERS_UPDATE,
        PERMISSION_PATTERNS.USERS_DELETE,
        PERMISSION_PATTERNS.LEADS_ALL,
        PERMISSION_PATTERNS.PROPERTIES_ALL,
        PERMISSION_PATTERNS.DEALS_ALL,
        PERMISSION_PATTERNS.ACTIVITIES_ALL,
        PERMISSION_PATTERNS.DEVELOPERS_ALL,
        PERMISSION_PATTERNS.PROJECTS_ALL,
        PERMISSION_PATTERNS.ANALYTICS_ALL,
        PERMISSION_PATTERNS.REPORTS_ALL,
        PERMISSION_PATTERNS.SETTINGS_READ,
        PERMISSION_PATTERNS.SETTINGS_UPDATE,
        PERMISSION_PATTERNS.NOTIFICATIONS_ALL,
        PERMISSION_PATTERNS.PAYMENTS_READ,
        PERMISSION_PATTERNS.PAYMENTS_UPDATE,
        PERMISSION_PATTERNS.AI_READ,
        PERMISSION_PATTERNS.AI_UPDATE,
        PERMISSION_PATTERNS.CAMPAIGNS_ALL,
        PERMISSION_PATTERNS.LEADS_ASSIGN,
        PERMISSION_PATTERNS.DEALS_APPROVE,
        PERMISSION_PATTERNS.AUDIT_LOGS_READ,
      ],
      [UserRole.SALES_MANAGER]: [
        // Sales management permissions
        PERMISSION_PATTERNS.LEADS_ALL,
        PERMISSION_PATTERNS.PROPERTIES_ALL,
        PERMISSION_PATTERNS.DEALS_ALL,
        PERMISSION_PATTERNS.ACTIVITIES_ALL,
        PERMISSION_PATTERNS.DEVELOPERS_READ,
        PERMISSION_PATTERNS.PROJECTS_READ,
        PERMISSION_PATTERNS.ANALYTICS_READ,
        PERMISSION_PATTERNS.REPORTS_READ,
        PERMISSION_PATTERNS.AI_READ,
        PERMISSION_PATTERNS.LEADS_ASSIGN,
        PERMISSION_PATTERNS.DEALS_APPROVE,
      ],
      [UserRole.SALES_AGENT]: [
        // Basic sales permissions
        PERMISSION_PATTERNS.LEADS_READ,
        PERMISSION_PATTERNS.LEADS_CREATE,
        PERMISSION_PATTERNS.LEADS_UPDATE,
        PERMISSION_PATTERNS.PROPERTIES_READ,
        PERMISSION_PATTERNS.PROPERTIES_CREATE,
        PERMISSION_PATTERNS.PROPERTIES_UPDATE,
        PERMISSION_PATTERNS.DEALS_READ,
        PERMISSION_PATTERNS.DEALS_CREATE,
        PERMISSION_PATTERNS.DEALS_UPDATE,
        PERMISSION_PATTERNS.ACTIVITIES_READ,
        PERMISSION_PATTERNS.ACTIVITIES_CREATE,
        PERMISSION_PATTERNS.ACTIVITIES_UPDATE,
        PERMISSION_PATTERNS.DEVELOPERS_READ,
        PERMISSION_PATTERNS.PROJECTS_READ,
      ],
      [UserRole.MARKETING]: [
        // Marketing permissions
        PERMISSION_PATTERNS.LEADS_READ,
        PERMISSION_PATTERNS.LEADS_CREATE,
        PERMISSION_PATTERNS.LEADS_UPDATE,
        PERMISSION_PATTERNS.PROPERTIES_READ,
        PERMISSION_PATTERNS.ANALYTICS_READ,
        PERMISSION_PATTERNS.REPORTS_READ,
        PERMISSION_PATTERNS.CAMPAIGNS_ALL,
        PERMISSION_PATTERNS.AI_READ,
      ],
      [UserRole.SUPPORT]: [
        // Support permissions - Read access for support purposes
        'users.read', // شركته فقط
        PERMISSION_PATTERNS.DEVELOPERS_READ,
        PERMISSION_PATTERNS.PROJECTS_READ,
        PERMISSION_PATTERNS.PROPERTIES_READ, // الوحدات
        PERMISSION_PATTERNS.LEADS_READ,
        PERMISSION_PATTERNS.DEALS_READ,
        PERMISSION_PATTERNS.ACTIVITIES_READ,
      ],
    };

    return rolePermissionMap[role] || [];
  }

  async getAvailablePermissions(): Promise<string[]> {
    return Object.values(PERMISSION_PATTERNS);
  }
}
