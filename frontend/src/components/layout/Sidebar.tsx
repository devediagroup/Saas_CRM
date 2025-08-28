import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  console.log(`Sidebar - Language: ${i18n.language}, RTL: ${isRTL}`);

  // Fetch current user to determine role
  const { data: me } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => apiClient.get('/auth/me').then(res => res.data).catch(() => null)
  });
  const role: string = (me?.role || me?.data?.role || 'user')?.toLowerCase();

  // Full menu registry
  const allItems = [
    { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { key: 'leads', href: '/leads', icon: Users, label: t('nav.leads') },
    { key: 'properties', href: '/properties', icon: Building2, label: t('nav.properties') },
    { key: 'deals', href: '/deals', icon: Handshake, label: t('nav.deals') },
    { key: 'activities', href: '/activities', icon: Calendar, label: t('nav.activities') },
    { key: 'settings', href: '/settings', icon: Settings, label: t('nav.settings') },

    // Extended pages (routes must exist in router)
    { key: 'analytics', href: '/analytics', icon: LayoutDashboard, label: t('nav.analytics') },
    { key: 'companies', href: '/companies', icon: Building2, label: t('nav.companies') },
    { key: 'marketing', href: '/marketing-campaigns', icon: Handshake, label: t('nav.marketing') },
    { key: 'leadSources', href: '/lead-sources', icon: Users, label: t('nav.leadSources') },
    { key: 'payments', href: '/payments-subscriptions', icon: Settings, label: t('nav.payments') },
    { key: 'whatsapp', href: '/whatsapp', icon: Users, label: t('nav.whatsapp') },
    { key: 'rolesPermissions', href: '/roles-permissions', icon: Settings, label: t('nav.roles') },
    { key: 'reports', href: '/advanced-reports', icon: LayoutDashboard, label: t('nav.reports') },
  ] as const;

  // Role to allowed menu keys mapping
  const roleMap: Record<string, string[]> = {
    admin: ['dashboard','leads','properties','deals','activities','analytics','companies','marketing','leadSources','payments','whatsapp','rolesPermissions','reports','settings'],
    manager: ['dashboard','leads','properties','deals','activities','analytics','companies','marketing','leadSources','whatsapp','settings'],
    agent: ['dashboard','leads','properties','deals','activities','whatsapp','settings'],
    user: ['dashboard','activities','settings']
  };

  const allowedKeys = roleMap[role] || roleMap.user;
  const menuItems = allItems.filter(item => allowedKeys.includes(item.key));

  return (
    <aside className={`w-64 bg-white shadow-sm ${isRTL ? 'border-l' : 'border-r'}`}>
      <nav className="p-6">
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.svg" alt="Logo" className="h-12 w-12 mb-2" />
          <h2 className="text-lg font-semibold text-gray-900 text-center">
            EchoOps CRM
          </h2>
        </div>

        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                style={isRTL ? { justifyContent: 'flex-start' } : {}}
              >
                <span className="inline-flex w-6 justify-center items-center">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Button
            variant="ghost"
            className={`w-full text-gray-700 hover:bg-gray-100 flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}
            style={isRTL ? { justifyContent: 'flex-start' } : {}}
          >
            <span className="inline-flex w-6 justify-center items-center">
              <LogOut className="h-5 w-5" />
            </span>
            <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>{t('nav.logout')}</span>
          </Button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;