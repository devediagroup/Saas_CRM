import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMISSION } from '../decorators/require-permission.decorator';
import { PermissionsService } from '../services/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    private readonly logger = new Logger(PermissionGuard.name);

    constructor(
        private reflector: Reflector,
        private permissionsService: PermissionsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<
            string | string[] | { any: string[] }
        >(REQUIRE_PERMISSION, [context.getHandler(), context.getClass()]);

        if (!requiredPermission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        try {
            // Handle different permission types
            if (typeof requiredPermission === 'string') {
                // Single permission
                const hasPermission = await this.permissionsService.hasPermission(
                    user.id,
                    requiredPermission,
                );

                if (!hasPermission) {
                    this.logger.warn(
                        `User ${user.id} denied access: missing permission ${requiredPermission}`,
                    );
                    throw new ForbiddenException(
                        `Insufficient permissions: ${requiredPermission} required`,
                    );
                }
            } else if (Array.isArray(requiredPermission)) {
                // Multiple permissions (all required)
                const hasAllPermissions = await Promise.all(
                    requiredPermission.map((permission) =>
                        this.permissionsService.hasPermission(user.id, permission),
                    ),
                );

                if (!hasAllPermissions.every(Boolean)) {
                    this.logger.warn(
                        `User ${user.id} denied access: missing permissions ${requiredPermission.join(', ')}`,
                    );
                    throw new ForbiddenException(
                        `Insufficient permissions: ${requiredPermission.join(', ')} required`,
                    );
                }
            } else if (requiredPermission.any) {
                // Any one of the permissions
                const hasAnyPermission = await Promise.all(
                    requiredPermission.any.map((permission) =>
                        this.permissionsService.hasPermission(user.id, permission),
                    ),
                );

                if (!hasAnyPermission.some(Boolean)) {
                    this.logger.warn(
                        `User ${user.id} denied access: missing any of permissions ${requiredPermission.any.join(', ')}`,
                    );
                    throw new ForbiddenException(
                        `Insufficient permissions: one of ${requiredPermission.any.join(', ')} required`,
                    );
                }
            }

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }

            this.logger.error(
                `Error checking permissions for user ${user.id}:`,
                error,
            );
            throw new ForbiddenException('Error validating permissions');
        }
    }
}
