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
  Mail,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Play,
  Pause,
  Send,
  Calendar,
  DollarSign
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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'whatsapp' | 'social_media' | 'landing_page';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  target_audience: string;
  start_date: string;
  end_date: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
  };
  content: {
    subject?: string;
    message: string;
    landing_page_url?: string;
    media_urls?: string[];
  };
  company: {
    id: number;
    name: string;
  };
  created_by: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MarketingCampaigns = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "email",
    status: "draft",
    budget: 0,
    target_audience: "",
    start_date: "",
    end_date: "",
    subject: "",
    message: "",
    landing_page_url: "",
    media_urls: [] as string[]
  });

  const queryClient = useQueryClient();

  // Fetch campaigns from API
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['marketing-campaigns', searchTerm, statusFilter, typeFilter],
    queryFn: () => apiClient.get('/marketing-campaigns', {
      params: {
        ...(searchTerm && { 'filters[name][$containsi]': searchTerm }),
        ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
        ...(typeFilter !== 'all' && { 'filters[type][$eq]': typeFilter }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'company',
        'populate[1]': 'created_by'
      }
    })
  });

  // Fetch campaign analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: () => apiClient.get('/campaign-tracking', {
      params: {
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/marketing-campaigns', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success(t('marketingCampaigns.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('marketingCampaigns.messages.createError'));
    }
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/marketing-campaigns/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success(t('marketingCampaigns.messages.updated'));
      setEditingCampaign(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('marketingCampaigns.messages.updateError'));
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/marketing-campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast.success(t('marketingCampaigns.messages.deleted'));
    },
    onError: () => {
      toast.error(t('marketingCampaigns.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "email",
      status: "draft",
      budget: 0,
      target_audience: "",
      start_date: "",
      end_date: "",
      subject: "",
      message: "",
      landing_page_url: "",
      media_urls: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const campaignData = {
      ...formData,
      content: {
        subject: formData.subject,
        message: formData.message,
        landing_page_url: formData.landing_page_url,
        media_urls: formData.media_urls
      },
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0
      }
    };

    if (editingCampaign) {
      updateCampaignMutation.mutate({ id: editingCampaign.id, data: campaignData });
    } else {
      createCampaignMutation.mutate(campaignData);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget,
      target_audience: campaign.target_audience,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      subject: campaign.content?.subject || "",
      message: campaign.content?.message || "",
      landing_page_url: campaign.content?.landing_page_url || "",
      media_urls: campaign.content?.media_urls || []
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    if (confirm(t('marketingCampaigns.messages.confirmDelete'))) {
      deleteCampaignMutation.mutate(campaign.id);
    }
  };

  const handleCampaignAction = (campaign: Campaign, action: 'start' | 'pause' | 'stop') => {
    const newStatus = action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'completed';
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { status: newStatus }
    });
  };

  const campaigns = campaignsData?.data?.data || [];
  const analytics = analyticsData?.data?.data || [];

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-green-600 text-white';
      case 'social_media': return 'bg-purple-100 text-purple-800';
      case 'landing_page': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return t('marketingCampaigns.types.email');
      case 'sms': return t('marketingCampaigns.types.sms');
      case 'whatsapp': return t('marketingCampaigns.types.whatsapp');
      case 'social_media': return t('marketingCampaigns.types.socialMedia');
      case 'landing_page': return t('marketingCampaigns.types.landingPage');
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('marketingCampaigns.status.active');
      case 'paused': return t('marketingCampaigns.status.paused');
      case 'completed': return t('marketingCampaigns.status.completed');
      case 'cancelled': return t('marketingCampaigns.status.cancelled');
      case 'draft': return t('marketingCampaigns.status.draft');
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const calculateBudgetProgress = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('marketingCampaigns.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('marketingCampaigns.subtitle')}
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('marketingCampaigns.stats.totalCampaigns')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground arabic-text">
                {campaigns.filter((c: Campaign) => c.status === 'active').length} {t('marketingCampaigns.stats.active')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('marketingCampaigns.stats.totalBudget')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {formatCurrency(campaigns.reduce((sum: number, c: Campaign) => sum + c.budget, 0))}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {formatCurrency(campaigns.reduce((sum: number, c: Campaign) => sum + c.spent, 0))} {t('marketingCampaigns.stats.spent')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('marketingCampaigns.stats.conversionRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {analytics[0]?.conversion_rate || 0}%
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('marketingCampaigns.stats.averageConversionRate')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('marketingCampaigns.stats.totalReach')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {analytics.reduce((sum: number, a: any) => sum + (a.impressions || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('marketingCampaigns.stats.impressions')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('marketingCampaigns.placeholders.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 w-64 arabic-text"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('marketingCampaigns.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                                  <SelectItem value="all">{t('marketingCampaigns.filters.allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('marketingCampaigns.status.active')}</SelectItem>
                  <SelectItem value="paused">{t('marketingCampaigns.status.paused')}</SelectItem>
                  <SelectItem value="completed">{t('marketingCampaigns.status.completed')}</SelectItem>
                  <SelectItem value="draft">{t('marketingCampaigns.status.draft')}</SelectItem>
                  <SelectItem value="cancelled">{t('marketingCampaigns.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('marketingCampaigns.filters.type')} />
              </SelectTrigger>
              <SelectContent>
                                  <SelectItem value="all">{t('marketingCampaigns.filters.allTypes')}</SelectItem>
                  <SelectItem value="email">{t('marketingCampaigns.types.email')}</SelectItem>
                  <SelectItem value="sms">{t('marketingCampaigns.types.sms')}</SelectItem>
                  <SelectItem value="whatsapp">{t('marketingCampaigns.types.whatsapp')}</SelectItem>
                  <SelectItem value="social_media">{t('marketingCampaigns.types.socialMedia')}</SelectItem>
                  <SelectItem value="landing_page">{t('marketingCampaigns.types.landingPage')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('marketingCampaigns.addNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="arabic-text">
                  {editingCampaign ? t('marketingCampaigns.editCampaign') : t('marketingCampaigns.newCampaign')}
                </DialogTitle>
                <DialogDescription className="arabic-text">
                  {editingCampaign ? t('marketingCampaigns.editCampaignDesc') : t('marketingCampaigns.addCampaignDesc')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-name" className="arabic-text">{t('marketingCampaigns.form.campaignName')}</Label>
                    <Input
                      id="campaign-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('marketingCampaigns.placeholders.campaignName')}
                      className="arabic-text"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-type" className="arabic-text">{t('marketingCampaigns.form.campaignType')}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t('marketingCampaigns.types.email')}</SelectItem>
                        <SelectItem value="sms">{t('marketingCampaigns.types.sms')}</SelectItem>
                        <SelectItem value="whatsapp">{t('marketingCampaigns.types.whatsapp')}</SelectItem>
                        <SelectItem value="social_media">{t('marketingCampaigns.types.socialMedia')}</SelectItem>
                        <SelectItem value="landing_page">{t('marketingCampaigns.types.landingPage')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="campaign-description" className="arabic-text">{t('marketingCampaigns.form.description')}</Label>
                  <Textarea
                    id="campaign-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('marketingCampaigns.placeholders.description')}
                    className="arabic-text"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="campaign-budget" className="arabic-text">{t('marketingCampaigns.form.budget')}</Label>
                    <Input
                      id="campaign-budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      placeholder={t('marketingCampaigns.placeholders.budget')}
                      className="arabic-text"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-start-date" className="arabic-text">{t('marketingCampaigns.form.startDate')}</Label>
                    <Input
                      id="campaign-start-date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="arabic-text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-end-date" className="arabic-text">{t('marketingCampaigns.form.endDate')}</Label>
                    <Input
                      id="campaign-end-date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="arabic-text"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="campaign-audience" className="arabic-text">{t('marketingCampaigns.form.targetAudience')}</Label>
                  <Textarea
                    id="campaign-audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder={t('marketingCampaigns.placeholders.targetAudience')}
                    className="arabic-text"
                    rows={2}
                  />
                </div>

                {(formData.type === 'email' || formData.type === 'sms' || formData.type === 'whatsapp') && (
                  <>
                    {formData.type === 'email' && (
                      <div>
                        <Label htmlFor="campaign-subject" className="arabic-text">{t('marketingCampaigns.form.subject')}</Label>
                        <Input
                          id="campaign-subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder={t('marketingCampaigns.placeholders.subject')}
                          className="arabic-text"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="campaign-message" className="arabic-text">
                        {formData.type === 'email' ? t('marketingCampaigns.form.message') : formData.type === 'sms' ? t('marketingCampaigns.form.message') : t('marketingCampaigns.form.message')}
                      </Label>
                      <Textarea
                        id="campaign-message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={
                          formData.type === 'email' ? t('marketingCampaigns.placeholders.message') :
                          formData.type === 'sms' ? t('marketingCampaigns.placeholders.message') :
                          t('marketingCampaigns.placeholders.message')
                        }
                        className="arabic-text"
                        rows={5}
                      />
                    </div>
                  </>
                )}

                {formData.type === 'landing_page' && (
                  <div>
                    <Label htmlFor="campaign-landing-page" className="arabic-text">{t('marketingCampaigns.form.landingPageUrl')}</Label>
                    <Input
                      id="campaign-landing-page"
                      value={formData.landing_page_url}
                      onChange={(e) => setFormData({ ...formData, landing_page_url: e.target.value })}
                      placeholder={t('marketingCampaigns.placeholders.landingPageUrl')}
                      className="arabic-text"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingCampaign(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    {t('marketingCampaigns.form.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                    className="flex-1"
                  >
                    {createCampaignMutation.isPending || updateCampaignMutation.isPending ? t('marketingCampaigns.form.saving') : t('marketingCampaigns.form.save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">{t('marketingCampaigns.table.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="arabic-text">{t('marketingCampaigns.table.campaignName')}</TableHead>
                  <TableHead className="arabic-text">{t('marketingCampaigns.table.type')}</TableHead>
                  <TableHead className="arabic-text">{t('marketingCampaigns.table.status')}</TableHead>
                  <TableHead className="arabic-text">{t('marketingCampaigns.table.budget')}</TableHead>
                  <TableHead className="arabic-text">{t('marketingCampaigns.table.progress')}</TableHead>
                  <TableHead className="arabic-text">{t('marketingCampaigns.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        {t('marketingCampaigns.messages.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('marketingCampaigns.messages.noCampaigns')}
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign: Campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium arabic-text">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground arabic-text line-clamp-2">
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCampaignTypeColor(campaign.type)}>
                          {getCampaignTypeLabel(campaign.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="arabic-text">
                        <div className="text-sm">
                          <div>{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</div>
                          <Progress
                            value={calculateBudgetProgress(campaign.spent, campaign.budget)}
                            className="w-20 h-2 mt-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm arabic-text">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            <span>{t('marketingCampaigns.table.impressions')}: {campaign.metrics?.impressions || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Send className="h-3 w-3" />
                            <span>{t('marketingCampaigns.table.clicks')}: {campaign.metrics?.clicks || 0}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleCampaignAction(campaign, 'start')}
                              className="h-8 w-8 p-0"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {campaign.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCampaignAction(campaign, 'pause')}
                              className="h-8 w-8 p-0"
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditCampaign(campaign)}
                                className="arabic-text"
                              >
                                <Edit className="h-4 w-4 ml-2" />
                                {t('marketingCampaigns.actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCampaign(campaign)}
                                className="arabic-text text-red-600"
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                {t('marketingCampaigns.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MarketingCampaigns;
