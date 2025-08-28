import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  XCircle,
  Clock,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  Receipt,
  AlertTriangle,
  Banknote
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface BillingHistory {
  id: number;
  company: {
    id: number;
    name: string;
  };
  subscription_plan: {
    id: number;
    name: string;
    price: number;
  };
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  billing_date: string;
  due_date: string;
  paid_date?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Billing() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<BillingHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    company_id: '',
    subscription_plan_id: '',
    invoice_number: '',
    amount: '',
    currency: 'USD',
    status: 'pending',
    payment_method: '',
    billing_date: '',
    due_date: '',
    paid_date: '',
    description: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch billing history
  const { data: billingHistory = [], isLoading: isLoadingBilling } = useQuery({
    queryKey: ['billing-history'],
    queryFn: () => apiClient.get('/billing-histories?populate=*').then(res => res.data.data || [])
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.get('/companies').then(res => res.data.data || [])
  });

  // Fetch subscription plans for dropdown
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiClient.get('/subscription-plans').then(res => res.data.data || [])
  });

  // Create billing mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/billing-histories', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      toast.success(t('billing.messages.createSuccess'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('billing.messages.createError'));
    }
  });

  // Update billing mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.put(`/billing-histories/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      toast.success(t('billing.messages.updateSuccess'));
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('billing.messages.updateError'));
    }
  });

  // Delete billing mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/billing-histories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      toast.success(t('billing.messages.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('billing.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      company_id: '',
      subscription_plan_id: '',
      invoice_number: '',
      amount: '',
      currency: 'USD',
      status: 'pending',
      payment_method: '',
      billing_date: '',
      due_date: '',
      paid_date: '',
      description: '',
      notes: ''
    });
    setSelectedBilling(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      company_id: parseInt(formData.company_id) || null,
      subscription_plan_id: parseInt(formData.subscription_plan_id) || null
    };
    
    if (selectedBilling) {
      updateMutation.mutate({ id: selectedBilling.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (billing: BillingHistory) => {
    setSelectedBilling(billing);
    setFormData({
      company_id: billing.company?.id?.toString() || '',
      subscription_plan_id: billing.subscription_plan?.id?.toString() || '',
      invoice_number: billing.invoice_number || '',
      amount: billing.amount?.toString() || '',
      currency: billing.currency || 'USD',
      status: billing.status,
      payment_method: billing.payment_method || '',
      billing_date: billing.billing_date?.split('T')[0] || '',
      due_date: billing.due_date?.split('T')[0] || '',
      paid_date: billing.paid_date?.split('T')[0] || '',
      description: billing.description || '',
      notes: billing.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: t('billing.paid'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: t('billing.pending'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { label: t('billing.failed'), color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { label: t('billing.refunded'), color: 'bg-blue-100 text-blue-800', icon: TrendingDown }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Filter billing history
  const filteredBilling = billingHistory.filter((billing: BillingHistory) => {
    const matchesSearch = 
      billing.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billing.subscription_plan?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || billing.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalRevenue = billingHistory
    .filter((billing: BillingHistory) => billing.status === 'paid')
    .reduce((sum, billing) => sum + (billing.amount || 0), 0);
  
  const pendingRevenue = billingHistory
    .filter((billing: BillingHistory) => billing.status === 'pending')
    .reduce((sum, billing) => sum + (billing.amount || 0), 0);
  
  const totalInvoices = billingHistory.length;
  const paidInvoices = billingHistory.filter((billing: BillingHistory) => billing.status === 'paid').length;
  const pendingInvoices = billingHistory.filter((billing: BillingHistory) => billing.status === 'pending').length;
  const failedInvoices = billingHistory.filter((billing: BillingHistory) => billing.status === 'failed').length;

  if (isLoadingBilling) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('billing.loading')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('billing.title')}</h1>
            <p className="text-gray-600 mt-1">{t('billing.subtitle')}</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="ml-2 h-4 w-4" />
                {t('billing.newInvoice')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('billing.createInvoice')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_id">{t('billing.company')}</Label>
                    <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('billing.chooseCompany')} />
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
                    <Label htmlFor="subscription_plan_id">{t('billing.subscriptionPlan')}</Label>
                    <Select value={formData.subscription_plan_id} onValueChange={(value) => setFormData({...formData, subscription_plan_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('billing.choosePlan')} />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map((plan: any) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} - ${plan.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice_number">{t('billing.invoiceNumber')}</Label>
                    <Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                      placeholder="INV-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">{t('billing.amount')}</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="100.00"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">{t('billing.currency')}</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">{t('billing.currencies.usd')}</SelectItem>
                        <SelectItem value="EUR">{t('billing.currencies.eur')}</SelectItem>
                        <SelectItem value="SAR">{t('billing.currencies.sar')}</SelectItem>
                        <SelectItem value="AED">{t('billing.currencies.aed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payment_method">{t('billing.paymentMethod')}</Label>
                    <Input
                      id="payment_method"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      placeholder={t('billing.placeholders.paymentMethod')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billing_date">{t('billing.billingDate')}</Label>
                    <Input
                      id="billing_date"
                      type="date"
                      value={formData.billing_date}
                      onChange={(e) => setFormData({...formData, billing_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">{t('billing.dueDate')}</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="paid_date">{t('billing.paidDate')}</Label>
                    <Input
                      id="paid_date"
                      type="date"
                      value={formData.paid_date}
                      onChange={(e) => setFormData({...formData, paid_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">{t('billing.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('billing.pending')}</SelectItem>
                      <SelectItem value="paid">{t('billing.paid')}</SelectItem>
                      <SelectItem value="failed">{t('billing.failed')}</SelectItem>
                      <SelectItem value="refunded">{t('billing.refunded')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">{t('billing.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t('billing.placeholders.description')}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">{t('billing.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder={t('billing.placeholders.notes')}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('billing.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('billing.saving') : t('billing.save')}
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
                  <p className="text-sm font-medium text-gray-600">{t('billing.totalRevenue')}</p>
                  <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('billing.pendingRevenue')}</p>
                  <p className="text-3xl font-bold text-yellow-600">${pendingRevenue.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('billing.totalInvoices')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('billing.paymentRate')}</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('billing.paid')}</p>
                  <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('billing.pending')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingInvoices}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('billing.failed')}</p>
                  <p className="text-2xl font-bold text-red-600">{failedInvoices}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('billing.refunded')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {billingHistory.filter((b: BillingHistory) => b.status === 'refunded').length}
                  </p>
                </div>
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('billing.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="ml-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('billing.allStatuses')}</SelectItem>
                    <SelectItem value="paid">{t('billing.paid')}</SelectItem>
                    <SelectItem value="pending">{t('billing.pending')}</SelectItem>
                    <SelectItem value="failed">{t('billing.failed')}</SelectItem>
                    <SelectItem value="refunded">{t('billing.refunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="ml-2 h-5 w-5" />
              {t('billing.invoiceHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.invoiceNumber')}</TableHead>
                  <TableHead>{t('billing.company')}</TableHead>
                  <TableHead>{t('billing.subscriptionPlan')}</TableHead>
                  <TableHead>{t('billing.amount')}</TableHead>
                  <TableHead>{t('billing.status')}</TableHead>
                  <TableHead>{t('billing.billingDate')}</TableHead>
                  <TableHead>{t('billing.dueDate')}</TableHead>
                  <TableHead>{t('billing.paymentMethod')}</TableHead>
                  <TableHead>{t('billing.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBilling.map((billing: BillingHistory) => (
                  <TableRow key={billing.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">{billing.invoice_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Banknote className="h-4 w-4 text-gray-400 mr-2" />
                        {billing.company?.name || t('billing.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {billing.subscription_plan?.name || t('billing.notSpecified')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {billing.amount} {billing.currency}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(billing.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {billing.billing_date ? new Date(billing.billing_date).toLocaleDateString('ar-SA') : t('billing.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {billing.due_date ? new Date(billing.due_date).toLocaleDateString('ar-SA') : t('billing.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                        {billing.payment_method || t('billing.notSpecified')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(billing)}
                        >
                          {t('billing.edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm(t('billing.confirmDelete'))) {
                              deleteMutation.mutate(billing.id);
                            }
                          }}
                        >
                          {t('billing.delete')}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
                              <DialogTitle>{t('billing.editInvoice')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                                      <Label htmlFor="company_id">{t('billing.company')}</Label>
                  <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('billing.chooseCompany')} />
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
                                      <Label htmlFor="subscription_plan_id">{t('billing.subscriptionPlan')}</Label>
                  <Select value={formData.subscription_plan_id} onValueChange={(value) => setFormData({...formData, subscription_plan_id: value})}>
                    <SelectTrigger>
                                                <SelectValue placeholder={t('billing.choosePlan')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                                      <Label htmlFor="invoice_number">{t('billing.invoiceNumber')}</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                    placeholder="INV-001"
                    required
                  />
                </div>
                <div>
                                      <Label htmlFor="amount">{t('billing.amount')}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="100.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                                      <Label htmlFor="currency">{t('billing.currency')}</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                                              <SelectItem value="USD">{t('billing.currencies.usd')}</SelectItem>
                        <SelectItem value="EUR">{t('billing.currencies.eur')}</SelectItem>
                        <SelectItem value="SAR">{t('billing.currencies.sar')}</SelectItem>
                        <SelectItem value="AED">{t('billing.currencies.aed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                                      <Label htmlFor="payment_method">{t('billing.paymentMethod')}</Label>
                  <Input
                    id="payment_method"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                          placeholder={t('billing.placeholders.paymentMethod')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                                      <Label htmlFor="billing_date">{t('billing.billingDate')}</Label>
                  <Input
                    id="billing_date"
                    type="date"
                    value={formData.billing_date}
                    onChange={(e) => setFormData({...formData, billing_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                                      <Label htmlFor="due_date">{t('billing.dueDate')}</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                                      <Label htmlFor="paid_date">{t('billing.paidDate')}</Label>
                  <Input
                    id="paid_date"
                    type="date"
                    value={formData.paid_date}
                    onChange={(e) => setFormData({...formData, paid_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                                    <Label htmlFor="status">{t('billing.status')}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                          <SelectItem value="pending">{t('billing.pending')}</SelectItem>
                      <SelectItem value="paid">{t('billing.paid')}</SelectItem>
                      <SelectItem value="failed">{t('billing.failed')}</SelectItem>
                      <SelectItem value="refunded">{t('billing.refunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                                    <Label htmlFor="description">{t('billing.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder={t('billing.placeholders.description')}
                  rows={3}
                />
              </div>
              <div>
                                    <Label htmlFor="notes">{t('billing.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder={t('billing.placeholders.notes')}
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    {t('billing.cancel')}
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? t('billing.saving') : t('billing.save')}
                  </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 