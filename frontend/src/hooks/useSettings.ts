import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newLeads: boolean;
  dealUpdates: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  activityReminders: boolean;
  whatsappMessages: boolean;
  reportSchedule: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginNotifications: boolean;
  passwordExpiry: string;
}

interface AppearanceSettings {
  theme: string;
  language: string;
  dateFormat: string;
  currency: string;
  timezone: string;
  compactMode: boolean;
}

interface IntegrationSettings {
  whatsappConnected: boolean;
  emailConnected: boolean;
  smsConnected: boolean;
  calendarConnected: boolean;
  crmConnected: boolean;
  webhooksEnabled: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  newLeads: true,
  dealUpdates: true,
  systemAlerts: true,
  marketingEmails: false,
  activityReminders: true,
  whatsappMessages: true,
  reportSchedule: 'weekly'
};

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: "30",
  loginNotifications: true,
  passwordExpiry: "90"
};

const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: "light",
  language: "ar",
  dateFormat: "dd/mm/yyyy",
  currency: "SAR",
  timezone: "Asia/Riyadh",
  compactMode: false
};

const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  whatsappConnected: false,
  emailConnected: true,
  smsConnected: false,
  calendarConnected: false,
  crmConnected: true,
  webhooksEnabled: false
};

export const useSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(DEFAULT_APPEARANCE_SETTINGS);
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(DEFAULT_INTEGRATION_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedNotificationSettings = localStorage.getItem('notificationSettings');
      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings));
      }

      const savedSecuritySettings = localStorage.getItem('securitySettings');
      if (savedSecuritySettings) {
        setSecuritySettings(JSON.parse(savedSecuritySettings));
      }

      const savedAppearanceSettings = localStorage.getItem('appearanceSettings');
      if (savedAppearanceSettings) {
        setAppearanceSettings(JSON.parse(savedAppearanceSettings));
      }

      const savedIntegrationSettings = localStorage.getItem('integrationSettings');
      if (savedIntegrationSettings) {
        setIntegrationSettings(JSON.parse(savedIntegrationSettings));
      }
    } catch (error) {
      console.error(t('hardcoded.settingsLoadError') + ':', error);
    }
  }, []);

  // Save settings to localStorage
  const saveNotificationSettings = (settings: NotificationSettings) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
      toast.success('تم حفظ إعدادات الإشعارات بنجاح');
    } catch (error) {
      console.error(t('hardcoded.notificationSettingsSaveError') + ':', error);
      toast.error('حدث خطأ في حفظ إعدادات الإشعارات');
    }
  };

  const saveSecuritySettings = (settings: SecuritySettings) => {
    try {
      localStorage.setItem('securitySettings', JSON.stringify(settings));
      setSecuritySettings(settings);
      toast.success('تم حفظ إعدادات الأمان بنجاح');
    } catch (error) {
      console.error(t('hardcoded.securitySettingsSaveError') + ':', error);
      toast.error('حدث خطأ في حفظ إعدادات الأمان');
    }
  };

  const saveAppearanceSettings = (settings: AppearanceSettings) => {
    try {
      localStorage.setItem('appearanceSettings', JSON.stringify(settings));
      setAppearanceSettings(settings);
      
      // Apply theme immediately
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      toast.success('تم حفظ إعدادات المظهر بنجاح');
    } catch (error) {
      console.error(t('hardcoded.appearanceSettingsSaveError') + ':', error);
      toast.error('حدث خطأ في حفظ إعدادات المظهر');
    }
  };

  const saveIntegrationSettings = (settings: IntegrationSettings) => {
    try {
      localStorage.setItem('integrationSettings', JSON.stringify(settings));
      setIntegrationSettings(settings);
      toast.success('تم حفظ إعدادات التكاملات بنجاح');
    } catch (error) {
      console.error(t('hardcoded.integrationSettingsSaveError') + ':', error);
      toast.error('حدث خطأ في حفظ إعدادات التكاملات');
    }
  };

  // Reset all settings to defaults
  const resetAllSettings = () => {
    try {
      localStorage.removeItem('notificationSettings');
      localStorage.removeItem('securitySettings');
      localStorage.removeItem('appearanceSettings');
      localStorage.removeItem('integrationSettings');
      
      setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
      setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
      setAppearanceSettings(DEFAULT_APPEARANCE_SETTINGS);
      setIntegrationSettings(DEFAULT_INTEGRATION_SETTINGS);
      
      toast.success('تم إعادة تعيين جميع الإعدادات إلى القيم الافتراضية');
    } catch (error) {
      console.error(t('hardcoded.settingsResetError') + ':', error);
      toast.error('حدث خطأ في إعادة تعيين الإعدادات');
    }
  };

  // Apply theme on settings load
  useEffect(() => {
    if (appearanceSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (appearanceSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [appearanceSettings.theme]);

  return {
    // Settings
    notificationSettings,
    securitySettings,
    appearanceSettings,
    integrationSettings,
    
    // Update functions
    updateNotificationSettings: setNotificationSettings,
    updateSecuritySettings: setSecuritySettings,
    updateAppearanceSettings: setAppearanceSettings,
    updateIntegrationSettings: setIntegrationSettings,
    
    // Save functions
    saveNotificationSettings,
    saveSecuritySettings,
    saveAppearanceSettings,
    saveIntegrationSettings,
    
    // Utility functions
    resetAllSettings
  };
}; 