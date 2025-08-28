import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Bell, Download, Smartphone, Wifi } from 'lucide-react';

interface InstallPromptProps {
  variant?: 'banner' | 'modal' | 'floating';
  className?: string;
  installPWA: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  variant = 'floating',
  className,
  installPWA
}) => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Smartphone className="w-4 h-4" />,
      title: t('pwa.features.offline'),
      description: t('pwa.features.offlineDesc')
    },
    {
      icon: <Wifi className="w-4 h-4" />,
      title: t('pwa.features.autoUpdate'),
      description: t('pwa.features.autoUpdateDesc')
    },
    {
      icon: <Bell className="w-4 h-4" />,
      title: t('pwa.features.notifications'),
      description: t('pwa.features.notificationsDesc')
    },
    {
      icon: <Download className="w-4 h-4" />,
      title: t('pwa.features.faster'),
      description: t('pwa.features.fasterDesc')
    }
  ];

  if (variant === 'banner') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">{t('pwa.installTitle')}</h3>
              <p className="text-sm opacity-90">
                {t('pwa.installSubtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={installPWA}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('pwa.install')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <Card className={cn('max-w-md mx-auto', className)}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>{t('pwa.installTitle')}</CardTitle>
          <CardDescription>
            {t('pwa.installSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  {feature.icon}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{feature.title}</div>
                  <div className="text-gray-500 text-xs">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={installPWA} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {t('pwa.installApp')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Floating variant (default)
  return (
    <div className={cn(
      'fixed bottom-4 left-4 z-50 max-w-sm',
      'bg-white rounded-lg shadow-lg border p-4',
      'animate-in slide-in-from-bottom-2',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            تثبيت تطبيق EchoOps CRM
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            احصل على أفضل تجربة مع التطبيق المثبت على جهازك
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={installPWA} className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              تثبيت
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => localStorage.setItem('pwa-dismissed', 'true')}
              className="text-xs"
            >
              لاحقاً
            </Button>
          </div>
        </div>
        <button
          onClick={() => localStorage.setItem('pwa-dismissed', 'true')}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
