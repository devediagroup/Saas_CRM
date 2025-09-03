import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');

  useEffect(() => {
    const handleLanguageChange = () => {
      const newIsRTL = i18n.language === 'ar';
      setIsRTL(newIsRTL);
    };

    // Listen to i18n language changes
    i18n.on('languageChanged', handleLanguageChange);

    // Listen to custom language change event
    const handleCustomLanguageChange = (event: CustomEvent) => {
      const { direction } = event.detail;
      const newIsRTL = direction === 'rtl';
      setIsRTL(newIsRTL);
    };

    window.addEventListener('languageChanged', handleCustomLanguageChange as EventListener);

    // Initial setup with delay to ensure LanguageProvider runs first
    setTimeout(() => {
      handleLanguageChange();
    }, 100);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languageChanged', handleCustomLanguageChange as EventListener);
    };
  }, [i18n]);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;