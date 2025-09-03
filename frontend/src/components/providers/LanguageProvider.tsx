import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial language direction and document attributes
    const handleLanguageChange = (lng: string) => {
      const languages = {
        'ar': { direction: 'rtl', name: 'العربية' },
        'en': { direction: 'ltr', name: 'English' }
      };

      const lang = languages[lng as keyof typeof languages];
      if (lang) {
        // Update HTML element
        document.documentElement.dir = lang.direction;
        document.documentElement.lang = lng;

        // Update body element
        document.body.dir = lang.direction;
        document.body.className = lang.direction === 'rtl' ? 'rtl' : 'ltr';

        // Store preferences
        localStorage.setItem('language', lng);
        localStorage.setItem('direction', lang.direction);

        // Add RTL/LTR classes to body for additional CSS support
        if (lang.direction === 'rtl') {
          document.body.classList.add('rtl');
          document.body.classList.remove('ltr');
        } else {
          document.body.classList.add('ltr');
          document.body.classList.remove('rtl');
        }

        // Force re-render of components that depend on direction
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: lng, direction: lang.direction }
        }));
      }
    };

    // Set initial language with fallback
    const savedLanguage = localStorage.getItem('language') ||
      localStorage.getItem('i18nextLng') ||
      'ar';

    // Force language change if needed
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return <>{children}</>;
};
