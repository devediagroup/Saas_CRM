import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock
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
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface LeadLifecycle {
  id: number;
  lead: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  current_stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  stage_history: any[];
  total_duration: number;
  conversion_rate: number;
  next_action: string;
  next_action_date: string;
  assigned_agent: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
}

const LeadLifecycle = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadLifecycle | null>(null);

  const [formData, setFormData] = useState({
    current_stage: "new",
    next_action: "",
    next_action_date: "",
    notes: ""
  });

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch lead lifecycles from API
  const { data: lifecyclesData, isLoading } = useQuery({
    queryKey: ['lead-lifecycles', searchTerm, statusFilter, stageFilter],
    queryFn: () => apiClient.get('/lead-lifecycles', {
      params: {
        ...(searchTerm && { 'filters[lead][first_name][$containsi]': searchTerm }),
        ...(stageFilter !== 'all' && { 'filters[current_stage][$eq]': stageFilter }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'lead',
        'populate[1]': 'assigned_agent',
        'populate[2]': 'stage_history'
      }
    })
  });

  // Update lifecycle mutation
  const updateLifecycleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/lead-lifecycles/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lifecycles'] });
      toast.success(t('success.updated'));
      setIsUpdateDialogOpen(false);
      setSelectedLead(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('errors.generic'));
    }
  });

  const resetForm = () => {
    setFormData({
      current_stage: "new",
      next_action: "",
      next_action_date: "",
      notes: ""
    });
  };

  const handleUpdateLifecycle = (lifecycle: LeadLifecycle) => {
    setSelectedLead(lifecycle);
    setFormData({
      current_stage: lifecycle.current_stage,
      next_action: lifecycle.next_action || "",
      next_action_date: lifecycle.next_action_date || "",
      notes: ""
    });
    setIsUpdateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLead) {
      updateLifecycleMutation.mutate({ id: selectedLead.id, data: formData });
    }
  };

  const lifecycles = lifecyclesData?.data?.data || [];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed_won': return 'bg-emerald-100 text-emerald-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'new': return t('leads.pipeline.new');
      case 'contacted': return t('leads.pipeline.contacted');
      case 'qualified': return t('leads.pipeline.qualified');
      case 'proposal': return t('leads.pipeline.proposal');
      case 'negotiation': return t('leads.pipeline.negotiation');
      case 'closed_won': return t('leads.pipeline.closed');
      case 'closed_lost': return t('leads.pipeline.lost');
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

  const getStageProgress = (stage: string) => {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won'];
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('leads.leadLifecycle.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('leads.leadLifecycle.subtitle')}
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leads.leadLifecycle.totalLeads')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">{lifecycles.length}</div>
                              <p className="text-xs text-muted-foreground arabic-text">
                  {t('leads.leadLifecycle.inSystem')}
                </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leads.leadLifecycle.conversionRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {lifecycles.length > 0
                  ? formatPercentage((lifecycles.filter((l: LeadLifecycle) => l.current_stage === 'closed_won').length / lifecycles.length) * 100)
                  : '0%'
                }
              </div>
                              <p className="text-xs text-muted-foreground arabic-text">
                  {t('leads.leadLifecycle.completedDeals')}
                </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leads.leadLifecycle.averageTime')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {lifecycles.length > 0
                  ? Math.round(lifecycles.reduce((sum: number, l: LeadLifecycle) => sum + (l.total_duration || 0), 0) / lifecycles.length)
                  : 0
                }
              </div>
                              <p className="text-xs text-muted-foreground arabic-text">
                  {t('leads.leadLifecycle.daysAverage')}
                </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('leads.leadLifecycle.inNegotiation')}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {lifecycles.filter((l: LeadLifecycle) => l.current_stage === 'negotiation').length}
              </div>
                              <p className="text-xs text-muted-foreground arabic-text">
                  {t('leads.leadLifecycle.finalStage')}
                </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('leads.leadLifecycle.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 w-64 arabic-text"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('leads.leadLifecycle.stagePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('leads.leadLifecycle.allStages')}</SelectItem>
              <SelectItem value="new">{t('leads.pipeline.new')}</SelectItem>
              <SelectItem value="contacted">{t('leads.pipeline.contacted')}</SelectItem>
              <SelectItem value="qualified">{t('leads.pipeline.qualified')}</SelectItem>
              <SelectItem value="proposal">{t('leads.pipeline.proposal')}</SelectItem>
              <SelectItem value="negotiation">{t('leads.pipeline.negotiation')}</SelectItem>
              <SelectItem value="closed_won">{t('leads.pipeline.closed')}</SelectItem>
              <SelectItem value="closed_lost">{t('leads.pipeline.lost')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lifecycle Table */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">{t('leads.leadLifecycle.tableTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.client')}</TableHead>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.currentStage')}</TableHead>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.progress')}</TableHead>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.conversionRate')}</TableHead>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.totalDuration')}</TableHead>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.nextAction')}</TableHead>
                  <TableHead className="arabic-text">{t('leads.leadLifecycle.tableHeaders.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        {t('common.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : lifecycles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('leads.leadLifecycle.noLifecycles')}
                    </TableCell>
                  </TableRow>
                ) : (
                  lifecycles.map((lifecycle: LeadLifecycle) => (
                    <TableRow key={lifecycle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium arabic-text">
                            {lifecycle.lead.first_name} {lifecycle.lead.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lifecycle.lead.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lifecycle.lead.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(lifecycle.current_stage)}>
                          {getStageLabel(lifecycle.current_stage)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={getStageProgress(lifecycle.current_stage)} className="w-20" />
                          <span className="text-sm arabic-text">
                            {Math.round(getStageProgress(lifecycle.current_stage))}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={lifecycle.conversion_rate || 0} className="w-16" />
                          <span className="text-sm arabic-text">
                            {formatPercentage(lifecycle.conversion_rate || 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="arabic-text">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{lifecycle.total_duration || 0} {t('leads.leadLifecycle.days')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm arabic-text">
                          {lifecycle.next_action ? (
                            <div>
                              <div>{lifecycle.next_action}</div>
                              {lifecycle.next_action_date && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(lifecycle.next_action_date).toLocaleDateString('ar-SA')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{t('leads.leadLifecycle.noAction')}</span>
                          )}
                        </div>
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
                              onClick={() => handleUpdateLifecycle(lifecycle)}
                              className="arabic-text"
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              {t('leads.leadLifecycle.updateStage')}
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

        {/* Update Lifecycle Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="arabic-text">
                {t('leads.leadLifecycle.updateStageTitle')}
              </DialogTitle>
              <DialogDescription className="arabic-text">
                {t('leads.leadLifecycle.updateStageDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="current-stage" className="arabic-text">{t('leads.leadLifecycle.currentStage')}</Label>
                <Select
                  value={formData.current_stage}
                  onValueChange={(value) => setFormData({ ...formData, current_stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                      <SelectItem value="new">{t('leads.pipeline.new')}</SelectItem>
                  <SelectItem value="contacted">{t('leads.pipeline.contacted')}</SelectItem>
                  <SelectItem value="qualified">{t('leads.pipeline.qualified')}</SelectItem>
                  <SelectItem value="proposal">{t('leads.pipeline.proposal')}</SelectItem>
                  <SelectItem value="negotiation">{t('leads.pipeline.negotiation')}</SelectItem>
                  <SelectItem value="closed_won">{t('leads.pipeline.closed')}</SelectItem>
                  <SelectItem value="closed_lost">{t('leads.pipeline.lost')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="next-action" className="arabic-text">{t('leads.leadLifecycle.nextAction')}</Label>
                <Input
                  id="next-action"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  placeholder={t('leads.leadLifecycle.nextActionPlaceholder')}
                  className="arabic-text"
                />
              </div>

              <div>
                <Label htmlFor="next-action-date" className="arabic-text">{t('leads.leadLifecycle.nextActionDate')}</Label>
                <Input
                  id="next-action-date"
                  type="datetime-local"
                  value={formData.next_action_date}
                  onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
                  className="arabic-text"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="arabic-text">{t('common.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('leads.leadLifecycle.notesPlaceholder')}
                  className="arabic-text"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdateDialogOpen(false);
                    setSelectedLead(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={updateLifecycleMutation.isPending}
                  className="flex-1"
                >
                  {updateLifecycleMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LeadLifecycle;
