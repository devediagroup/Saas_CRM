import { useAuth } from '../contexts/AuthContext';

/**
 * Hook مخصص للتحقق من صلاحيات المستخدم
 * يوفر واجهة بسيطة للتحقق من الصلاحيات
 */
export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user, isLoading, isAuthenticated } = useAuth();

  /**
   * التحقق من وجود صلاحية واحدة
   * @param permission - الصلاحية المطلوبة
   * @returns true إذا كان المستخدم لديه الصلاحية
   */
  const can = (permission: string): boolean => {
    console.log('🔍 usePermissions.can called:', {
      permission,
      hasPermissionFunc: typeof hasPermission,
      result: hasPermission(permission)
    });
    return hasPermission(permission);
  };

  /**
   * التحقق من وجود أي صلاحية من مجموعة
   * @param permissions - مجموعة الصلاحيات
   * @returns true إذا كان المستخدم لديه أي صلاحية من المجموعة
   */
  const canAny = (permissions: string[]): boolean => {
    return hasAnyPermission(permissions);
  };

  /**
   * التحقق من وجود جميع الصلاحيات
   * @param permissions - مجموعة الصلاحيات
   * @returns true إذا كان المستخدم لديه جميع الصلاحيات
   */
  const canAll = (permissions: string[]): boolean => {
    return hasAllPermissions(permissions);
  };

  /**
   * التحقق من صلاحيات CRUD
   * @param resource - المورد (مثل: users, developers, projects)
   * @returns كائن يحتوي على صلاحيات CRUD
   */
  const canCRUD = (resource: string) => {
    return {
      create: can(`${resource}.create`),
      read: can(`${resource}.read`),
      update: can(`${resource}.update`),
      delete: can(`${resource}.delete`),
    };
  };

  /**
   * التحقق من صلاحيات المستخدم
   * @param resource - المورد
   * @param action - العملية
   * @returns true إذا كان المستخدم لديه الصلاحية
   */
  const canAction = (resource: string, action: string): boolean => {
    return can(`${resource}.${action}`);
  };

  /**
   * التحقق من أن المستخدم مدير النظام
   * @returns true إذا كان المستخدم SUPER_ADMIN
   */
  const isSuperAdmin = (): boolean => {
    return user?.role === 'SUPER_ADMIN';
  };

  /**
   * التحقق من أن المستخدم مدير شركة
   * @returns true إذا كان المستخدم COMPANY_ADMIN
   */
  const isCompanyAdmin = (): boolean => {
    return user?.role === 'COMPANY_ADMIN';
  };

  /**
   * التحقق من أن المستخدم مدير
   * @returns true إذا كان المستخدم MANAGER
   */
  const isManager = (): boolean => {
    return user?.role === 'MANAGER';
  };

  /**
   * التحقق من أن المستخدم وكيل
   * @returns true إذا كان المستخدم AGENT
   */
  const isAgent = (): boolean => {
    return user?.role === 'AGENT';
  };

  /**
   * التحقق من أن المستخدم مشاهد
   * @returns true إذا كان المستخدم VIEWER
   */
  const isViewer = (): boolean => {
    return user?.role === 'VIEWER';
  };

  /**
   * الحصول على دور المستخدم
   * @returns دور المستخدم
   */
  const getUserRole = (): string => {
    return user?.role || '';
  };

  /**
   * الحصول على اسم المستخدم الكامل
   * @returns اسم المستخدم الكامل
   */
  const getUserFullName = (): string => {
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`;
  };

  return {
    // الصلاحيات الأساسية
    can,
    canAny,
    canAll,
    canCRUD,
    canAction,

    // أدوار المستخدم
    isSuperAdmin,
    isCompanyAdmin,
    isManager,
    isAgent,
    isViewer,

    // معلومات المستخدم
    getUserRole,
    getUserFullName,

    // معلومات إضافية
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    isAuthenticated,
  };
};
