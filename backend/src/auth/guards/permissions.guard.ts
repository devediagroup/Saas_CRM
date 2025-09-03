import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('User not authenticated or role not found');
    }

    // Check if user has required permissions
    const hasPermission = this.checkPermissions(user, requiredPermissions);
    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private checkPermissions(user: any, requiredPermissions: string[]): boolean {
    // Super admin has all permissions
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check custom permissions from user.permissions
    if (user.permissions && typeof user.permissions === 'object') {
      for (const permission of requiredPermissions) {
        if (user.permissions[permission] === true) {
          return true;
        }
      }
    }

    // Check role-based permissions
    const rolePermissions = this.getRolePermissions(user.role);
    for (const permission of requiredPermissions) {
      if (rolePermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  private getRolePermissions(role: UserRole): string[] {
    const rolePermissionMap: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: [
        // All permissions
        'users.*',
        'companies.*',
        'leads.*',
        'properties.*',
        'deals.*',
        'activities.*',
        'developers.*',
        'projects.*',
        'analytics.*',
        'reports.*',
        'settings.*',
        'notifications.*',
        'payments.*',
        'ai.*',
        'campaigns.*',
        'leads.assign',
        'deals.approve',
        'audit.read',
      ],
      [UserRole.COMPANY_ADMIN]: [
        // Company-level permissions
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'leads.*',
        'properties.*',
        'deals.*',
        'activities.*',
        'developers.*',
        'projects.*',
        'analytics.*',
        'reports.*',
        'settings.read',
        'settings.update',
        'notifications.*',
        'payments.read',
        'payments.update',
        'ai.read',
        'ai.update',
        'campaigns.*',
        'leads.assign',
        'deals.approve',
        'audit.read',
      ],
      [UserRole.SALES_MANAGER]: [
        // Sales management permissions
        'leads.*',
        'properties.*',
        'deals.*',
        'activities.*',
        'developers.read',
        'projects.read',
        'analytics.read',
        'reports.read',
        'ai.read',
        'leads.assign',
        'deals.approve',
      ],
      [UserRole.SALES_AGENT]: [
        // Basic sales permissions
        'leads.read',
        'leads.create',
        'leads.update',
        'properties.read',
        'properties.create',
        'properties.update',
        'deals.read',
        'deals.create',
        'deals.update',
        'activities.read',
        'activities.create',
        'activities.update',
        'developers.read',
        'projects.read',
      ],
      [UserRole.MARKETING]: [
        // Marketing permissions
        'leads.read',
        'leads.create',
        'leads.update',
        'properties.read',
        'analytics.read',
        'reports.read',
        'campaigns.*',
        'ai.read',
      ],
      [UserRole.SUPPORT]: [
        // Support permissions - Read access for support purposes
        'users.read', // شركته فقط
        'developers.read',
        'projects.read',
        'properties.read', // الوحدات
        'leads.read',
        'deals.read',
        'activities.read',
      ],
    };

    return rolePermissionMap[role] || [];
  }
}
