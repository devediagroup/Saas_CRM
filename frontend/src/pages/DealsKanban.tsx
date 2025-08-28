import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Building2,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Deal {
  id: number;
  title: string;
  description: string;
  value: number;
  probability: number;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  expected_close_date: string;
  actual_close_date?: string;
  lead: {
    id: number;
    first_name: string;
    last_name: string;
  };
  property: {
    id: number;
    title: string;
  };
  assigned_to: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  company: {
    id: number;
    name: string;
  };
  createdAt: string;
}

const DealsKanban = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: 0,
    probability: 50,
    stage: "new",
    expected_close_date: "",
    lead_id: "",
    property_id: "",
    assigned_to_id: ""
  });

  const queryClient = useQueryClient();

  // Fetch deals from API
  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals-kanban', searchTerm],
    queryFn: () => apiClient.get('/deals', {
      params: {
        ...(searchTerm && { 'filters[title][$containsi]': searchTerm }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'lead',
        'populate[1]': 'property',
        'populate[2]': 'assigned_to',
        'populate[3]': 'company'
      }
    })
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/deals', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      toast.success(t('dealsKanban.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('dealsKanban.messages.createError'));
    }
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/deals/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      toast.success(t('dealsKanban.messages.updated'));
      setEditingDeal(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('dealsKanban.messages.updateError'));
    }
  });

  // Delete deal mutation
  const deleteDealMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals-kanban'] });
      toast.success(t('dealsKanban.messages.deleted'));
    },
    onError: () => {
      toast.error(t('dealsKanban.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      value: 0,
      probability: 50,
      stage: "new",
      expected_close_date: "",
      lead_id: "",
      property_id: "",
      assigned_to_id: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dealData = {
      title: formData.title,
      description: formData.description,
      value: formData.value,
      probability: formData.probability,
      stage: formData.stage,
      expected_close_date: formData.expected_close_date,
      ...(formData.lead_id && { lead: formData.lead_id }),
      ...(formData.property_id && { property: formData.property_id }),
      ...(formData.assigned_to_id && { assigned_to: formData.assigned_to_id })
    };

    if (editingDeal) {
      updateDealMutation.mutate({ id: editingDeal.id, data: dealData });
    } else {
      createDealMutation.mutate(dealData);
    }
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description,
      value: deal.value,
      probability: deal.probability,
      stage: deal.stage,
      expected_close_date: deal.expected_close_date,
      lead_id: deal.lead?.id.toString() || "",
      property_id: deal.property?.id.toString() || "",
      assigned_to_id: deal.assigned_to?.id.toString() || ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteDeal = (deal: Deal) => {
    if (confirm(t('dealsKanban.messages.confirmDelete'))) {
      deleteDealMutation.mutate(deal.id);
    }
  };

  const handleStageChange = (deal: Deal, newStage: string) => {
    updateDealMutation.mutate({
      id: deal.id,
      data: { stage: newStage }
    });
  };

  const deals = dealsData?.data?.data || [];

  // Group deals by stage for Kanban view
  const dealsByStage = {
    new: deals.filter((deal: Deal) => deal.stage === 'new'),
    contacted: deals.filter((deal: Deal) => deal.stage === 'contacted'),
    qualified: deals.filter((deal: Deal) => deal.stage === 'qualified'),
    proposal: deals.filter((deal: Deal) => deal.stage === 'proposal'),
    negotiation: deals.filter((deal: Deal) => deal.stage === 'negotiation'),
    closed_won: deals.filter((deal: Deal) => deal.stage === 'closed_won'),
    closed_lost: deals.filter((deal: Deal) => deal.stage === 'closed_lost')
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'qualified': return 'bg-green-100 text-green-800 border-green-200';
      case 'proposal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'negotiation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed_won': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed_lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'new': return t('dealsKanban.stages.new');
      case 'contacted': return t('dealsKanban.stages.contacted');
      case 'qualified': return t('dealsKanban.stages.qualified');
      case 'proposal': return t('dealsKanban.stages.proposal');
      case 'negotiation': return t('dealsKanban.stages.negotiation');
      case 'closed_won': return t('dealsKanban.stages.closedWon');
      case 'closed_lost': return t('dealsKanban.stages.closedLost');
      default: return stage;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const kanbanStages = [
    { id: 'new', title: t('dealsKanban.stages.new'), deals: dealsByStage.new },
    { id: 'contacted', title: t('dealsKanban.stages.contacted'), deals: dealsByStage.contacted },
    { id: 'qualified', title: t('dealsKanban.stages.qualified'), deals: dealsByStage.qualified },
    { id: 'proposal', title: t('dealsKanban.stages.proposal'), deals: dealsByStage.proposal },
    { id: 'negotiation', title: t('dealsKanban.stages.negotiation'), deals: dealsByStage.negotiation },
    { id: 'closed_won', title: t('dealsKanban.stages.closedWon'), deals: dealsByStage.closed_won },
    { id: 'closed_lost', title: t('dealsKanban.stages.closedLost'), deals: dealsByStage.closed_lost }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('dealsKanban.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('dealsKanban.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('dealsKanban.placeholders.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 w-64 arabic-text"
              />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('dealsKanban.addNew')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="arabic-text">
                    {editingDeal ? t('dealsKanban.editDeal') : t('dealsKanban.newDeal')}
                  </DialogTitle>
                  <DialogDescription className="arabic-text">
                    {t('dealsKanban.addDealDesc')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deal-title" className="arabic-text">{t('dealsKanban.form.dealTitle')}</Label>
                      <Input
                        id="deal-title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={t('dealsKanban.placeholders.dealTitle')}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div>
                                              <Label htmlFor="deal-value" className="arabic-text">{t('dealsKanban.form.dealValue')}</Label>
                      <Input
                        id="deal-value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="arabic-text"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="deal-stage" className="arabic-text">{t('dealsKanban.form.dealStage')}</Label>
                      <Select
                        value={formData.stage}
                        onValueChange={(value) => setFormData({ ...formData, stage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t('dealsKanban.stages.new')}</SelectItem>
                          <SelectItem value="contacted">{t('dealsKanban.stages.contacted')}</SelectItem>
                          <SelectItem value="qualified">{t('dealsKanban.stages.qualified')}</SelectItem>
                          <SelectItem value="proposal">{t('dealsKanban.stages.proposal')}</SelectItem>
                          <SelectItem value="negotiation">{t('dealsKanban.stages.negotiation')}</SelectItem>
                          <SelectItem value="closed_won">{t('dealsKanban.stages.closedWon')}</SelectItem>
                          <SelectItem value="closed_lost">{t('dealsKanban.stages.closedLost')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                                              <Label htmlFor="deal-probability" className="arabic-text">{t('dealsKanban.form.dealProbability')}</Label>
                      <Input
                        id="deal-probability"
                        type="number"
                        value={formData.probability}
                        onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) || 0 })}
                        placeholder="50"
                        className="arabic-text"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                                              <Label htmlFor="deal-close-date" className="arabic-text">{t('dealsKanban.form.dealCloseDate')}</Label>
                      <Input
                        id="deal-close-date"
                        type="date"
                        value={formData.expected_close_date}
                        onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                        className="arabic-text"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deal-description" className="arabic-text">{t('dealsKanban.form.dealDescription')}</Label>
                    <Textarea
                      id="deal-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('dealsKanban.placeholders.dealDescription')}
                      className="arabic-text"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingDeal(null);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      {t('dealsKanban.form.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={createDealMutation.isPending || updateDealMutation.isPending}
                      className="flex-1"
                    >
                      {createDealMutation.isPending || updateDealMutation.isPending ? t('dealsKanban.form.saving') : t('dealsKanban.form.save')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-6" style={{ minHeight: '70vh' }}>
          {kanbanStages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold arabic-text flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stage.id === 'closed_won' ? 'bg-green-500' :
                      stage.id === 'closed_lost' ? 'bg-red-500' :
                      stage.id === 'negotiation' ? 'bg-orange-500' :
                      stage.id === 'proposal' ? 'bg-purple-500' :
                      stage.id === 'qualified' ? 'bg-green-400' :
                      stage.id === 'contacted' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    {stage.title}
                  </h3>
                  <Badge className="bg-gray-200 text-gray-800">
                    {stage.deals.length}
                  </Badge>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {stage.deals.map((deal: Deal) => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium arabic-text text-sm line-clamp-2">
                              {deal.title}
                            </h4>
                            {deal.description && (
                              <p className="text-xs text-muted-foreground arabic-text line-clamp-2 mt-1">
                                {deal.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="font-medium arabic-text">
                                {formatCurrency(deal.value)}
                              </span>
                            </div>
                            <Badge className="text-xs">
                              {formatPercentage(deal.probability)}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {deal.lead && (
                              <div className="flex items-center gap-2 text-xs">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="arabic-text">
                                  {deal.lead.first_name} {deal.lead.last_name}
                                </span>
                              </div>
                            )}

                            {deal.property && (
                              <div className="flex items-center gap-2 text-xs">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <span className="arabic-text line-clamp-1">
                                  {deal.property.title}
                                </span>
                              </div>
                            )}

                            {deal.expected_close_date && (
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="arabic-text">
                                  {new Date(deal.expected_close_date).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditDeal(deal)}
                                  className="arabic-text"
                                >
                                  <Edit className="h-4 w-4 ml-2" />
                                  {t('dealsKanban.actions.edit')}
                                </DropdownMenuItem>
                                {stage.id !== 'new' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStageChange(deal, 'new')}
                                    className="arabic-text"
                                  >
                                    <ArrowLeft className="h-4 w-4 ml-2" />
                                    {t('dealsKanban.actions.backToNew')}
                                  </DropdownMenuItem>
                                )}
                                {stage.id !== 'closed_won' && stage.id !== 'closed_lost' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleStageChange(deal, 'closed_won')}
                                      className="arabic-text text-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 ml-2" />
                                      {t('dealsKanban.actions.closeAsWon')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStageChange(deal, 'closed_lost')}
                                      className="arabic-text text-red-600"
                                    >
                                      <XCircle className="h-4 w-4 ml-2" />
                                      {t('dealsKanban.actions.closeAsLost')}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteDeal(deal)}
                                  className="arabic-text text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  {t('dealsKanban.actions.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {stage.deals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground arabic-text">
                      {t('dealsKanban.messages.noDealsInStage')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealsKanban;
