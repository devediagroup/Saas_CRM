import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

const languages = [
  {
    code: 'ar',
    nameKey: 'language.arabic',
    flag: '🇸🇦',
    direction: 'rtl'
  },
  {
    code: 'en',
    nameKey: 'language.english',
    flag: '🇺🇸',
    direction: 'ltr'
  }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);

      // Update document direction
      const lang = languages.find(l => l.code === languageCode);
      if (lang) {
        document.documentElement.dir = lang.direction;
        document.documentElement.lang = languageCode;

        // Store language preference
        localStorage.setItem('language', languageCode);
        localStorage.setItem('direction', lang.direction);

        // Force re-render by dispatching custom event
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: languageCode, direction: lang.direction }
        }));
      }
    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.nameKey ? t(currentLanguage.nameKey) : ''}
          </span>
          <span className="sm:hidden">
            {currentLanguage?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-2">{language.flag}</span>
              <span>{language.nameKey ? t(language.nameKey) : ''}</span>
            </div>
            {i18n.language === language.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
