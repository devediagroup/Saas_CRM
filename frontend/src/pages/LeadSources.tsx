import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Facebook,
  Globe,
  MessageCircle,
  Share2,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

interface LeadSource {
  id: number;
  documentId?: string;
  name: string;
  type: 'facebook' | 'google' | 'website' | 'referral' | 'whatsapp' | 'bayut' | 'dubizzle' | 'property_finder' | 'other';
  cost_per_lead?: number;
  conversion_rate?: number;
  total_leads?: number;
  converted_leads?: number;
  status?: 'active' | 'inactive';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const LeadSources = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "facebook",
    cost_per_lead: 0,
    conversion_rate: 0,
    status: "active",
    description: ""
  });

  const queryClient = useQueryClient();

  // Fetch lead sources
  const { data: sourcesData, isLoading } = useQuery({
    queryKey: ['leadSources', searchTerm, typeFilter, statusFilter],
    queryFn: () => api.getLeadSources({
      'filters[name][$containsi]': searchTerm,
      ...(typeFilter !== 'all' && { 'filters[type][$eq]': typeFilter }),
      ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
      'sort[0]': 'total_leads:desc'
    })
  });

  const leadSources = sourcesData?.data?.data || [];

  // Create lead source mutation
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createLeadSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
      toast.success(t('leadSources.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('leadSources.messages.createError'));
    }
  });

  // Update lead source mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateLeadSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
      toast.success(t('leadSources.messages.updated'));
      setEditingSource(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('leadSources.messages.updateError'));
    }
  });

  // Delete lead source mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteLeadSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
      toast.success(t('leadSources.messages.deleted'));
    },
    onError: () => {
      toast.error(t('leadSources.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "facebook",
      cost_per_lead: 0,
      conversion_rate: 0,
      status: "active",
      description: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (source: LeadSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      type: source.type,
      cost_per_lead: source.cost_per_lead,
      conversion_rate: source.conversion_rate,
      status: source.status,
      description: source.description
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('leadSources.messages.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      facebook: Facebook,
      google: Globe,
      website: Globe,
      referral: Share2,
      whatsapp: MessageCircle,
      bayut: Globe,
      dubizzle: Globe,
      property_finder: Globe,
      other: BarChart3
    };
    const Icon = icons[type as keyof typeof icons] || BarChart3;
    return <Icon className="h-5 w-5" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      facebook: t('leadSources.types.facebook'),
      google: t('leadSources.types.google'),
      website: t('leadSources.types.website'),
      referral: t('leadSources.types.referral'),
      whatsapp: t('leadSources.types.whatsapp'),
      bayut: t('leadSources.types.bayut'),
      dubizzle: t('leadSources.types.dubizzle'),
      property_finder: t('leadSources.types.propertyFinder'),
      other: t('leadSources.types.other')
    };
    return labels[type as keyof typeof labels] || t('leadSources.types.other');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary"
    };
    const labels = {
      active: t('leadSources.status.active'),
      inactive: t('leadSources.status.inactive')
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totals = leadSources.reduce((acc: any, source: LeadSource) => {
          acc.totalLeads += source.total_leads || 0;
      acc.convertedLeads += source.converted_leads || 0;
      acc.totalCost += (source.cost_per_lead || 0) * (source.total_leads || 0);
    return acc;
  }, { totalLeads: 0, convertedLeads: 0, totalCost: 0 });

  const avgConversionRate = totals.totalLeads > 0 ? (totals.convertedLeads / totals.totalLeads) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground arabic-text">{t('leadSources.title')}</h1>
            <p className="text-muted-foreground arabic-text">
              {t('leadSources.subtitle')}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                          <Button className="gap-2 arabic-text">
              <Plus className="h-4 w-4" />
              {t('leadSources.addNew')}
            </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="arabic-text">
                  {editingSource ? t('leadSources.editSource') : t('leadSources.addSource')}
                </DialogTitle>
                <DialogDescription className="arabic-text">
                  {editingSource ? t('leadSources.editSourceDesc') : t('leadSources.addSourceDesc')}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="arabic-text">{t('leadSources.form.sourceName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('leadSources.placeholders.sourceName')}
                    required
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="arabic-text">{t('leadSources.form.sourceType')}</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">{t('leadSources.types.facebook')}</SelectItem>
                      <SelectItem value="google">{t('leadSources.types.google')}</SelectItem>
                      <SelectItem value="website">{t('leadSources.types.website')}</SelectItem>
                      <SelectItem value="referral">{t('leadSources.types.referral')}</SelectItem>
                      <SelectItem value="whatsapp">{t('leadSources.types.whatsapp')}</SelectItem>
                      <SelectItem value="bayut">{t('leadSources.types.bayut')}</SelectItem>
                      <SelectItem value="dubizzle">{t('leadSources.types.dubizzle')}</SelectItem>
                      <SelectItem value="property_finder">{t('leadSources.types.propertyFinder')}</SelectItem>
                      <SelectItem value="other">{t('leadSources.types.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost" className="arabic-text">{t('leadSources.form.costPerLead')}</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_per_lead}
                    onChange={(e) => setFormData({ ...formData, cost_per_lead: parseFloat(e.target.value) || 0 })}
                    placeholder={t('leadSources.placeholders.costPerLead')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conversion" className="arabic-text">{t('leadSources.form.conversionRate')}</Label>
                  <Input
                    id="conversion"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.conversion_rate}
                    onChange={(e) => setFormData({ ...formData, conversion_rate: parseFloat(e.target.value) || 0 })}
                    placeholder={t('leadSources.placeholders.conversionRate')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="arabic-text">{t('leadSources.form.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('leadSources.status.active')}</SelectItem>
                      <SelectItem value="inactive">{t('leadSources.status.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="arabic-text">{t('leadSources.form.description')}</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('leadSources.placeholders.description')}
                    dir="rtl"
                  />
                </div>
                
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingSource(null);
                    resetForm();
                  }}>
                    {t('leadSources.form.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? t('leadSources.form.saving') : editingSource ? t('leadSources.form.update') : t('leadSources.form.add')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leadSources.stats.totalLeads')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.totalLeads.toLocaleString('ar-SA')}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leadSources.stats.convertedLeads')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.convertedLeads.toLocaleString('ar-SA')}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leadSources.stats.conversionRate')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leadSources.stats.totalCost')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.totalCost)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('leadSources.filters.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('leadSources.filters.allTypes')}</SelectItem>
                    <SelectItem value="facebook">{t('leadSources.types.facebook')}</SelectItem>
                    <SelectItem value="google">{t('leadSources.types.google')}</SelectItem>
                    <SelectItem value="website">{t('leadSources.types.website')}</SelectItem>
                    <SelectItem value="referral">{t('leadSources.types.referral')}</SelectItem>
                    <SelectItem value="whatsapp">{t('leadSources.types.whatsapp')}</SelectItem>
                    <SelectItem value="bayut">{t('leadSources.types.bayut')}</SelectItem>
                    <SelectItem value="dubizzle">{t('leadSources.types.dubizzle')}</SelectItem>
                    <SelectItem value="property_finder">{t('leadSources.types.propertyFinder')}</SelectItem>
                    <SelectItem value="other">{t('leadSources.types.other')}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('leadSources.filters.allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('leadSources.status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('leadSources.status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leadSources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 arabic-text">{t('leadSources.messages.noSources')}</h3>
              <p className="text-muted-foreground mb-4 arabic-text">
                {t('leadSources.messages.noSourcesDesc')}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 arabic-text">
                <Plus className="h-4 w-4" />
                {t('leadSources.addNew')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadSources.map((source: LeadSource) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(source.type)}
                      <CardTitle className="text-lg arabic-text">{source.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="arabic-text">
                        {getTypeLabel(source.type)}
                      </Badge>
                      {source.status && getStatusBadge(source.status)}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        handleEdit(source);
                        setIsCreateDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 ml-2" />
                        {t('leadSources.actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(source.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        {t('leadSources.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground arabic-text">{t('leadSources.table.totalLeads')}</div>
                      <div className="font-semibold">{source.total_leads || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground arabic-text">{t('leadSources.table.convertedLeads')}</div>
                      <div className="font-semibold">{source.converted_leads || 0}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground arabic-text">{t('leadSources.table.conversionRate')}</div>
                      <div className="font-semibold">{source.conversion_rate || 0}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground arabic-text">{t('leadSources.table.costPerLead')}</div>
                      <div className="font-semibold">{formatCurrency(source.cost_per_lead || 0)}</div>
                    </div>
                  </div>
                  
                  {source.description && (
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <p className="arabic-text">{source.description}</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <span className="arabic-text">
                      {t('leadSources.table.createdDate')}: {new Date(source.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadSources; 