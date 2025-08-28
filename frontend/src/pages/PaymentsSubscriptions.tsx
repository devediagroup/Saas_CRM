import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Receipt,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

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
}

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
}

const PaymentsSubscriptions = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateSubscriptionDialogOpen, setIsCreateSubscriptionDialogOpen] = useState(false);
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<CompanySubscription | null>(null);
  const [editingPayment, setEditingPayment] = useState<BillingHistory | null>(null);

  const [subscriptionFormData, setSubscriptionFormData] = useState({
    company_id: "",
    subscription_plan_id: "",
    status: "active",
    start_date: "",
    end_date: "",
    auto_renew: true,
    payment_status: "paid"
  });

  const [paymentFormData, setPaymentFormData] = useState({
    company_id: "",
    subscription_plan_id: "",
    invoice_number: "",
    amount: "",
    currency: "USD",
    status: "pending",
    payment_method: "",
    billing_date: "",
    due_date: "",
    paid_date: "",
    description: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  // Fetch subscription plans
  const { data: subscriptionPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiClient.get('/subscription-plans').then(res => res.data.data || [])
  });

  // Fetch company subscriptions
  const { data: companySubscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['company-subscriptions', searchTerm, statusFilter],
    queryFn: () => apiClient.get('/company-subscriptions', {
      params: {
        ...(searchTerm && { 'filters[company][name][$containsi]': searchTerm }),
        ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'company',
        'populate[1]': 'subscription_plan'
      }
    }).then(res => res.data.data || [])
  });

  // Fetch billing history
  const { data: billingHistory = [], isLoading: billingLoading } = useQuery({
    queryKey: ['billing-history', searchTerm, statusFilter],
    queryFn: () => apiClient.get('/billing-histories', {
      params: {
        ...(searchTerm && { 'filters[company][name][$containsi]': searchTerm }),
        ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'company',
        'populate[1]': 'subscription_plan'
      }
    }).then(res => res.data.data || [])
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.get('/companies').then(res => res.data.data || [])
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/company-subscriptions', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscriptions'] });
      toast.success(t('paymentsSubscriptions.messages.subscriptionCreated'));
      setIsCreateSubscriptionDialogOpen(false);
      resetSubscriptionForm();
    },
    onError: () => {
      toast.error(t('paymentsSubscriptions.messages.subscriptionCreateError'));
    }
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/company-subscriptions/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscriptions'] });
      toast.success(t('paymentsSubscriptions.messages.subscriptionUpdated'));
      setEditingSubscription(null);
      resetSubscriptionForm();
    },
    onError: () => {
      toast.error(t('paymentsSubscriptions.messages.subscriptionUpdateError'));
    }
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/company-subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-subscriptions'] });
      toast.success(t('paymentsSubscriptions.messages.subscriptionDeleted'));
    },
    onError: () => {
      toast.error(t('paymentsSubscriptions.messages.subscriptionDeleteError'));
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/billing-histories', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      toast.success(t('paymentsSubscriptions.messages.paymentCreated'));
      setIsCreatePaymentDialogOpen(false);
      resetPaymentForm();
    },
    onError: () => {
      toast.error(t('paymentsSubscriptions.messages.paymentCreateError'));
    }
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/billing-histories/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      toast.success(t('paymentsSubscriptions.messages.paymentUpdated'));
      setEditingPayment(null);
      resetPaymentForm();
    },
    onError: () => {
      toast.error(t('paymentsSubscriptions.messages.paymentUpdateError'));
    }
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/billing-histories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      toast.success(t('paymentsSubscriptions.messages.paymentDeleted'));
    },
    onError: () => {
      toast.error(t('paymentsSubscriptions.messages.paymentDeleteError'));
    }
  });

  const resetSubscriptionForm = () => {
    setSubscriptionFormData({
      company_id: "",
      subscription_plan_id: "",
      status: "active",
      start_date: "",
      end_date: "",
      auto_renew: true,
      payment_status: "paid"
    });
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      company_id: "",
      subscription_plan_id: "",
      invoice_number: "",
      amount: "",
      currency: "USD",
      status: "pending",
      payment_method: "",
      billing_date: "",
      due_date: "",
      paid_date: "",
      description: "",
      notes: ""
    });
  };

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subscriptionData = {
      company: subscriptionFormData.company_id,
      subscription_plan: subscriptionFormData.subscription_plan_id,
      status: subscriptionFormData.status,
      start_date: subscriptionFormData.start_date,
      end_date: subscriptionFormData.end_date,
      auto_renew: subscriptionFormData.auto_renew,
      payment_status: subscriptionFormData.payment_status
    };

    if (editingSubscription) {
      updateSubscriptionMutation.mutate({ id: editingSubscription.id, data: subscriptionData });
    } else {
      createSubscriptionMutation.mutate(subscriptionData);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      company: paymentFormData.company_id,
      subscription_plan: paymentFormData.subscription_plan_id,
      invoice_number: paymentFormData.invoice_number,
      amount: parseFloat(paymentFormData.amount),
      currency: paymentFormData.currency,
      status: paymentFormData.status,
      payment_method: paymentFormData.payment_method,
      billing_date: paymentFormData.billing_date,
      due_date: paymentFormData.due_date,
      ...(paymentFormData.paid_date && { paid_date: paymentFormData.paid_date }),
      ...(paymentFormData.description && { description: paymentFormData.description }),
      ...(paymentFormData.notes && { notes: paymentFormData.notes })
    };

    if (editingPayment) {
      updatePaymentMutation.mutate({ id: editingPayment.id, data: paymentData });
    } else {
      createPaymentMutation.mutate(paymentData);
    }
  };

  const handleEditSubscription = (subscription: CompanySubscription) => {
    setEditingSubscription(subscription);
    setSubscriptionFormData({
      company_id: subscription.company?.id.toString() || "",
      subscription_plan_id: subscription.subscription_plan?.id.toString() || "",
      status: subscription.status,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      auto_renew: subscription.auto_renew,
      payment_status: subscription.payment_status
    });
    setIsCreateSubscriptionDialogOpen(true);
  };

  const handleEditPayment = (payment: BillingHistory) => {
    setEditingPayment(payment);
    setPaymentFormData({
      company_id: payment.company?.id.toString() || "",
      subscription_plan_id: payment.subscription_plan?.id.toString() || "",
      invoice_number: payment.invoice_number,
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      billing_date: payment.billing_date,
      due_date: payment.due_date,
      paid_date: payment.paid_date || "",
      description: payment.description || "",
      notes: payment.notes || ""
    });
    setIsCreatePaymentDialogOpen(true);
  };

  const handleDeleteSubscription = (subscription: CompanySubscription) => {
    if (confirm(t('paymentsSubscriptions.messages.confirmDeleteSubscription'))) {
      deleteSubscriptionMutation.mutate(subscription.id);
    }
  };

  const handleDeletePayment = (payment: BillingHistory) => {
    if (confirm(t('paymentsSubscriptions.messages.confirmDeletePayment'))) {
      deletePaymentMutation.mutate(payment.id);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('paymentsSubscriptions.subscriptions.status.active');
      case 'inactive': return t('paymentsSubscriptions.subscriptions.status.inactive');
      case 'expired': return t('paymentsSubscriptions.subscriptions.status.expired');
      case 'cancelled': return t('paymentsSubscriptions.subscriptions.status.cancelled');
      case 'paid': return t('paymentsSubscriptions.payments.status.paid');
      case 'pending': return t('paymentsSubscriptions.payments.status.pending');
      case 'failed': return t('paymentsSubscriptions.payments.status.failed');
      case 'refunded': return t('paymentsSubscriptions.payments.status.refunded');
      default: return status;
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return t('paymentsSubscriptions.billingCycle.monthly');
      case 'yearly': return t('paymentsSubscriptions.billingCycle.yearly');
      default: return cycle;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('paymentsSubscriptions.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('paymentsSubscriptions.subtitle')}
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('paymentsSubscriptions.stats.totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {formatCurrency(billingHistory.filter((b: BillingHistory) => b.status === 'paid').reduce((sum: number, b: BillingHistory) => sum + b.amount, 0))}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('paymentsSubscriptions.stats.thisMonth')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('paymentsSubscriptions.stats.activeSubscriptions')}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {companySubscriptions.filter((s: CompanySubscription) => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('paymentsSubscriptions.stats.outOf')} {companySubscriptions.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('paymentsSubscriptions.stats.pendingInvoices')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {billingHistory.filter((b: BillingHistory) => b.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('paymentsSubscriptions.stats.needsFollowUp')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('paymentsSubscriptions.stats.collectionRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {billingHistory.length > 0
                  ? formatPercentage((billingHistory.filter((b: BillingHistory) => b.status === 'paid').length / billingHistory.length) * 100)
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('paymentsSubscriptions.stats.paymentPercentage')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('paymentsSubscriptions.tabs.subscriptions')}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {t('paymentsSubscriptions.tabs.payments')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-6">
            {/* Subscriptions Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('paymentsSubscriptions.search.subscriptions')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 w-64 arabic-text"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('paymentsSubscriptions.filters.allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('paymentsSubscriptions.subscriptions.status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('paymentsSubscriptions.subscriptions.status.inactive')}</SelectItem>
                    <SelectItem value="expired">{t('paymentsSubscriptions.subscriptions.status.expired')}</SelectItem>
                    <SelectItem value="cancelled">{t('paymentsSubscriptions.subscriptions.status.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isCreateSubscriptionDialogOpen} onOpenChange={setIsCreateSubscriptionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('paymentsSubscriptions.subscriptions.addNew')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="arabic-text">
                      {editingSubscription ? t('paymentsSubscriptions.subscriptions.editSubscription') : t('paymentsSubscriptions.subscriptions.newSubscription')}
                    </DialogTitle>
                    <DialogDescription className="arabic-text">
                      {editingSubscription ? t('paymentsSubscriptions.subscriptions.editSubscriptionDesc') : t('paymentsSubscriptions.subscriptions.addSubscriptionDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="subscription-company" className="arabic-text">{t('paymentsSubscriptions.subscriptions.form.company')}</Label>
                      <Select
                        value={subscriptionFormData.company_id}
                        onValueChange={(value) => setSubscriptionFormData({ ...subscriptionFormData, company_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('paymentsSubscriptions.subscriptions.form.chooseCompany')} />
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
                      <Label htmlFor="subscription-plan" className="arabic-text">{t('paymentsSubscriptions.subscriptions.form.subscriptionPlan')}</Label>
                      <Select
                        value={subscriptionFormData.subscription_plan_id}
                        onValueChange={(value) => setSubscriptionFormData({ ...subscriptionFormData, subscription_plan_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('paymentsSubscriptions.subscriptions.form.choosePlan')} />
                        </SelectTrigger>
                        <SelectContent>
                          {subscriptionPlans.map((plan: SubscriptionPlan) => (
                            <SelectItem key={plan.id} value={plan.id.toString()}>
                              {plan.name} - {formatCurrency(plan.price)}/{getBillingCycleLabel(plan.billing_cycle)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subscription-status" className="arabic-text">{t('paymentsSubscriptions.subscriptions.form.status')}</Label>
                      <Select
                        value={subscriptionFormData.status}
                        onValueChange={(value) => setSubscriptionFormData({ ...subscriptionFormData, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t('paymentsSubscriptions.subscriptions.status.active')}</SelectItem>
                          <SelectItem value="inactive">{t('paymentsSubscriptions.subscriptions.status.inactive')}</SelectItem>
                          <SelectItem value="expired">{t('paymentsSubscriptions.subscriptions.status.expired')}</SelectItem>
                          <SelectItem value="cancelled">{t('paymentsSubscriptions.subscriptions.status.cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subscription-start" className="arabic-text">{t('paymentsSubscriptions.subscriptions.form.startDate')}</Label>
                        <Input
                          id="subscription-start"
                          type="date"
                          value={subscriptionFormData.start_date}
                          onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, start_date: e.target.value })}
                          className="arabic-text"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subscription-end" className="arabic-text">{t('paymentsSubscriptions.subscriptions.form.endDate')}</Label>
                        <Input
                          id="subscription-end"
                          type="date"
                          value={subscriptionFormData.end_date}
                          onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, end_date: e.target.value })}
                          className="arabic-text"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                                              <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateSubscriptionDialogOpen(false);
                            setEditingSubscription(null);
                            resetSubscriptionForm();
                          }}
                          className="flex-1"
                        >
                          {t('paymentsSubscriptions.subscriptions.form.cancel')}
                        </Button>
                      <Button
                        type="submit"
                        disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
                        className="flex-1"
                      >
                        {createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending ? t('paymentsSubscriptions.subscriptions.form.saving') : t('paymentsSubscriptions.subscriptions.form.save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Subscriptions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.company')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.plan')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.status')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.startDate')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.endDate')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.subscriptions.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {t('paymentsSubscriptions.subscriptions.table.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : companySubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t('paymentsSubscriptions.subscriptions.table.noSubscriptions')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      companySubscriptions.map((subscription: CompanySubscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="arabic-text font-medium">
                            {subscription.company?.name}
                          </TableCell>
                          <TableCell className="arabic-text">
                            <div>
                              <div className="font-medium">{subscription.subscription_plan?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(subscription.subscription_plan?.price || 0)}/{getBillingCycleLabel(subscription.subscription_plan?.billing_cycle || '')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSubscriptionStatusColor(subscription.status)}>
                              {getStatusLabel(subscription.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="arabic-text">
                            {new Date(subscription.start_date).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell className="arabic-text">
                            {new Date(subscription.end_date).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditSubscription(subscription)}
                                  className="arabic-text"
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  {t('paymentsSubscriptions.subscriptions.actions.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSubscription(subscription)}
                                  className="arabic-text text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  {t('paymentsSubscriptions.subscriptions.actions.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {/* Payments Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('paymentsSubscriptions.search.invoices')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 w-64 arabic-text"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('paymentsSubscriptions.filters.allStatuses')}</SelectItem>
                    <SelectItem value="paid">{t('paymentsSubscriptions.payments.status.paid')}</SelectItem>
                    <SelectItem value="pending">{t('paymentsSubscriptions.payments.status.pending')}</SelectItem>
                    <SelectItem value="failed">{t('paymentsSubscriptions.payments.status.failed')}</SelectItem>
                    <SelectItem value="refunded">{t('paymentsSubscriptions.payments.status.refunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isCreatePaymentDialogOpen} onOpenChange={setIsCreatePaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('paymentsSubscriptions.payments.addNew')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="arabic-text">
                      {editingPayment ? t('paymentsSubscriptions.payments.editPayment') : t('paymentsSubscriptions.payments.newPayment')}
                    </DialogTitle>
                    <DialogDescription className="arabic-text">
                      {editingPayment ? t('paymentsSubscriptions.payments.editPaymentDesc') : t('paymentsSubscriptions.payments.addPaymentDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payment-company" className="arabic-text">{t('paymentsSubscriptions.payments.form.company')}</Label>
                        <Select
                          value={paymentFormData.company_id}
                          onValueChange={(value) => setPaymentFormData({ ...paymentFormData, company_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('paymentsSubscriptions.payments.form.chooseCompany')} />
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
                        <Label htmlFor="payment-plan" className="arabic-text">{t('paymentsSubscriptions.payments.form.subscriptionPlan')}</Label>
                        <Select
                          value={paymentFormData.subscription_plan_id}
                          onValueChange={(value) => setPaymentFormData({ ...paymentFormData, subscription_plan_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('paymentsSubscriptions.payments.form.choosePlan')} />
                          </SelectTrigger>
                          <SelectContent>
                            {subscriptionPlans.map((plan: SubscriptionPlan) => (
                              <SelectItem key={plan.id} value={plan.id.toString()}>
                                {plan.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payment-amount" className="arabic-text">{t('paymentsSubscriptions.payments.form.amount')}</Label>
                        <Input
                          id="payment-amount"
                          type="number"
                          value={paymentFormData.amount}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                          placeholder={t('paymentsSubscriptions.payments.form.placeholder.amount')}
                          className="arabic-text"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-currency" className="arabic-text">{t('paymentsSubscriptions.payments.form.currency')}</Label>
                        <Input
                          id="payment-currency"
                          value={paymentFormData.currency}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, currency: e.target.value })}
                          placeholder="USD"
                          className="arabic-text"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payment-method" className="arabic-text">{t('paymentsSubscriptions.payments.form.paymentMethod')}</Label>
                        <Input
                          id="payment-method"
                          value={paymentFormData.payment_method}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                          placeholder={t('paymentsSubscriptions.payments.form.placeholder.paymentMethod')}
                          className="arabic-text"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-status" className="arabic-text">{t('paymentsSubscriptions.payments.form.status')}</Label>
                        <Select
                          value={paymentFormData.status}
                          onValueChange={(value) => setPaymentFormData({ ...paymentFormData, status: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('paymentsSubscriptions.payments.status.pending')}</SelectItem>
                            <SelectItem value="paid">{t('paymentsSubscriptions.payments.status.paid')}</SelectItem>
                            <SelectItem value="failed">{t('paymentsSubscriptions.payments.status.failed')}</SelectItem>
                            <SelectItem value="refunded">{t('paymentsSubscriptions.payments.status.refunded')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payment-billing-date" className="arabic-text">{t('paymentsSubscriptions.payments.form.billingDate')}</Label>
                        <Input
                          id="payment-billing-date"
                          type="date"
                          value={paymentFormData.billing_date}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, billing_date: e.target.value })}
                          className="arabic-text"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-due-date" className="arabic-text">{t('paymentsSubscriptions.payments.form.dueDate')}</Label>
                        <Input
                          id="payment-due-date"
                          type="date"
                          value={paymentFormData.due_date}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, due_date: e.target.value })}
                          className="arabic-text"
                        />
                      </div>
                    </div>

                    {paymentFormData.status === 'paid' && (
                      <div>
                        <Label htmlFor="payment-paid-date" className="arabic-text">{t('paymentsSubscriptions.payments.form.paidDate')}</Label>
                        <Input
                          id="payment-paid-date"
                          type="date"
                          value={paymentFormData.paid_date}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, paid_date: e.target.value })}
                          className="arabic-text"
                        />
                      </div>
                    )}

                    <div>
                                              <Label htmlFor="payment-invoice-number" className="arabic-text">{t('paymentsSubscriptions.payments.form.invoiceNumber')}</Label>
                      <Input
                        id="payment-invoice-number"
                        value={paymentFormData.invoice_number}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, invoice_number: e.target.value })}
                                                  placeholder={t('paymentsSubscriptions.payments.form.placeholder.invoiceNumber')}
                        className="arabic-text"
                      />
                    </div>

                    <div>
                                              <Label htmlFor="payment-description" className="arabic-text">{t('paymentsSubscriptions.payments.form.description')}</Label>
                      <Textarea
                        id="payment-description"
                        value={paymentFormData.description}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, description: e.target.value })}
                                                  placeholder={t('paymentsSubscriptions.payments.form.placeholder.description')}
                        className="arabic-text"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreatePaymentDialogOpen(false);
                          setEditingPayment(null);
                          resetPaymentForm();
                        }}
                        className="flex-1"
                      >
                        {t('paymentsSubscriptions.payments.form.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                        className="flex-1"
                      >
                        {createPaymentMutation.isPending || updatePaymentMutation.isPending ? t('paymentsSubscriptions.payments.form.saving') : t('paymentsSubscriptions.payments.form.save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">{t('paymentsSubscriptions.payments.table.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.company')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.invoiceNumber')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.amount')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.status')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.billingDate')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.dueDate')}</TableHead>
                      <TableHead className="arabic-text">{t('paymentsSubscriptions.payments.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {t('paymentsSubscriptions.payments.table.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : billingHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t('paymentsSubscriptions.payments.table.noInvoices')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      billingHistory.map((payment: BillingHistory) => (
                        <TableRow key={payment.id}>
                          <TableCell className="arabic-text font-medium">
                            {payment.company?.name}
                          </TableCell>
                          <TableCell className="arabic-text font-medium">
                            {payment.invoice_number}
                          </TableCell>
                          <TableCell className="arabic-text">
                            <div>
                              <div className="font-medium">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payment.payment_method}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentStatusColor(payment.status)}>
                              {getStatusLabel(payment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="arabic-text">
                            {new Date(payment.billing_date).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell className="arabic-text">
                            {payment.due_date ? new Date(payment.due_date).toLocaleDateString('ar-SA') : '-'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditPayment(payment)}
                                  className="arabic-text"
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  {t('paymentsSubscriptions.payments.actions.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeletePayment(payment)}
                                  className="arabic-text text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  {t('paymentsSubscriptions.payments.actions.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PaymentsSubscriptions;
