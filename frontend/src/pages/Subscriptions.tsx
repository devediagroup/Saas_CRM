import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Users, 
  Building, 
  CheckCircle, 
  XCircle,
  Crown,
  Zap,
  Shield,
  Star,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  max_users: number;
  max_leads: number;
  max_properties: number;
  is_active: boolean;
  is_popular?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanySubscription {
  id: number;
  company: {
    id: number;
    name: string;
  };
  subscription_plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_status: 'paid' | 'pending' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export default function Subscriptions() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<CompanySubscription | null>(null);
  const [formData, setFormData] = useState({
    company_id: '',
    subscription_plan_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    auto_renew: true,
    payment_status: 'paid'
  });

  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: subscriptionPlans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiClient.get('/subscription-plans').then(res => res.data.data || [])
  });

  // Fetch company subscriptions
  const { data: companySubscriptions = [], isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['company-subscriptions'],
    queryFn: () => apiClient.get('/company-subscriptions?populate=*').then(res => res.data.data || [])
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.get('/companies').then(res => res.data.data || [])
  });

  // Create subscription mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/company-subscriptions', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscriptions'] });
      toast.success(t('subscriptions.messages.subscriptionCreated'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('subscriptions.messages.createError'));
    }
  });

  // Update subscription mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.put(`/company-subscriptions/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscriptions'] });
      toast.success(t('subscriptions.messages.subscriptionUpdated'));
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('subscriptions.messages.updateError'));
    }
  });

  // Delete subscription mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/company-subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscriptions'] });
      toast.success(t('subscriptions.messages.subscriptionDeleted'));
    },
    onError: () => {
      toast.error(t('subscriptions.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      company_id: '',
      subscription_plan_id: '',
      status: 'active',
      start_date: '',
      end_date: '',
      auto_renew: true,
      payment_status: 'paid'
    });
    setSelectedSubscription(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubscription) {
      updateMutation.mutate({ id: selectedSubscription.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (subscription: CompanySubscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      company_id: subscription.company?.id?.toString() || '',
      subscription_plan_id: subscription.subscription_plan?.id?.toString() || '',
      status: subscription.status,
      start_date: subscription.start_date?.split('T')[0] || '',
      end_date: subscription.end_date?.split('T')[0] || '',
      auto_renew: subscription.auto_renew,
      payment_status: subscription.payment_status
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
          active: { label: t('subscriptions.statuses.active'), color: 'bg-green-100 text-green-800' },
    inactive: { label: t('subscriptions.statuses.inactive'), color: 'bg-gray-100 text-gray-800' },
    expired: { label: t('subscriptions.statuses.expired'), color: 'bg-red-100 text-red-800' },
    cancelled: { label: t('subscriptions.statuses.cancelled'), color: 'bg-yellow-100 text-yellow-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
          paid: { label: t('subscriptions.paymentStatuses.paid'), color: 'bg-green-100 text-green-800' },
    pending: { label: t('subscriptions.paymentStatuses.pending'), color: 'bg-yellow-100 text-yellow-800' },
    failed: { label: t('subscriptions.paymentStatuses.failed'), color: 'bg-red-100 text-red-800' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPlanIcon = (planName: string) => {
    if (planName?.toLowerCase().includes('premium')) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (planName?.toLowerCase().includes('pro')) return <Zap className="h-5 w-5 text-blue-500" />;
    if (planName?.toLowerCase().includes('enterprise')) return <Shield className="h-5 w-5 text-purple-500" />;
    return <Star className="h-5 w-5 text-gray-500" />;
  };

  // Calculate statistics
  const totalSubscriptions = companySubscriptions.length;
  const activeSubscriptions = companySubscriptions.filter(sub => sub.status === 'active').length;
  const expiredSubscriptions = companySubscriptions.filter(sub => sub.status === 'expired').length;
  const totalRevenue = companySubscriptions
    .filter(sub => sub.payment_status === 'paid')
    .reduce((sum, sub) => sum + (sub.subscription_plan?.price || 0), 0);

  if (isLoadingPlans || isLoadingSubscriptions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('subscriptions.messages.loadingSubscriptions')}</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">{t('subscriptions.title')}</h1>
        <p className="text-gray-600 mt-1">{t('subscriptions.subtitle')}</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CreditCard className="ml-2 h-4 w-4" />
                {t('subscriptions.newSubscription')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('subscriptions.createSubscription')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="company_id">{t('subscriptions.company')}</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('subscriptions.selectCompany')} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscription_plan_id">{t('subscriptions.subscriptionPlan')}</Label>
                  <Select value={formData.subscription_plan_id} onValueChange={(value) => setFormData({...formData, subscription_plan_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('subscriptions.selectPlan')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan: SubscriptionPlan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price}/{plan.billing_cycle === 'monthly' ? t('subscriptions.plans.month') : t('subscriptions.plans.year')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">{t('subscriptions.startDate')}</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">{t('subscriptions.endDate')}</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">{t('subscriptions.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('subscriptions.statuses.active')}</SelectItem>
                      <SelectItem value="inactive">{t('subscriptions.statuses.inactive')}</SelectItem>
                      <SelectItem value="expired">{t('subscriptions.statuses.expired')}</SelectItem>
                      <SelectItem value="cancelled">{t('subscriptions.statuses.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_status">{t('subscriptions.paymentStatus')}</Label>
                  <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">{t('subscriptions.paymentStatuses.paid')}</SelectItem>
                      <SelectItem value="pending">{t('subscriptions.paymentStatuses.pending')}</SelectItem>
                      <SelectItem value="failed">{t('subscriptions.paymentStatuses.failed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_renew"
                    checked={formData.auto_renew}
                    onChange={(e) => setFormData({...formData, auto_renew: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="auto_renew">{t('subscriptions.autoRenew')}</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('subscriptions.saving') : t('subscriptions.save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('subscriptions.stats.totalSubscriptions')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSubscriptions}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('subscriptions.stats.activeSubscriptions')}</p>
                  <p className="text-3xl font-bold text-green-600">{activeSubscriptions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('subscriptions.stats.expiredSubscriptions')}</p>
                  <p className="text-3xl font-bold text-red-600">{expiredSubscriptions}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('subscriptions.stats.totalRevenue')}</p>
                  <p className="text-3xl font-bold text-green-600">${totalRevenue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="ml-2 h-5 w-5" />
              {t('subscriptions.plans.availablePlans')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan: SubscriptionPlan) => (
                <Card key={plan.id} className={`relative ${plan.is_popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">{t('subscriptions.plans.mostPopular')}</Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        {getPlanIcon(plan.name)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ${plan.price}
                        <span className="text-sm text-gray-500">/{plan.billing_cycle === 'monthly' ? t('subscriptions.plans.month') : t('subscriptions.plans.year')}</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>{t('subscriptions.plans.users')}:</span>
                          <span>{plan.max_users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('common.leads')}:</span>
                          <span>{plan.max_leads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('common.properties')}:</span>
                          <span>{plan.max_properties}</span>
                        </div>
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">{t('common.features')}:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="ml-2 h-5 w-5" />
              {t('subscriptions.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('subscriptions.company')}</TableHead>
                  <TableHead>{t('subscriptions.subscriptionPlan')}</TableHead>
                  <TableHead>{t('subscriptions.status')}</TableHead>
                  <TableHead>{t('subscriptions.paymentStatus')}</TableHead>
                  <TableHead>{t('subscriptions.startDate')}</TableHead>
                  <TableHead>{t('subscriptions.endDate')}</TableHead>
                  <TableHead>{t('subscriptions.autoRenew')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companySubscriptions.map((subscription: CompanySubscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        {subscription.company?.name || t('common.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getPlanIcon(subscription.subscription_plan?.name)}
                        <div className="mr-2">
                          <div className="font-medium">{subscription.subscription_plan?.name}</div>
                          <div className="text-sm text-gray-500">
                            ${subscription.subscription_plan?.price}/{subscription.subscription_plan?.billing_cycle === 'monthly' ? t('subscriptions.plans.month') : t('subscriptions.plans.year')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(subscription.payment_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('ar-SA') : t('common.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ar-SA') : t('common.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.auto_renew ? (
                        <Badge className="bg-green-100 text-green-800">{t('common.yes')}</Badge>
                      ) : (
                                                  <Badge className="bg-gray-100 text-gray-800">{t('common.no')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subscription)}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm(t('subscriptions.messages.confirmDelete'))) {
                              deleteMutation.mutate(subscription.id);
                            }
                          }}
                        >
                                                      {t('common.delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
                              <DialogTitle>{t('subscriptions.editSubscription')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                                  <Label htmlFor="company_id">{t('subscriptions.company')}</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('subscriptions.selectCompany')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                                  <Label htmlFor="subscription_plan_id">{t('subscriptions.subscriptionPlan')}</Label>
                  <Select value={formData.subscription_plan_id} onValueChange={(value) => setFormData({...formData, subscription_plan_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('subscriptions.selectPlan')} />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans.map((plan: SubscriptionPlan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                                                  {plan.name} - ${plan.price}/{plan.billing_cycle === 'monthly' ? t('subscriptions.plans.month') : t('subscriptions.plans.year')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">{t('subscriptions.startDate')}</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">{t('subscriptions.endDate')}</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                                  <Label htmlFor="status">{t('subscriptions.status')}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                          <SelectItem value="active">{t('subscriptions.statuses.active')}</SelectItem>
                      <SelectItem value="inactive">{t('subscriptions.statuses.inactive')}</SelectItem>
                      <SelectItem value="expired">{t('subscriptions.statuses.expired')}</SelectItem>
                      <SelectItem value="cancelled">{t('subscriptions.statuses.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                                  <Label htmlFor="payment_status">{t('subscriptions.paymentStatus')}</Label>
                <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                          <SelectItem value="paid">{t('subscriptions.paymentStatuses.paid')}</SelectItem>
                      <SelectItem value="pending">{t('subscriptions.paymentStatuses.pending')}</SelectItem>
                      <SelectItem value="failed">{t('subscriptions.paymentStatuses.failed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_renew"
                  checked={formData.auto_renew}
                  onChange={(e) => setFormData({...formData, auto_renew: e.target.checked})}
                  className="rounded border-gray-300"
                />
                                  <Label htmlFor="auto_renew">{t('subscriptions.autoRenew')}</Label>
              </div>
              <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                                      {updateMutation.isPending ? t('subscriptions.saving') : t('subscriptions.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 