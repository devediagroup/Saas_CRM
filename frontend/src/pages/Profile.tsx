import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building,
  Shield,
  Key,
  Bell,
  Settings,
  Activity,
  Camera,
  Edit,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role?: string;
  company?: {
    id: number;
    name: string;
  };
  preferences?: any;
  last_login?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: currentUser, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiClient.get('/users/me?populate=*').then(res => res.data),
    onSuccess: (data) => {
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        avatar: data.avatar || ''
      });
    }
  });

  // Fetch user activity stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      // Mock data - in real app, fetch from multiple endpoints
      return {
        leadsCreated: 45,
        dealsCompleted: 23,
        activitiesLogged: 156,
        propertiesAdded: 12,
        loginStreak: 15,
        totalLogins: 234
      };
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(`/users/${currentUser?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success(t('profile.success'));
      setIsEditing(false);
    },
    onError: () => {
      toast.error(t('profile.error'));
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success(t('profile.passwordSuccess'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => {
      toast.error(t('profile.passwordError'));
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('profile.passwordTooShort'));
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      password: passwordData.newPassword,
      passwordConfirmation: passwordData.confirmPassword
    });
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength < 25) return { label: t('profile.weak'), color: 'text-red-600' };
    if (strength < 50) return { label: t('profile.medium'), color: 'text-yellow-600' };
    if (strength < 75) return { label: t('profile.good'), color: 'text-blue-600' };
    return { label: t('profile.strong'), color: 'text-green-600' };
  };

  const getRoleLabel = (role?: string) => {
    return t(`profile.roles.${role || 'user'}`);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('profile.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
            <p className="text-gray-600 mt-1">{t('profile.subtitle')}</p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
                  <AvatarFallback className="text-2xl">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                  variant="outline"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h2>
                  <Badge className={getRoleBadgeColor(currentUser?.role)}>
                    {getRoleLabel(currentUser?.role)}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1">{currentUser?.email}</p>
                {currentUser?.bio && (
                  <p className="text-gray-700 mt-2">{currentUser?.bio}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  {currentUser?.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {currentUser.company.name}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {t('profile.memberSince')} {new Date(currentUser?.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  {currentUser?.last_login && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {t('profile.lastLogin')} {new Date(currentUser.last_login).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="mb-2"
                >
                  {isEditing ? (
                    <>
                      <X className="ml-2 h-4 w-4" />
                      {t('profile.cancel')}
                    </>
                  ) : (
                    <>
                      <Edit className="ml-2 h-4 w-4" />
                      {t('profile.edit')}
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="mr-2"
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? t('profile.saving') : t('profile.save')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{userStats?.leadsCreated || 0}</div>
              <div className="text-sm text-gray-600">{t('profile.stats.leadsCreated')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{userStats?.dealsCompleted || 0}</div>
              <div className="text-sm text-gray-600">{t('profile.stats.dealsCompleted')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{userStats?.activitiesLogged || 0}</div>
              <div className="text-sm text-gray-600">{t('profile.stats.activitiesLogged')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Building className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{userStats?.propertiesAdded || 0}</div>
              <div className="text-sm text-gray-600">{t('profile.stats.propertiesAdded')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-600">{userStats?.loginStreak || 0}</div>
              <div className="text-sm text-gray-600">{t('profile.stats.loginStreak')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{userStats?.totalLogins || 0}</div>
              <div className="text-sm text-gray-600">{t('profile.stats.totalLogins')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">{t('profile.personalInfo')}</TabsTrigger>
            <TabsTrigger value="security">{t('profile.securitySettings')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('profile.preferences')}</TabsTrigger>
            <TabsTrigger value="activity">{t('profile.recentActivity')}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="ml-2 h-5 w-5" />
                  {t('profile.personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">{t('common.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className={`pr-9 ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('common.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className={`pr-9 ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    rows={4}
                    placeholder={t('profile.bioPlaceholder')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="ml-2 h-5 w-5" />
                  {t('profile.changePassword')}
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{t('profile.passwordStrength')}</span>
                          <span className={strengthInfo.color}>{strengthInfo.label}</span>
                        </div>
                        <Progress value={passwordStrength} className="h-2 mt-1" />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{t('profile.passwordMismatchConfirm')}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      changePasswordMutation.isPending ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword ||
                      passwordData.newPassword !== passwordData.confirmPassword
                    }
                  >
                    {changePasswordMutation.isPending ? t('profile.changingPassword') : t('profile.changePasswordButton')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="ml-2 h-5 w-5" />
                    {t('profile.securitySettings')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('profile.twoFactorAuth')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.twoFactorDesc')}</p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      {t('profile.notEnabled')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('profile.logoutAllDevices')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.logoutAllDesc')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('profile.logoutButton')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="ml-2 h-5 w-5" />
                  {t('profile.preferences')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('profile.emailNotifications')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.emailNotificationsDesc')}</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('profile.browserNotifications')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.browserNotificationsDesc')}</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('profile.darkMode')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.darkModeDesc')}</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t('profile.language')}</h4>
                      <p className="text-sm text-gray-600">{t('profile.languageDesc')}</p>
                    </div>
                    <Badge>العربية</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="ml-2 h-5 w-5" />
                  {t('profile.recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock recent activity */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{t('profile.activities.leadCreated')}</div>
                        <div className="text-xs text-gray-500">أحمد محمد - شقة في القاهرة الجديدة</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{t('profile.activities.hoursAgo')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{t('profile.activities.dealCompleted')}</div>
                        <div className="text-xs text-gray-500">شقة في الشيخ زايد - $250,000</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{t('profile.activities.yesterday')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-purple-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{t('profile.activities.propertyAdded')}</div>
                        <div className="text-xs text-gray-500">فيلا في التجمع الخامس</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{t('profile.activities.daysAgo')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{t('profile.activities.profileUpdated')}</div>
                        <div className="text-xs text-gray-500">تغيير معلومات الاتصال</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{t('profile.activities.weekAgo')}</div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline">
                    <Download className="ml-2 h-4 w-4" />
                    {t('profile.exportActivityLog')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 