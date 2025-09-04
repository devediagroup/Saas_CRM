import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION = 'require_permission';

/**
 * Decorator to require specific permission for accessing an endpoint
 * @param permission - The permission string required (e.g., 'leads.create', 'properties.read')
 */
export const RequirePermission = (permission: string) =>
    SetMetadata(REQUIRE_PERMISSION, permission);

/**
 * Decorator to require multiple permissions (all must be satisfied)
 * @param permissions - Array of permission strings
 */
export const RequirePermissions = (permissions: string[]) =>
    SetMetadata(REQUIRE_PERMISSION, permissions);

/**
 * Decorator to require any one of the specified permissions
 * @param permissions - Array of permission strings (any one is sufficient)
 */
export const RequireAnyPermission = (permissions: string[]) =>
    SetMetadata(REQUIRE_PERMISSION, { any: permissions });
