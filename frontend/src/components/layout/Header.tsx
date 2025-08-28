import React from 'react';
import { useTranslation } from 'react-i18next';
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

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  console.log(`Header - Language: ${i18n.language}, RTL: ${isRTL}`);

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
              <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 ${
                isRTL ? 'right-3' : 'left-3'
              }`} />
              <Input
                type="text"
                placeholder={t('header.search')}
                className={`w-64 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className={`absolute -top-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center ${
                    isRTL ? '-left-1' : '-right-1'
                  }`}>
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-80">
                <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t('header.newLead')}</p>
                    <p className="text-xs text-muted-foreground">{t('header.newLeadDesc')}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t('header.appointment')}</p>
                    <p className="text-xs text-muted-foreground">{t('header.appointmentDesc')}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t('header.dealClosed')}</p>
                    <p className="text-xs text-muted-foreground">{t('header.dealClosedDesc')}</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                <DropdownMenuItem>{t('header.userMenu.profile')}</DropdownMenuItem>
                <DropdownMenuItem>{t('header.userMenu.settings')}</DropdownMenuItem>
                <DropdownMenuItem>{t('header.userMenu.help')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t('header.userMenu.logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;