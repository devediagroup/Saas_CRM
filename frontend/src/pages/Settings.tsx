import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Plug,
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Key,
  Smartphone,
  MessageCircle,
  DollarSign,
  Camera,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

const Settings = () => {
  const { t } = useTranslation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.me()
  });

  // Update profile data when user data changes
  React.useEffect(() => {
    if (userData?.data) {
      setProfileData({
        username: userData.data.username || '',
        email: userData.data.email || '',
        firstName: userData.data.firstName || '',
        lastName: userData.data.lastName || '',
        phone: userData.data.phone || '',
        avatar: userData.data.avatar || ''
      });
    }
  }, [userData]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    avatar: ""
  });

  // جلب بيانات الشركة من API
  const { data: companyInfo, isLoading: companyLoading } = useQuery({
    queryKey: ['companyInfo'],
    queryFn: () => api.getCompany('current')
  });

  // Company form state - استخدام بيانات حقيقية
  const [companyData, setCompanyData] = useState({
    name: companyInfo?.data?.name || "",
    email: companyInfo?.data?.email || "",
    phone: companyInfo?.data?.phone || "",
    address: companyInfo?.data?.address || "",
    website: companyInfo?.data?.website || "",
    description: companyInfo?.data?.description || ""
  });

  // تحديث بيانات الشركة عند تحميلها من API
  useEffect(() => {
    if (companyInfo?.data) {
      setCompanyData({
        name: companyInfo.data.name || "",
        email: companyInfo.data.email || "",
        phone: companyInfo.data.phone || "",
        address: companyInfo.data.address || "",
        website: companyInfo.data.website || "",
        description: companyInfo.data.description || ""
      });
    }
  }, [companyInfo]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
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
  });

  // Security settings state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginNotifications: true,
    passwordExpiry: "90"
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    language: "ar",
    dateFormat: "dd/mm/yyyy",
    currency: "SAR",
    timezone: "Asia/Riyadh",
    compactMode: false
  });

  // Integration settings state
  const [integrationSettings, setIntegrationSettings] = useState({
    whatsappConnected: false,
    emailConnected: true,
    smsConnected: false,
    calendarConnected: false,
    crmConnected: true,
    webhooksEnabled: false
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success(t('settings.profile.success'));
    },
    onError: () => {
      toast.error(t('settings.profile.error'));
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updatePassword(data),
    onSuccess: () => {
      toast.success(t('settings.security.passwordSuccess'));
      setSecurityData({
        ...securityData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: () => {
      toast.error(t('settings.security.passwordError'));
    }
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateCompany("1", data),
    onSuccess: () => {
      toast.success(t('settings.company.success'));
    },
    onError: () => {
      toast.error(t('settings.company.error'));
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error(t('settings.security.passwordMismatch'));
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: securityData.currentPassword,
      newPassword: securityData.newPassword
    });
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate(companyData);
  };

  const handleSaveSettings = (section: string, data: any) => {
    // Here you can add API calls for saving in the future
    toast.success(t('settings.messages.sectionSaved', { section }));
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(securityData.newPassword);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground arabic-text">{t('settings.title')}</h1>
          <p className="text-muted-foreground arabic-text mt-2">
            {t('settings.profile.subtitle')}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-6 bg-muted/50">
            <TabsTrigger value="profile" className="gap-2 arabic-text data-[state=active]:bg-background">
              <User className="h-4 w-4" />
              {t('settings.profile.title')}
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2 arabic-text data-[state=active]:bg-background">
              <Building2 className="h-4 w-4" />
              {t('settings.company.title')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 arabic-text data-[state=active]:bg-background">
              <Bell className="h-4 w-4" />
              {t('settings.notifications.title')}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 arabic-text data-[state=active]:bg-background">
              <Shield className="h-4 w-4" />
              {t('settings.security.title')}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 arabic-text data-[state=active]:bg-background">
              <Palette className="h-4 w-4" />
              {t('settings.appearance.title')}
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2 arabic-text data-[state=active]:bg-background">
              <Plug className="h-4 w-4" />
              {t('settings.integrations.title')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <User className="h-5 w-5" />
                  {t('settings.profile.personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profileData.avatar} />
                      <AvatarFallback className="text-lg bg-gradient-primary text-white">
                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="gap-2 arabic-text">
                        <Camera className="h-4 w-4" />
                        {t('settings.profile.uploadAvatar')}
                      </Button>
                      <p className="text-xs text-muted-foreground arabic-text">
                        {t('settings.profile.avatarDescription')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="arabic-text">{t('settings.profile.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="arabic-text">{t('settings.profile.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="arabic-text"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="arabic-text">{t('settings.profile.username')}</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="arabic-text">{t('settings.profile.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="arabic-text">{t('settings.profile.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="pr-10 arabic-text"
                        placeholder="+966501234567"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="gap-2 arabic-text"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? t('settings.profile.saving') : t('settings.profile.saveProfile')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Building2 className="h-5 w-5" />
                  {t('settings.company.companyInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="arabic-text">{t('settings.company.companyName')}</Label>
                      <Input
                        id="companyName"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail" className="arabic-text">{t('settings.company.companyEmail')}</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyEmail"
                          type="email"
                          value={companyData.email}
                          onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                          className="pr-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone" className="arabic-text">{t('settings.company.companyPhone')}</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyPhone"
                          value={companyData.phone}
                          onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                          className="pr-10 arabic-text"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="arabic-text">{t('settings.company.companyWebsite')}</Label>
                      <Input
                        id="website"
                        value={companyData.website}
                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="arabic-text">{t('settings.company.companyAddress')}</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={companyData.address}
                        onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                        className="pr-10 arabic-text"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="arabic-text">{t('settings.company.companyDescription')}</Label>
                    <Textarea
                      id="description"
                      value={companyData.description}
                      onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                      className="arabic-text"
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateCompanyMutation.isPending}
                    className="gap-2 arabic-text"
                  >
                    <Save className="h-4 w-4" />
                    {updateCompanyMutation.isPending ? t('settings.company.saving') : t('settings.company.saveCompany')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Bell className="h-5 w-5" />
                  {t('settings.notifications.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.notifications.notificationMethods')}</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="arabic-text">{t('settings.notifications.emailNotifications')}</Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {t('settings.notifications.emailNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="arabic-text">{t('settings.notifications.smsNotifications')}</Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {t('settings.notifications.smsNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="arabic-text">{t('settings.notifications.pushNotifications')}</Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {t('settings.notifications.pushNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.notifications.notificationTypes')}</h3>

                  <div className="flex items-center justify-between">
                    <Label className="arabic-text">{t('settings.notifications.newLeads')}</Label>
                    <Switch
                      checked={notificationSettings.newLeads}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, newLeads: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="arabic-text">{t('settings.notifications.dealUpdates')}</Label>
                    <Switch
                      checked={notificationSettings.dealUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, dealUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="arabic-text">{t('settings.notifications.systemAlerts')}</Label>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, systemAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="arabic-text">{t('settings.notifications.activityReminders')}</Label>
                    <Switch
                      checked={notificationSettings.activityReminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, activityReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="arabic-text">{t('settings.notifications.whatsappMessages')}</Label>
                    <Switch
                      checked={notificationSettings.whatsappMessages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, whatsappMessages: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.notifications.reports')}</h3>

                  <div className="space-y-2">
                    <Label className="arabic-text">{t('settings.notifications.reportSchedule')}</Label>
                    <Select
                      value={notificationSettings.reportSchedule}
                      onValueChange={(value) =>
                        setNotificationSettings({ ...notificationSettings, reportSchedule: value })
                      }
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t('settings.notifications.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('settings.notifications.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('settings.notifications.monthly')}</SelectItem>
                        <SelectItem value="never">{t('settings.notifications.never')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings(t('settings.notifications.title'), notificationSettings)}
                  className="gap-2 arabic-text"
                >
                  <Save className="h-4 w-4" />
                  {t('settings.notifications.saveNotifications')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Shield className="h-5 w-5" />
                  {t('settings.security.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.security.changePassword')}</h3>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="arabic-text">{t('settings.security.currentPassword')}</Label>
                      <div className="relative">
                        <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                          className="pr-10 pl-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1 h-8 w-8"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="arabic-text">{t('settings.security.newPassword')}</Label>
                      <div className="relative">
                        <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                          className="pr-10 pl-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1 h-8 w-8"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>

                      {securityData.newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm arabic-text">{t('settings.security.passwordStrength')}</Label>
                            <Badge variant={passwordStrength >= 75 ? "default" : passwordStrength >= 50 ? "secondary" : "destructive"}>
                              {passwordStrength >= 75 ? t('settings.security.strong') : passwordStrength >= 50 ? t('settings.security.medium') : t('settings.security.weak')}
                            </Badge>
                          </div>
                          <Progress value={passwordStrength} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="arabic-text">{t('settings.security.confirmPassword')}</Label>
                      <div className="relative">
                        <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                          className="pr-10 pl-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1 h-8 w-8"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>

                      {securityData.confirmPassword && (
                        <div className="flex items-center gap-2 text-sm">
                          {securityData.newPassword === securityData.confirmPassword ? (
                            <><Check className="h-4 w-4 text-green-500" /><span className="text-green-500 arabic-text">{t('settings.security.passwordMatch')}</span></>
                          ) : (
                            <><X className="h-4 w-4 text-red-500" /><span className="text-red-500 arabic-text">{t('settings.security.passwordMismatch')}</span></>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isPending || securityData.newPassword !== securityData.confirmPassword}
                      className="gap-2 arabic-text"
                    >
                      <Shield className="h-4 w-4" />
                      {updatePasswordMutation.isPending ? t('settings.security.updatingPassword') : t('settings.security.updatePassword')}
                    </Button>
                  </form>
                </div>

                <Separator />

                {/* Two Factor Authentication */}
                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.security.twoFactor')}</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="arabic-text">{t('settings.security.enableTwoFactor')}</Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {t('settings.security.twoFactorDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={securityData.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        setSecurityData({ ...securityData, twoFactorEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="arabic-text">{t('settings.security.loginNotifications')}</Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {t('settings.security.loginNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={securityData.loginNotifications}
                      onCheckedChange={(checked) =>
                        setSecurityData({ ...securityData, loginNotifications: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Session Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.security.sessionSettings')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="arabic-text">{t('settings.security.sessionTimeoutLabel')}</Label>
                      <Select
                        value={securityData.sessionTimeout}
                        onValueChange={(value) =>
                          setSecurityData({ ...securityData, sessionTimeout: value })
                        }
                      >
                        <SelectTrigger dir="rtl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 {t('settings.security.minutes')}</SelectItem>
                          <SelectItem value="30">30 {t('settings.security.minutes')}</SelectItem>
                          <SelectItem value="60">{t('settings.security.oneHour')}</SelectItem>
                          <SelectItem value="120">{t('settings.security.twoHours')}</SelectItem>
                          <SelectItem value="480">8 {t('settings.security.hours')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="arabic-text">{t('settings.security.passwordExpiryLabel')}</Label>
                      <Select
                        value={securityData.passwordExpiry}
                        onValueChange={(value) =>
                          setSecurityData({ ...securityData, passwordExpiry: value })
                        }
                      >
                        <SelectTrigger dir="rtl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 {t('settings.security.days')}</SelectItem>
                          <SelectItem value="60">60 {t('settings.security.days')}</SelectItem>
                          <SelectItem value="90">90 {t('settings.security.days')}</SelectItem>
                          <SelectItem value="365">{t('settings.security.oneYear')}</SelectItem>
                          <SelectItem value="never">{t('settings.security.neverExpires')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings(t('settings.security.title'), securityData)}
                  className="gap-2 arabic-text"
                >
                  <Save className="h-4 w-4" />
                  {t('settings.security.saveSecurity')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Palette className="h-5 w-5" />
                  {t('settings.appearance.appearanceSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="arabic-text">{t('settings.appearance.theme')}</Label>
                    <Select
                      value={appearanceSettings.theme}
                      onValueChange={(value) =>
                        setAppearanceSettings({ ...appearanceSettings, theme: value })
                      }
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t('settings.appearance.light')}</SelectItem>
                        <SelectItem value="dark">{t('settings.appearance.dark')}</SelectItem>
                        <SelectItem value="system">{t('settings.appearance.system')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="arabic-text">{t('settings.appearance.language')}</Label>
                    <Select
                      value={appearanceSettings.language}
                      onValueChange={(value) =>
                        setAppearanceSettings({ ...appearanceSettings, language: value })
                      }
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">{t('settings.appearance.arabic')}</SelectItem>
                        <SelectItem value="en">{t('settings.appearance.english')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="arabic-text">{t('settings.appearance.dateFormat')}</Label>
                    <Select
                      value={appearanceSettings.dateFormat}
                      onValueChange={(value) =>
                        setAppearanceSettings({ ...appearanceSettings, dateFormat: value })
                      }
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">31/12/2024</SelectItem>
                        <SelectItem value="mm/dd/yyyy">12/31/2024</SelectItem>
                        <SelectItem value="yyyy-mm-dd">2024-12-31</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="arabic-text">{t('settings.appearance.currency')}</Label>
                    <Select
                      value={appearanceSettings.currency}
                      onValueChange={(value) =>
                        setAppearanceSettings({ ...appearanceSettings, currency: value })
                      }
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">{t('settings.appearance.sar')}</SelectItem>
                        <SelectItem value="USD">{t('settings.appearance.usd')}</SelectItem>
                        <SelectItem value="EUR">{t('settings.appearance.eur')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="arabic-text">{t('settings.appearance.timezone')}</Label>
                    <Select
                      value={appearanceSettings.timezone}
                      onValueChange={(value) =>
                        setAppearanceSettings({ ...appearanceSettings, timezone: value })
                      }
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">{t('settings.appearance.riyadh')}</SelectItem>
                        <SelectItem value="Asia/Dubai">{t('settings.appearance.dubai')}</SelectItem>
                        <SelectItem value="Europe/London">{t('settings.appearance.london')}</SelectItem>
                        <SelectItem value="America/New_York">{t('settings.appearance.newyork')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="arabic-text">{t('settings.appearance.compactMode')}</Label>
                    <p className="text-sm text-muted-foreground arabic-text">
                      {t('settings.appearance.compactModeDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) =>
                      setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                    }
                  />
                </div>

                <Button
                  onClick={() => handleSaveSettings(t('settings.appearance.title'), appearanceSettings)}
                  className="gap-2 arabic-text"
                >
                  <Save className="h-4 w-4" />
                  {t('settings.appearance.saveAppearance')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <Plug className="h-5 w-5" />
                  {t('settings.integrations.externalIntegrations')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* WhatsApp Integration */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium arabic-text">{t('settings.integrations.whatsapp')}</h3>
                        <p className="text-sm text-muted-foreground arabic-text">
                          {t('settings.integrations.whatsappDesc')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integrationSettings.whatsappConnected ? "default" : "secondary"}>
                        {integrationSettings.whatsappConnected ? t('settings.integrations.connected') : t('settings.integrations.disconnected')}
                      </Badge>
                      <Switch
                        checked={integrationSettings.whatsappConnected}
                        onCheckedChange={(checked) =>
                          setIntegrationSettings({ ...integrationSettings, whatsappConnected: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Email Integration */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium arabic-text">{t('settings.integrations.email')}</h3>
                        <p className="text-sm text-muted-foreground arabic-text">
                          {t('settings.integrations.emailDesc')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integrationSettings.emailConnected ? "default" : "secondary"}>
                        {integrationSettings.emailConnected ? t('settings.integrations.connected') : t('settings.integrations.disconnected')}
                      </Badge>
                      <Switch
                        checked={integrationSettings.emailConnected}
                        onCheckedChange={(checked) =>
                          setIntegrationSettings({ ...integrationSettings, emailConnected: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* SMS Integration */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Smartphone className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium arabic-text">{t('settings.integrations.sms')}</h3>
                        <p className="text-sm text-muted-foreground arabic-text">
                          {t('settings.integrations.smsDesc')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integrationSettings.smsConnected ? "default" : "secondary"}>
                        {integrationSettings.smsConnected ? t('settings.integrations.connected') : t('settings.integrations.disconnected')}
                      </Badge>
                      <Switch
                        checked={integrationSettings.smsConnected}
                        onCheckedChange={(checked) =>
                          setIntegrationSettings({ ...integrationSettings, smsConnected: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Calendar Integration */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium arabic-text">{t('settings.integrations.calendar')}</h3>
                        <p className="text-sm text-muted-foreground arabic-text">
                          {t('settings.integrations.calendarDesc')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={integrationSettings.calendarConnected ? "default" : "secondary"}>
                        {integrationSettings.calendarConnected ? t('settings.integrations.connected') : t('settings.integrations.disconnected')}
                      </Badge>
                      <Switch
                        checked={integrationSettings.calendarConnected}
                        onCheckedChange={(checked) =>
                          setIntegrationSettings({ ...integrationSettings, calendarConnected: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium arabic-text">{t('settings.integrations.webhooks')}</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="arabic-text">{t('settings.integrations.enableWebhooks')}</Label>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {t('settings.integrations.webhooksDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={integrationSettings.webhooksEnabled}
                      onCheckedChange={(checked) =>
                        setIntegrationSettings({ ...integrationSettings, webhooksEnabled: checked })
                      }
                    />
                  </div>

                  {integrationSettings.webhooksEnabled && (
                    <div className="space-y-2">
                      <Label className="arabic-text">{t('settings.integrations.webhookUrl')}</Label>
                      <Input
                        placeholder="https://your-website.com/webhook"
                        className="arabic-text"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSaveSettings(t('settings.integrations.title'), integrationSettings)}
                  className="gap-2 arabic-text"
                >
                  <Save className="h-4 w-4" />
                  {t('settings.integrations.saveIntegrations')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings; 