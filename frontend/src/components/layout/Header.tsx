import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../ui/language-switcher';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isRTL = i18n.language === 'ar';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
            <h1 className="text-xl font-semibold text-gray-900">
              EchoOps CRM
            </h1>
          </div>

          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 ${isRTL ? 'right-3' : 'left-3'
                }`} />
              <Input
                type="text"
                placeholder={t('header.search')}
                className={`w-64 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications - Using real notification data */}
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                <DropdownMenuLabel>{t('header.userMenu.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  {t('header.userMenu.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  {t('header.userMenu.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open('/help', '_blank')}>
                  {t('header.userMenu.help')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  logout();
                  navigate('/login');
                }}>
                  {t('header.userMenu.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;