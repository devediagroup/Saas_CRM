import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PermissionsService } from '../services/permissions.service';

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PermissionMiddleware.name);

  constructor(private permissionsService: PermissionsService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const user: any = req.user;

      // Skip permission check if no user (handled by auth guard)
      if (!user) {
        return next();
      }

      const method = req.method;
      const path = req.path;

      // Map HTTP methods and paths to permissions
      const permission = this.mapToPermission(method, path);

      if (permission) {
        this.logger.debug(`Checking permission: ${permission} for user: ${user.id}`);

        const hasPermission = await this.permissionsService.hasPermission(
          user.id,
          permission,
        );

        if (!hasPermission) {
          this.logger.warn(`Permission denied: ${permission} for user: ${user.id}`);
          throw new ForbiddenException(`Insufficient permissions: ${permission} required`);
        }

        this.logger.debug(`Permission granted: ${permission} for user: ${user.id}`);
      }

      next();
    } catch (error) {
      this.logger.error(`Permission middleware error: ${error.message}`);
      throw error;
    }
  }

  private mapToPermission(method: string, path: string): string | null {
    // Extract resource from path (e.g., /api/leads -> leads)
    const pathParts = path.split('/').filter(part => part);

    // Skip if not API path or no resource
    if (pathParts[0] !== 'api' || pathParts.length < 2) {
      return null;
    }

    const resource = pathParts[1];
    const action = this.mapMethodToAction(method);

    // Skip permission check for public endpoints
    const publicEndpoints = ['auth', 'health', 'docs'];
    if (publicEndpoints.includes(resource)) {
      return null;
    }

    return `${resource}.${action}`;
  }

  private mapMethodToAction(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET': return 'read';
      case 'POST': return 'create';
      case 'PUT':
      case 'PATCH': return 'update';
      case 'DELETE': return 'delete';
      default: return 'read';
    }
  }
}
