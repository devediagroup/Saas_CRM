import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

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

// Helper functions for SUPER_ADMIN permissions
const getSuperAdminPermissions = (): string[] => [
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

const isSuperAdmin = (role: string): boolean =>
  role === 'SUPER_ADMIN' || role === 'super_admin';

const enhanceUserWithPermissions = (userData: any): User => {
  if (isSuperAdmin(userData.role)) {
    console.log('🔧 SUPER_ADMIN detected, adding all permissions');
    return {
      ...userData,
      permissions: getSuperAdminPermissions()
    };
  }
  return userData;
};

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

  // Refs to track component state and prevent memory leaks
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    mountedRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Enhanced fetch with abort controller
  const fetchWithAbort = useCallback(async (url: string, options: RequestInit = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    return fetch(url, {
      ...options,
      signal: abortControllerRef.current.signal,
    });
  }, []);

  // التحقق من وجود مستخدم مسجل
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;

    const checkAuthStatus = async () => {
      if (!mountedRef.current) return;

      console.log('🔄 Starting auth status check...');
      try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token check:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');

        if (token && mountedRef.current) {
          console.log('🚀 Making API call to /api/auth/me');

          const response = await fetchWithAbort('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('📶 API Response status:', response.status);

          if (response.ok && mountedRef.current) {
            const userData = await response.json();
            console.log('👤 User data loaded:', userData);

            // تحسين الكود باستخدام دالة مساعدة
            const enhancedUser = enhanceUserWithPermissions(userData);
            setUser(enhancedUser);
            console.log('✅ User state updated successfully');
          } else if (mountedRef.current) {
            console.log('❌ Token invalid, status:', response.status);
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('🔄 Auth check aborted');
          return;
        }
        console.error('❌ Error in auth check:', error);
        if (mountedRef.current) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          console.log('✅ Auth check completed, setting isLoading to false');
          setIsLoading(false);
        }
      }
    };

    // Add debounce to prevent multiple calls
    debounceTimeout = setTimeout(checkAuthStatus, 100);

    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(debounceTimeout);
      cleanup();
      console.log('🧹 Auth cleanup completed');
    };
  }, [fetchWithAbort, cleanup]);

  // تسجيل الدخول
  const login = useCallback(async (email: string, password: string) => {
    if (!mountedRef.current) return;

    try {
      setIsLoading(true);
      const response = await fetchWithAbort('/api/auth/login', {
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

      if (!mountedRef.current) return;

      // حفظ التوكن
      localStorage.setItem('token', token);

      // تحديث حالة المستخدم مع تعزيز الصلاحيات
      const enhancedUser = enhanceUserWithPermissions(userData);
      setUser(enhancedUser);

      // جلب الصلاحيات
      await refreshUserPermissions();
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('خطأ في تسجيل الدخول:', error);
      throw error;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchWithAbort]);

  // تسجيل الخروج
  const logout = useCallback(() => {
    cleanup();
    localStorage.removeItem('token');
    setUser(null);
  }, [cleanup]);

  // جلب صلاحيات المستخدم
  const refreshUserPermissions = useCallback(async () => {
    if (!user || !mountedRef.current) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAbort('/api/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok && mountedRef.current) {
        const { permissions } = await response.json();
        setUser(prev => prev ? { ...prev, permissions } : null);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('خطأ في جلب الصلاحيات:', error);
    }
  }, [user, fetchWithAbort]);

  // التحقق من وجود صلاحية واحدة
  const hasPermission = useCallback((permission: string): boolean => {
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
  }, [user]);

  // التحقق من وجود أي صلاحية من مجموعة
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // التحقق من وجود جميع الصلاحيات
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
