import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

// أنواع البيانات
interface RouteGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * مكون RouteGuard
 * يحمي المسارات حسب صلاحيات المستخدم
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback = null,
}) => {
  const { can, canAny, canAll, isAuthenticated, isLoading } = usePermissions();
  const location = useLocation();

  // إذا كان النظام في حالة تحميل، اعرض fallback
  if (isLoading) {
    return <>{fallback}</>;
  }

  // إذا لم يكن المستخدم مسجل الدخول، اعرض fallback
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // التحقق من الصلاحية الواحدة
  if (permission) {
    if (!can(permission)) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
  }

  // التحقق من مجموعة الصلاحيات
  if (permissions.length > 0) {
    const hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
    if (!hasPermission) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
  }

  // إذا لم يتم تحديد صلاحيات، اعرض المحتوى
  return <>{children}</>;
};

/**
 * مكون ProtectedRoute - اختصار للتحقق من صلاحية واحدة
 */
export const ProtectedRoute: React.FC<{
  permission: string;
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}> = ({ permission, children, redirectTo = '/unauthorized', fallback = null }) => (
  <RouteGuard permission={permission} redirectTo={redirectTo} fallback={fallback}>
    {children}
  </RouteGuard>
);

/**
 * مكون ProtectedRouteAny - اختصار للتحقق من أي صلاحية من مجموعة
 */
export const ProtectedRouteAny: React.FC<{
  permissions: string[];
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}> = ({ permissions, children, redirectTo = '/unauthorized', fallback = null }) => (
  <RouteGuard permissions={permissions} requireAll={false} redirectTo={redirectTo} fallback={fallback}>
    {children}
  </RouteGuard>
);

/**
 * مكون ProtectedRouteAll - اختصار للتحقق من جميع الصلاحيات
 */
export const ProtectedRouteAll: React.FC<{
  permissions: string[];
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}> = ({ permissions, children, redirectTo = '/unauthorized', fallback = null }) => (
  <RouteGuard permissions={permissions} requireAll={true} redirectTo={redirectTo} fallback={fallback}>
    {children}
  </RouteGuard>
);

/**
 * مكون RoleProtectedRoute - للتحقق من دور المستخدم
 */
export const RoleProtectedRoute: React.FC<{
  roles: string[];
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
  requireAll?: boolean;
}> = ({ roles, children, redirectTo = '/unauthorized', fallback = null, requireAll = false }) => {
  const { getUserRole, isAuthenticated, isLoading } = usePermissions();
  const location = useLocation();

  // إذا كان النظام في حالة تحميل، اعرض fallback
  if (isLoading) {
    return <>{fallback}</>;
  }

  // إذا لم يكن المستخدم مسجل الدخول، اعرض fallback
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  const userRole = getUserRole();
  const hasRole = requireAll
    ? roles.every(role => role === userRole)
    : roles.includes(userRole);

  if (!hasRole) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * مكون AdminRoute - للتحقق من أن المستخدم مدير
 */
export const AdminRoute: React.FC<{
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}> = ({ children, redirectTo = '/unauthorized', fallback = null }) => {
  const { isSuperAdmin, isCompanyAdmin, isAuthenticated, isLoading } = usePermissions();
  const location = useLocation();

  // إذا كان النظام في حالة تحميل، اعرض fallback
  if (isLoading) {
    return <>{fallback}</>;
  }

  // إذا لم يكن المستخدم مسجل الدخول، اعرض fallback
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // التحقق من أن المستخدم مدير
  if (!isSuperAdmin() && !isCompanyAdmin()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * مكون SuperAdminRoute - للتحقق من أن المستخدم مدير النظام
 */
export const SuperAdminRoute: React.FC<{
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}> = ({ children, redirectTo = '/unauthorized', fallback = null }) => {
  const { isSuperAdmin, isAuthenticated, isLoading } = usePermissions();
  const location = useLocation();

  // إذا كان النظام في حالة تحميل، اعرض fallback
  if (isLoading) {
    return <>{fallback}</>;
  }

  // إذا لم يكن المستخدم مسجل الدخول، اعرض fallback
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // التحقق من أن المستخدم مدير النظام
  if (!isSuperAdmin()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
