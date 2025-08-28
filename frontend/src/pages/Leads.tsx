import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Calendar
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  interest: string;
  budget: number;
  createdAt: string;
  lastContact: string;
  agent: string;
}

const Leads = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    status: "new",
    interest: "",
    budget: 0,
    notes: ""
  });

  const queryClient = useQueryClient();

  // Fetch leads from API
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', searchTerm, statusFilter, sourceFilter],
    queryFn: () => api.getLeads({
      ...(searchTerm && { first_name_contains: searchTerm }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      sort: 'created_at:desc'
    })
  });

  const leads = Array.isArray(leadsData?.data) ? leadsData.data : [];

  // Create lead mutation
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(t('leads.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('leads.messages.error'));
    }
  });

  // Update lead mutation  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateLead(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(t('leads.messages.updated'));
      setEditingLead(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('leads.messages.error'));
    }
  });

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteLead(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(t('leads.messages.deleted'));
    },
    onError: () => {
      toast.error(t('leads.messages.error'));
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      source: "",
      status: "new",
      interest: "",
      budget: 0,
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id.toString(), data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || '',
      status: lead.status || 'new',
      interest: lead.interest || '',
      budget: lead.budget_min || 0,
      notes: lead.notes || ""
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('leads.messages.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interested': return 'bg-green-100 text-green-800 border-green-200';
      case 'deal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'notInterested': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    const matchesSearch = !searchTerm || 
                         fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.phone && lead.phone.includes(searchTerm)) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 arabic-text">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('leads.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('leads.search')}
            </p>
          </div>
          <Button className="gradient-primary">
            <Plus className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
            {t('leads.add')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('leads.stats.totalLeads')}</p>
                  <p className="text-2xl font-bold text-primary">{leads.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('leads.stats.newLeads')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {leads.filter(l => l.status === 'new').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('leads.stats.potentialDeals')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {leads.filter(l => l.status === 'interested' || l.status === 'deal').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('leads.stats.conversionRate')}</p>
                  <p className="text-2xl font-bold text-primary">
                                         {Math.round((leads.filter(l => l.status === 'deal').length / leads.length) * 100)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('leads.filters.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('leads.filters.searchPlaceholder')}
                    className="pr-10 arabic-text"
                    dir="rtl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={t('leads.filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('leads.status.all')}</SelectItem>
                  <SelectItem value="new">{t('leads.status.new')}</SelectItem>
                  <SelectItem value="contacted">{t('leads.status.contacted')}</SelectItem>
                  <SelectItem value="interested">{t('leads.status.interested')}</SelectItem>
                  <SelectItem value="deal">{t('leads.status.deal')}</SelectItem>
                  <SelectItem value="notInterested">{t('leads.status.notInterested')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={t('leads.filters.sourcePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('leads.sources.all')}</SelectItem>
                  <SelectItem value="facebook">{t('leads.sources.facebook')}</SelectItem>
                  <SelectItem value="google">{t('leads.sources.google')}</SelectItem>
                  <SelectItem value="referral">{t('leads.sources.referral')}</SelectItem>
                  <SelectItem value="whatsapp">{t('leads.sources.whatsapp')}</SelectItem>
                  <SelectItem value="realEstatePortal">{t('leads.sources.realEstatePortal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('leads.table.title')} ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('leads.table.clientName')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.contact')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.source')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.status')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.interest')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.budget')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.agent')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.lastContact')}</TableHead>
                    <TableHead className="text-right">{t('leads.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{`${lead.first_name || ''} ${lead.last_name || ''}`.trim()}</p>
                          <p className="text-sm text-muted-foreground">#{lead.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{lead.phone}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.interest}</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(lead.budget)}
                      </TableCell>
                      <TableCell>{lead.agent}</TableCell>
                      <TableCell>
                        {new Date(lead.lastContact).toLocaleDateString('ar-SA')}
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
                              <Eye className="ml-2 h-4 w-4" />
                              {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(lead)}>
                              <Edit className="ml-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>
                              <Phone className="ml-2 h-4 w-4" />
                              {t('leads.actions.call')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}>
                              <Mail className="ml-2 h-4 w-4" />
                              {t('leads.actions.sendEmail')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(lead.id)}>
                              <Trash2 className="ml-2 h-4 w-4" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Lead Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingLead} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingLead(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="arabic-text">
                {editingLead ? t('leads.edit') : t('leads.add')}
              </DialogTitle>
              <DialogDescription className="arabic-text">
                                  {editingLead ? t('leads.editDescription') : t('leads.addDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="arabic-text">{t('leads.fields.firstName')}</Label>
                  <Input
                    id="first_name"
                    value={formData.name.split(' ')[0] || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value + ' ' + (formData.name.split(' ')[1] || '')})}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="arabic-text">{t('leads.fields.lastName')}</Label>
                  <Input
                    id="last_name"
                    value={formData.name.split(' ')[1] || ''}
                    onChange={(e) => setFormData({...formData, name: (formData.name.split(' ')[0] || '') + ' ' + e.target.value})}
                    className="arabic-text"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="arabic-text">{t('leads.fields.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="arabic-text">{t('leads.fields.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="arabic-text"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="arabic-text">{t('leads.fields.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue placeholder={t('leads.fields.statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t('leads.status.new')}</SelectItem>
                      <SelectItem value="contacted">{t('leads.status.contacted')}</SelectItem>
                      <SelectItem value="interested">{t('leads.status.interested')}</SelectItem>
                      <SelectItem value="notInterested">{t('leads.status.notInterested')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="arabic-text">{t('leads.fields.budget')}</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                    className="arabic-text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="arabic-text">{t('common.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="arabic-text"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingLead(null);
                  resetForm();
                }} className="arabic-text">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="arabic-text">
                  {editingLead ? t('common.update') : t('common.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Leads;