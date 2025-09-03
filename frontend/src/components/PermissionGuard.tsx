import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

// أنواع البيانات
interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  show?: boolean;
}

/**
 * مكون PermissionGuard
 * يحمي العناصر حسب صلاحيات المستخدم
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  show = true,
}) => {
  const { can, canAny, canAll, user, isAuthenticated, isLoading } = usePermissions();

  // إضافة logging للتشخيص
  console.log('🛡️ PermissionGuard:', {
    permission,
    permissions,
    requireAll,
    show,
    isLoading,
    isAuthenticated,
    user: user ? {
      id: user.id,
      role: user.role,
      permissions: user.permissions
    } : null
  });

  // إذا كان النظام لسه بيحمّل، مانعرضش المحتوى خالص
  if (isLoading) {
    console.log('⏳ System still loading, not showing content yet');
    return <>{fallback}</>;
  }

  // إذا كان show = false، لا نعرض أي شيء
  if (!show) {
    console.log('🚫 show = false, returning null');
    return null;
  }

  // التحقق من الصلاحية الواحدة
  if (permission) {
    const hasIt = can(permission);
    console.log(`🔍 Checking single permission '${permission}': ${hasIt ? '✅' : '❌'}`);
    if (!hasIt) {
      return <>{fallback}</>;
    }
  }

  // التحقق من مجموعة الصلاحيات
  if (permissions.length > 0) {
    const hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
    console.log(`🔍 Checking multiple permissions [${permissions.join(', ')}] (requireAll: ${requireAll}): ${hasPermission ? '✅' : '❌'}`);
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  console.log('✅ Permission check passed, showing children');
  // إذا لم يتم تحديد صلاحيات، اعرض العناصر
  return <>{children}</>;
};

/**
 * مكون Can - اختصار للتحقق من صلاحية واحدة
 */
export const Can: React.FC<{
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permission, children, fallback = null }) => (
  <PermissionGuard permission={permission} fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * مكون CanAny - اختصار للتحقق من أي صلاحية من مجموعة
 */
export const CanAny: React.FC<{
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permissions, children, fallback = null }) => (
  <PermissionGuard permissions={permissions} requireAll={false} fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * مكون CanAll - اختصار للتحقق من جميع الصلاحيات
 */
export const CanAll: React.FC<{
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permissions, children, fallback = null }) => (
  <PermissionGuard permissions={permissions} requireAll={true} fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * مكون RoleGuard - للتحقق من دور المستخدم
 */
export const RoleGuard: React.FC<{
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}> = ({ roles, children, fallback = null, requireAll = false }) => {
  const { getUserRole } = usePermissions();
  const userRole = getUserRole();

  const hasRole = requireAll
    ? roles.every(role => role === userRole)
    : roles.includes(userRole);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * مكون IsSuperAdmin - للتحقق من أن المستخدم مدير النظام
 */
export const IsSuperAdmin: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * مكون IsCompanyAdmin - للتحقق من أن المستخدم مدير شركة
 */
export const IsCompanyAdmin: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isCompanyAdmin } = usePermissions();

  if (!isCompanyAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * مكون IsManager - للتحقق من أن المستخدم مدير
 */
export const IsManager: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isManager } = usePermissions();

  if (!isManager()) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

/**
 * مكون IsAgent - للتحقق من أن المستخدم وكيل
 */
export const IsAgent: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAgent } = usePermissions();

  if (!isAgent()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * مكون IsViewer - للتحقق من أن المستخدم مشاهد
 */
export const IsViewer: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isViewer } = usePermissions();

  if (!isViewer()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
