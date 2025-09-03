import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  User,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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
import { Progress } from "@/components/ui/progress";
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { Can, CanAny } from "@/components/PermissionGuard";

interface Deal {
  id: number;
  title: string;
  client: string;
  property: string;
  amount: number;
  commission: number;
  stage: string;
  status: string;
  probability: number;
  agent: string;
  createdAt: string;
  expectedCloseDate: string;
  lastActivity: string;
  notes: string;
}

const Deals = () => {
  const { t } = useTranslation();
  const { can, canCRUD } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    status: "Negotiating",
    deal_value: 0,
    commission_amount: 0,
    commission_percentage: 5,
    expected_close_date: "",
    notes: "",
    stage: "Initial Contact",
    probability: 25,
    unit: ""
  });

  // Fetch deals from API
  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals', searchTerm, stageFilter, statusFilter, agentFilter],
    queryFn: () => api.getDeals({
      ...(searchTerm && { title_contains: searchTerm }),
      ...(stageFilter !== 'all' && { stage: stageFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      sort: 'created_at:desc'
    })
  });

  // Fetch units for filtering
  const { data: unitsData } = useQuery({
    queryKey: ['units'],
    queryFn: () => api.getProperties()
  });

  const units = Array.isArray(unitsData?.data) ? unitsData.data : [];

  const deals = Array.isArray(dealsData?.data) ? dealsData.data : [];

  const queryClient = useQueryClient();

  // Helpers to safely render values that might be nested objects from API
  const getLabel = (val: any, keys: string[] = ['name', 'full_name', 'title', 'label', 'address']): string => {
    if (val && typeof val === 'object') {
      for (const k of keys) {
        if (val[k]) return String(val[k]);
      }
      return '';
    }
    return val ?? '';
  };
  const getPropertyLabel = (p: any) => getLabel(p, ['title', 'address', 'name']);
  const getClientLabel = (c: any) => getLabel(c, ['name', 'full_name', 'title']);
  const getStageLabel = (s: any) => getLabel(s, ['name', 'title']);
  const getAgentLabel = (a: any) => getLabel(a, ['name', 'full_name', 'username', 'email']);
  const getExpectedCloseDate = (d: any) => d?.expectedCloseDate ?? d?.expected_close_date ?? d?.expected_close_at;
  const getAmountVal = (d: any) => Number(d?.amount ?? d?.deal_value ?? 0);
  const getCommissionVal = (d: any) => Number(d?.commission ?? d?.commission_amount ?? 0);

  // CRUD mutations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createDeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success(t('deals.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('deals.messages.error'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateDeal(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success(t('deals.messages.updated'));
      setEditingDeal(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('deals.messages.error'));
    }
  });

  // Delete deal mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteDeal(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success(t('deals.messages.deleted'));
    },
    onError: () => {
      toast.error(t('deals.messages.error'));
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      status: "Negotiating",
      deal_value: 0,
      commission_amount: 0,
      commission_percentage: 5,
      expected_close_date: "",
      notes: "",
      stage: "Initial Contact",
      probability: 25,
      unit: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (deal: any) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      status: deal.status || 'Negotiating',
      deal_value: deal.deal_value || 0,
      commission_amount: deal.commission_amount || 0,
      commission_percentage: deal.commission_percentage || 5,
      expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
      notes: deal.notes || '',
      stage: deal.stage || 'Initial Contact',
      probability: deal.probability || 25,
      unit: deal.unit_id || deal.unit || ""
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('deals.messages.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  // Mock data removed - using API data instead

  const getStageColor = (stage: string) => {
    switch (stage) {
      case t('deals.stages.prospect'):
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case t('deals.stages.inspection'):
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case t('deals.stages.proposal'):
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case t('deals.stages.negotiation'):
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case t('deals.stages.completed'):
        return 'bg-green-100 text-green-800 border-green-200';
      case t('deals.stages.cancelled'):
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case t('deals.statuses.active'): return <Clock className="h-4 w-4 text-blue-600" />;
      case t('deals.statuses.closed'): return <CheckCircle className="h-4 w-4 text-green-600" />;
      case t('deals.statuses.cancelled'): return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUnitInfo = (deal: any) => {
    if (!deal.unit && !deal.unit_id) return { name: '', project: '', developer: '' };

    const unit = deal.unit || units.find(u => u.id === deal.unit_id);
    if (!unit) return { name: '', project: '', developer: '' };

    return {
      name: unit.title || unit.name || '',
      project: unit.project?.name || '',
      developer: unit.project?.developer?.name || ''
    };
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = !searchTerm ||
      (deal.title && deal.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.notes && deal.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || deal.agent === agentFilter;

    return matchesSearch && matchesStage && matchesStatus && matchesAgent;
  });

  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.status === t('deals.statuses.active')).length;
  const completedDeals = deals.filter(d => d.stage === t('deals.stages.completed')).length;
  const totalRevenue = deals.filter(d => d.stage === t('deals.stages.completed')).reduce((sum, d) => sum + d.commission, 0);
  const averageDealSize = deals.reduce((sum, d) => sum + d.amount, 0) / deals.length;

  return (
    <DashboardLayout>
      <div className="space-y-6 arabic-text">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('deals.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('deals.search')}
            </p>
          </div>
          <Can permission="deals.create">
            <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
              {t('deals.add')}
            </Button>
          </Can>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('deals.stats.totalDeals')}</p>
                  <p className="text-2xl font-bold text-primary">{totalDeals}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('deals.stats.activeDeals')}</p>
                  <p className="text-2xl font-bold text-primary">{activeDeals}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('deals.stats.completedDeals')}</p>
                  <p className="text-2xl font-bold text-primary">{completedDeals}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('deals.stats.totalRevenue')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle className="arabic-text">{t('deals.filters.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder={t('deals.filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="arabic-text"
                />
              </div>

              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('deals.filters.stage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('deals.filters.allStages')}</SelectItem>
                  <SelectItem value={t('deals.stages.prospect')}>{t('deals.stages.prospect')}</SelectItem>
                  <SelectItem value={t('deals.stages.inspection')}>{t('deals.stages.inspection')}</SelectItem>
                  <SelectItem value={t('deals.stages.proposal')}>{t('deals.stages.proposal')}</SelectItem>
                  <SelectItem value={t('deals.stages.negotiation')}>{t('deals.stages.negotiation')}</SelectItem>
                  <SelectItem value={t('deals.stages.completed')}>{t('deals.stages.completed')}</SelectItem>
                  <SelectItem value={t('deals.stages.cancelled')}>{t('deals.stages.cancelled')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('deals.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('deals.filters.allStatuses')}</SelectItem>
                  <SelectItem value={t('deals.statuses.active')}>{t('deals.statuses.active')}</SelectItem>
                  <SelectItem value={t('deals.statuses.closed')}>{t('deals.statuses.closed')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('deals.filters.agent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('deals.filters.allAgents')}</SelectItem>
                  <SelectItem value="سارة علي">سارة علي</SelectItem>
                  <SelectItem value="محمد الزهراني">محمد الزهراني</SelectItem>
                  <SelectItem value="نورا الغامدي">نورا الغامدي</SelectItem>
                  <SelectItem value="خالد الحربي">خالد الحربي</SelectItem>
                  <SelectItem value="رنا القحطاني">رنا القحطاني</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('deals.table.title')} ({filteredDeals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('deals.table.deal')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.client')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.unit')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.amount')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.commission')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.stage')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.probability')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.agent')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.expectedDate')}</TableHead>
                    <TableHead className="text-right">{t('deals.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => {
                    const unitInfo = getUnitInfo(deal);
                    return (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(deal.status)}
                            <div>
                              <p className="font-medium">{deal.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {getPropertyLabel(deal.property)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {getClientLabel(deal.client)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {unitInfo.name && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{unitInfo.name}</span>
                              </div>
                            )}
                            {unitInfo.project && (
                              <div className="text-sm text-muted-foreground">
                                {unitInfo.project}
                              </div>
                            )}
                            {unitInfo.developer && (
                              <div className="text-sm text-muted-foreground">
                                {unitInfo.developer}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(getAmountVal(deal))}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatPrice(getCommissionVal(deal))}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStageColor(getStageLabel(deal.stage))}>
                            {getStageLabel(deal.stage)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={deal.probability}
                              className="w-16 h-2"
                            />
                            <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                              {deal.probability}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getAgentLabel(deal.agent)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {getExpectedCloseDate(deal) ? new Date(getExpectedCloseDate(deal)).toLocaleDateString('ar-SA') : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                                {t('deals.actions.view')}
                              </DropdownMenuItem>
                              <Can permission="deals.update">
                                <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                  <Edit className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                                  {t('deals.actions.edit')}
                                </DropdownMenuItem>
                              </Can>
                              <Can permission="deals.delete">
                                <DropdownMenuItem
                                  onClick={() => handleDelete(deal.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                                  {t('deals.actions.delete')}
                                </DropdownMenuItem>
                              </Can>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="crm-card">
            <CardHeader>
              <CardTitle>{t('deals.summary.performance')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('deals.summary.closingRate')}</span>
                <span className="font-semibold">
                  {Math.round((completedDeals / totalDeals) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('deals.summary.averageDealSize')}</span>
                <span className="font-semibold">{formatPrice(averageDealSize)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('deals.summary.averageCommission')}</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(totalRevenue / completedDeals || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardHeader>
              <CardTitle>{t('deals.summary.upcomingDeals')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deals
                  .filter(d => d.status === t('deals.statuses.active'))
                  .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())
                  .slice(0, 3)
                  .map((deal) => (
                    <div key={deal.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">{deal.client}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{formatPrice(getAmountVal(deal))}</p>
                        <p className="text-xs text-muted-foreground">
                          {getExpectedCloseDate(deal) ? new Date(getExpectedCloseDate(deal)).toLocaleDateString('ar-SA') : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Deal Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingDeal} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingDeal(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="arabic-text">
                {editingDeal ? t('deals.form.editDeal') : t('deals.form.addNewDeal')}
              </DialogTitle>
              <DialogDescription className="arabic-text">
                {editingDeal ? t('deals.form.editDealDesc') : t('deals.form.addDealDesc')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="arabic-text">{t('deals.form.dealTitle')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="arabic-text">{t('deals.form.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue placeholder={t('deals.filters.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negotiating">{t('deals.statusOptions.negotiating')}</SelectItem>
                      <SelectItem value="Proposal Sent">{t('deals.statusOptions.proposalSent')}</SelectItem>
                      <SelectItem value="Under Review">{t('deals.statusOptions.underReview')}</SelectItem>
                      <SelectItem value="Won">{t('deals.statusOptions.won')}</SelectItem>
                      <SelectItem value="Lost">{t('deals.statusOptions.lost')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal_value" className="arabic-text">{t('deals.form.dealValue')}</Label>
                  <Input
                    id="deal_value"
                    type="number"
                    value={formData.deal_value}
                    onChange={(e) => setFormData({ ...formData, deal_value: parseInt(e.target.value) })}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_percentage" className="arabic-text">{t('deals.form.commissionPercentage')}</Label>
                  <Input
                    id="commission_percentage"
                    type="number"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: parseInt(e.target.value) })}
                    className="arabic-text"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage" className="arabic-text">{t('deals.form.dealStage')}</Label>
                  <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue placeholder={t('deals.filters.placeholderStage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Initial Contact">{t('deals.stageOptions.initialContact')}</SelectItem>
                      <SelectItem value="Qualified">{t('deals.stageOptions.qualified')}</SelectItem>
                      <SelectItem value="Proposal">{t('deals.stageOptions.proposal')}</SelectItem>
                      <SelectItem value="Negotiation">{t('deals.stageOptions.negotiation')}</SelectItem>
                      <SelectItem value="Closed Won">{t('deals.stageOptions.closedWon')}</SelectItem>
                      <SelectItem value="Closed Lost">{t('deals.stageOptions.closedLost')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_close_date" className="arabic-text">{t('deals.form.expectedCloseDate')}</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                    className="arabic-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit" className="arabic-text">{t('deals.form.unit')}</Label>
                  <Select value={formData.unit || 'none'} onValueChange={(value) => setFormData({ ...formData, unit: value === 'none' ? '' : value })}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue placeholder={t('deals.form.selectUnit')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('deals.form.noUnit')}</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.title || unit.name} - {unit.project?.name || 'No Project'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability" className="arabic-text">{t('deals.form.probability')}</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                    className="arabic-text"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="arabic-text">{t('deals.form.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="arabic-text"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingDeal(null);
                  resetForm();
                }} className="arabic-text">
                  {t('deals.form.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="arabic-text">
                  {editingDeal ? t('deals.form.update') : t('deals.form.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Deals;