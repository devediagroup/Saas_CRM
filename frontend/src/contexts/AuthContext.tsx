import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// أنواع البيانات
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshUserPermissions: () => Promise<void>;
}

// إنشاء Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook مخصص لاستخدام AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props للمكون
interface AuthProviderProps {
  children: ReactNode;
}

// مكون AuthProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // التحقق من وجود مستخدم مسجل
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔄 Starting auth status check...');
      try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token check:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');

        if (token) {
          console.log('🚀 Making API call to /api/auth/me');
          console.log('🔑 Using token:', token.substring(0, 20) + '...');
          // التحقق من صحة التوكن
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('📶 API Response status:', response.status);
          console.log('📶 API Response headers:', Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const userData = await response.json();
            console.log('👤 User data loaded:', userData);

            // إذا كان المستخدم SUPER_ADMIN، أضف جميع الصلاحيات مؤقتاً
            if (userData.role === 'SUPER_ADMIN' || userData.role === 'super_admin') {
              console.log('🔧 SUPER_ADMIN detected on auth check, adding all permissions');
              const allPermissions = [
                'leads.create', 'leads.read', 'leads.update', 'leads.delete',
                'properties.create', 'properties.read', 'properties.update', 'properties.delete',
                'companies.create', 'companies.read', 'companies.update', 'companies.delete',
                'developers.create', 'developers.read', 'developers.update', 'developers.delete',
                'projects.create', 'projects.read', 'projects.update', 'projects.delete',
                'activities.create', 'activities.read', 'activities.update', 'activities.delete',
                'deals.create', 'deals.read', 'deals.update', 'deals.delete',
                'users.create', 'users.read', 'users.update', 'users.delete',
                'settings.read', 'settings.update',
                'analytics.read', 'reports.read'
              ];
              userData.permissions = allPermissions;
              console.log('✅ Permissions added to user data:', allPermissions.length, 'permissions');
            }

            setUser(userData);
            console.log('✅ User state updated successfully');
          } else {
            // التوكن غير صالح
            console.log('❌ Token invalid, status:', response.status);
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
            localStorage.removeItem('token');
          }
        } else {
          console.log('ℹ️ No token found in localStorage');
        }
      } catch (error) {
        console.error('❌ Error in auth check:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        localStorage.removeItem('token');
      } finally {
        console.log('✅ Auth check completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // تسجيل الدخول
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('فشل في تسجيل الدخول');
      }

      const { token, user: userData } = await response.json();

      // حفظ التوكن
      localStorage.setItem('token', token);

      // تحديث حالة المستخدم
      setUser(userData);

      // إذا كان المستخدم SUPER_ADMIN، أضف جميع الصلاحيات مؤقتاً
      if (userData.role === 'SUPER_ADMIN' || userData.role === 'super_admin') {
        console.log('🔧 SUPER_ADMIN detected, adding all permissions');
        const allPermissions = [
          'leads.create', 'leads.read', 'leads.update', 'leads.delete',
          'properties.create', 'properties.read', 'properties.update', 'properties.delete',
          'companies.create', 'companies.read', 'companies.update', 'companies.delete',
          'developers.create', 'developers.read', 'developers.update', 'developers.delete',
          'projects.create', 'projects.read', 'projects.update', 'projects.delete',
          'activities.create', 'activities.read', 'activities.update', 'activities.delete',
          'deals.create', 'deals.read', 'deals.update', 'deals.delete',
          'users.create', 'users.read', 'users.update', 'users.delete',
          'settings.read', 'settings.update',
          'analytics.read', 'reports.read'
        ];
        setUser(prev => prev ? { ...prev, permissions: allPermissions } : null);
      }

      // جلب الصلاحيات
      await refreshUserPermissions();
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // جلب صلاحيات المستخدم
  const refreshUserPermissions = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { permissions } = await response.json();
        setUser(prev => prev ? { ...prev, permissions } : null);
      }
    } catch (error) {
      console.error('خطأ في جلب الصلاحيات:', error);
    }
  };

  // التحقق من وجود صلاحية واحدة
  const hasPermission = (permission: string): boolean => {
    // إضافة logging للتشخيص
    console.log('🔍 hasPermission check:', {
      permission,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      } : null,
      hasUser: !!user,
      hasPermissions: !!user?.permissions,
      isSuperAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin'
    });

    if (!user) {
      console.log('❌ No user found');
      return false;
    }

    // SUPER_ADMIN لديه جميع الصلاحيات
    if (user.role === 'SUPER_ADMIN' || user.role === 'super_admin') {
      console.log('✅ SUPER_ADMIN has all permissions');
      return true;
    }

    // التحقق من الصلاحية المحددة
    if (!user.permissions) {
      console.log('❌ No permissions array found');
      return false;
    }

    const hasIt = user.permissions.includes(permission);
    console.log(`${hasIt ? '✅' : '❌'} Permission ${permission}: ${hasIt}`);
    return hasIt;
  };

  // التحقق من وجود أي صلاحية من مجموعة
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // التحقق من وجود جميع الصلاحيات
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // قيمة Context
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshUserPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
