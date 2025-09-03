import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
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
import { usePermissions } from "@/hooks/usePermissions";
import { Can, CanAny } from "@/components/PermissionGuard";

interface Activity {
  id: number;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
  title: string;
  description: string;
  client: string;
  property?: string;
  deal?: string;
  agent: string;
  result: string;
  priority: 'low' | 'medium' | 'high';
  scheduledAt: string;
  completedAt?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration?: number;
  nextAction?: string;
}

const Activities = () => {
  const { t } = useTranslation();
  const { can, canCRUD } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: "Call",
    subject: "",
    description: "",
    activity_date: "",
    duration: 30,
    outcome: "Successful",
    next_action: "",
    next_action_date: ""
  });

  // Fetch activities from API
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', searchTerm, typeFilter, statusFilter],
    queryFn: () => api.getActivities({
      ...(searchTerm && { title_contains: searchTerm }),
      ...(typeFilter !== 'all' && { type: typeFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      sort: 'created_at:desc'
    })
  });

  const activities = Array.isArray(activitiesData?.data) ? activitiesData.data : [];

  // CRUD mutations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(t('activities.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('activities.messages.error'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateActivity(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(t('activities.messages.updated'));
      setEditingActivity(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('activities.messages.error'));
    }
  });

  const resetForm = () => {
    setFormData({
      type: "Call",
      subject: "",
      description: "",
      activity_date: "",
      duration: 30,
      outcome: "Successful",
      next_action: "",
      next_action_date: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (activity: any) => {
    setEditingActivity(activity);
    setFormData({
      type: activity.type || 'Call',
      subject: activity.subject || '',
      description: activity.description || '',
      activity_date: activity.activity_date ? activity.activity_date.split('T')[0] : '',
      duration: activity.duration || 30,
      outcome: activity.outcome || 'Successful',
      next_action: activity.next_action || '',
      next_action_date: activity.next_action_date ? activity.next_action_date.split('T')[0] : ''
    });
  };

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
  const getAgentLabel = (a: any) => getLabel(a, ['name', 'full_name', 'username', 'email']);
  const getScheduledAt = (a: any) => a?.scheduledAt ?? a?.activity_date ?? a?.scheduled_at;

  // Delete activity mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteActivity(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(t('activities.messages.deleted'));
    },
    onError: () => {
      toast.error(t('activities.messages.error'));
    }
  });

  const handleDelete = (id: number) => {
    if (confirm(t('activities.messages.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  // Removed mock activities data - using API instead

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'meeting': return <CalendarIcon className="h-4 w-4" />;
      case 'note': return <Edit className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'email': return 'bg-green-100 text-green-800 border-green-200';
      case 'whatsapp': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'note': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'interested':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needsTime':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waitingResponse':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'followUpRequired':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-green-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm ||
      (activity.subject && activity.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesResult = resultFilter === 'all' || activity.result === resultFilter;

    return matchesSearch && matchesType && matchesStatus && matchesResult;
  });

  const totalActivities = activities.length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;
  const scheduledActivities = activities.filter(a => a.status === 'scheduled').length;
  const todayActivities = activities.filter(a =>
    getScheduledAt(a) && new Date(getScheduledAt(a)).toDateString() === new Date().toDateString()
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 arabic-text">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('activities.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('activities.search')}
            </p>
          </div>
          <Can permission="activities.create">
            <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
              {t('activities.add')}
            </Button>
          </Can>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('activities.stats.totalActivities')}</p>
                  <p className="text-2xl font-bold text-primary">{totalActivities}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('activities.stats.completedActivities')}</p>
                  <p className="text-2xl font-bold text-primary">{completedActivities}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">{t('activities.stats.scheduledActivities')}</p>
                  <p className="text-2xl font-bold text-primary">{scheduledActivities}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">{t('activities.stats.todayActivities')}</p>
                  <p className="text-2xl font-bold text-primary">{todayActivities}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('activities.filters.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('activities.filters.searchPlaceholder')}
                    className="pr-10 arabic-text"
                    dir="rtl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t('activities.filters.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('activities.types.all')}</SelectItem>
                  <SelectItem value="call">{t('activities.types.call')}</SelectItem>
                  <SelectItem value="email">{t('activities.types.email')}</SelectItem>
                  <SelectItem value="whatsapp">{t('activities.types.whatsapp')}</SelectItem>
                  <SelectItem value="meeting">{t('activities.types.meeting')}</SelectItem>
                  <SelectItem value="note">{t('activities.types.note')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t('activities.filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('activities.status.all')}</SelectItem>
                  <SelectItem value="scheduled">{t('activities.status.scheduled')}</SelectItem>
                  <SelectItem value="completed">{t('activities.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('activities.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('activities.filters.resultPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('activities.results.all')}</SelectItem>
                  <SelectItem value="interested">{t('activities.results.interested')}</SelectItem>
                  <SelectItem value="completed">{t('activities.results.completed')}</SelectItem>
                  <SelectItem value="needsTime">{t('activities.results.needsTime')}</SelectItem>
                  <SelectItem value="waitingResponse">{t('activities.results.waitingResponse')}</SelectItem>
                  <SelectItem value="cancelled">{t('activities.results.cancelled')}</SelectItem>
                  <SelectItem value="followUpRequired">{t('activities.results.followUpRequired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('activities.table.title')} ({filteredActivities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('activities.table.activity')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.type')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.client')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.relatedProperty')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.agent')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.result')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.dateTime')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.status')}</TableHead>
                    <TableHead className="text-right">{t('activities.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                          {activity.nextAction && (
                            <p className="text-xs text-blue-600 mt-1">
                              {t('activities.nextAction')}: {activity.nextAction}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(activity.type)} flex items-center gap-1 w-fit`}>
                          {getTypeIcon(activity.type)}
                          <span>
                            {activity.type === 'call' && t('activities.types.call')}
                            {activity.type === 'email' && t('activities.types.email')}
                            {activity.type === 'whatsapp' && t('activities.types.whatsapp')}
                            {activity.type === 'meeting' && t('activities.types.meeting')}
                            {activity.type === 'note' && t('activities.types.note')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {activity.outcome || t('hardcoded.undefined')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity.property ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm line-clamp-1">{getPropertyLabel(activity.property)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getAgentLabel(activity.agent)}</TableCell>
                      <TableCell>
                        <Badge className={getResultColor(activity.result)}>
                          {activity.result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {getScheduledAt(activity) ? new Date(getScheduledAt(activity)).toLocaleDateString('ar-SA') : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getScheduledAt(activity) ? new Date(getScheduledAt(activity)).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </p>
                          {activity.duration && (
                            <p className="text-xs text-blue-600">
                              {t('activities.duration')}: {activity.duration}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(activity.status)}
                          <span className={`text-sm ${getPriorityColor(activity.priority)}`}>
                            {activity.priority === 'high' && t('activities.priorityLevels.high')}
                            {activity.priority === 'medium' && t('activities.priorityLevels.medium')}
                            {activity.priority === 'low' && t('activities.priorityLevels.low')}
                          </span>
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
                              <Eye className="ml-2 h-4 w-4" />
                              {t('activities.actions.viewDetails')}
                            </DropdownMenuItem>
                            <Can permission="activities.update">
                              <DropdownMenuItem onClick={() => handleEdit(activity)}>
                                <Edit className="ml-2 h-4 w-4" />
                                {t('activities.actions.editActivity')}
                              </DropdownMenuItem>
                            </Can>
                            <DropdownMenuItem>
                              <CheckCircle className="ml-2 h-4 w-4" />
                              {t('activities.actions.markComplete')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {t('activities.actions.reschedule')}
                            </DropdownMenuItem>
                            <Can permission="activities.delete">
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(activity.id)}>
                                <Trash2 className="ml-2 h-4 w-4" />
                                {t('activities.actions.deleteActivity')}
                              </DropdownMenuItem>
                            </Can>
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

        {/* Today's Schedule */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('activities.schedule.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities
                .filter(a =>
                  getScheduledAt(a) && new Date(getScheduledAt(a)).toDateString() === new Date().toDateString() &&
                  a.status === 'scheduled'
                )
                .sort((a, b) => (getScheduledAt(a) ? new Date(getScheduledAt(a)).getTime() : 0) - (getScheduledAt(b) ? new Date(getScheduledAt(b)).getTime() : 0))
                .slice(0, 5)
                .map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(activity.type).replace('border-', 'bg-').replace('text-', '').replace('800', '100')}`}>
                        {getTypeIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.subject}</p>
                        <p className="text-sm text-muted-foreground">{activity.outcome || t('hardcoded.undefined')}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">
                        {getScheduledAt(activity) ? new Date(getScheduledAt(activity)).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </p>
                      <Badge className={getResultColor(activity.result)}>
                        {activity.result}
                      </Badge>
                    </div>
                  </div>
                ))}
              {activities.filter(a =>
                getScheduledAt(a) && new Date(getScheduledAt(a)).toDateString() === new Date().toDateString() &&
                a.status === 'scheduled'
              ).length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('activities.schedule.noActivities')}</h3>
                    <p className="text-muted-foreground">{t('activities.schedule.addNewHint')}</p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
        {/* Create/Edit Activity Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingActivity} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingActivity(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="arabic-text">
                {editingActivity ? t('activities.form.editActivity') : t('activities.form.addActivity')}
              </DialogTitle>
              <DialogDescription className="arabic-text">
                {editingActivity ? t('activities.form.editDescription') : t('activities.form.addDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="arabic-text">{t('activities.form.type')}</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue placeholder={t('activities.form.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call">{t('activities.types.call')}</SelectItem>
                      <SelectItem value="Meeting">{t('activities.types.meeting')}</SelectItem>
                      <SelectItem value="Email">{t('activities.types.email')}</SelectItem>
                      <SelectItem value="WhatsApp">{t('activities.types.whatsapp')}</SelectItem>
                      <SelectItem value="Visit">{t('activities.types.visit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outcome" className="arabic-text">{t('activities.form.result')}</Label>
                  <Select value={formData.outcome} onValueChange={(value) => setFormData({ ...formData, outcome: value })}>
                    <SelectTrigger className="arabic-text">
                      <SelectValue placeholder={t('activities.form.resultPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Successful">{t('activities.outcomes.successful')}</SelectItem>
                      <SelectItem value="No Answer">{t('activities.outcomes.noAnswer')}</SelectItem>
                      <SelectItem value="Interested">{t('activities.outcomes.interested')}</SelectItem>
                      <SelectItem value="Not Interested">{t('activities.outcomes.notInterested')}</SelectItem>
                      <SelectItem value="Follow Up Required">{t('activities.outcomes.followUpRequired')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="arabic-text">{t('activities.form.subject')}</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="arabic-text"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="arabic-text">{t('activities.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="arabic-text"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity_date" className="arabic-text">{t('activities.form.activityDate')}</Label>
                  <Input
                    id="activity_date"
                    type="datetime-local"
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    className="arabic-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="arabic-text">{t('activities.form.duration')}</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="arabic-text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_action" className="arabic-text">{t('activities.form.nextAction')}</Label>
                <Input
                  id="next_action"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  className="arabic-text"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingActivity(null);
                  resetForm();
                }} className="arabic-text">
                  {t('activities.form.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="arabic-text">
                  {editingActivity ? t('activities.form.update') : t('activities.form.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Activities;