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
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  Handshake,
  User,
  MapPin,
  Phone,
  Video
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  type: 'call' | 'meeting' | 'visit' | 'follow_up' | 'reminder' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date: string;
  completed_at?: string;
  assigned_to: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  related_lead?: {
    id: number;
    name: string;
  };
  related_deal?: {
    id: number;
    title: string;
  };
  related_property?: {
    id: number;
    title: string;
  };
  team?: {
    id: number;
    name: string;
  };
  location?: string;
  meeting_link?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const TasksAppointments = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "call",
    status: "pending",
    priority: "normal",
    due_date: "",
    assigned_to: "",
    related_lead: "",
    related_deal: "",
    related_property: "",
    team: "",
    location: "",
    meeting_link: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  // Fetch tasks from API
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', searchTerm, statusFilter, typeFilter, priorityFilter],
    queryFn: () => apiClient.get('/tasks', {
      params: {
        ...(searchTerm && { 'filters[title][$containsi]': searchTerm }),
        ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
        ...(typeFilter !== 'all' && { 'filters[type][$eq]': typeFilter }),
        ...(priorityFilter !== 'all' && { 'filters[priority][$eq]': priorityFilter }),
        'sort[0]': 'due_date:asc',
        'populate[0]': 'assigned_to',
        'populate[1]': 'related_lead',
        'populate[2]': 'related_deal',
        'populate[3]': 'related_property',
        'populate[4]': 'team'
      }
    })
  });

  // Fetch users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['users-for-tasks'],
    queryFn: () => apiClient.get('/users')
  });

  // Fetch leads for relation
  const { data: leadsData } = useQuery({
    queryKey: ['leads-for-tasks'],
    queryFn: () => apiClient.get('/leads', { params: { 'pagination[limit]': 100 } })
  });

  // Fetch deals for relation
  const { data: dealsData } = useQuery({
    queryKey: ['deals-for-tasks'],
    queryFn: () => apiClient.get('/deals', { params: { 'pagination[limit]': 100 } })
  });

  // Fetch properties for relation
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-for-tasks'],
    queryFn: () => apiClient.get('/properties', { params: { 'pagination[limit]': 100 } })
  });

  // Fetch teams for relation
  const { data: teamsData } = useQuery({
    queryKey: ['teams-for-tasks'],
    queryFn: () => apiClient.get('/teams')
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/tasks', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(t('tasks.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('tasks.messages.createError'));
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/tasks/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(t('tasks.messages.updated'));
      setEditingTask(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('tasks.messages.updateError'));
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(t('tasks.messages.deleted'));
    },
    onError: () => {
      toast.error(t('tasks.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "call",
      status: "pending",
      priority: "normal",
      due_date: "",
      assigned_to: "",
      related_lead: "",
      related_deal: "",
      related_property: "",
      team: "",
      location: "",
      meeting_link: "",
      notes: ""
    });
    setSelectedDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      due_date: formData.due_date || selectedDate?.toISOString(),
      ...(formData.assigned_to && { assigned_to: formData.assigned_to }),
      ...(formData.related_lead && { related_lead: formData.related_lead }),
      ...(formData.related_deal && { related_deal: formData.related_deal }),
      ...(formData.related_property && { related_property: formData.related_property }),
      ...(formData.team && { team: formData.team })
    };

    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      assigned_to: task.assigned_to?.id.toString() || "",
      related_lead: task.related_lead?.id.toString() || "",
      related_deal: task.related_deal?.id.toString() || "",
      related_property: task.related_property?.id.toString() || "",
      team: task.team?.id.toString() || "",
      location: task.location || "",
      meeting_link: task.meeting_link || "",
      notes: task.notes
    });
    setSelectedDate(new Date(task.due_date));
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    if (confirm(t('tasksAppointments.confirmDelete'))) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const tasks = tasksData?.data?.data || [];
  const users = usersData?.data || [];
  const leads = leadsData?.data?.data || [];
  const deals = dealsData?.data?.data || [];
  const properties = propertiesData?.data?.data || [];
  const teams = teamsData?.data?.data || [];

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'visit': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-orange-100 text-orange-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return t('tasks.types.call');
      case 'meeting': return t('tasks.types.meeting');
      case 'visit': return t('tasks.types.visit');
      case 'follow_up': return t('tasks.types.follow_up');
      case 'reminder': return t('tasks.types.reminder');
      case 'other': return t('tasks.types.other');
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('tasksAppointments.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('tasksAppointments.subtitle')}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('tasksAppointments.searchTasks')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 w-64 arabic-text"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('tasksAppointments.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasksAppointments.allStatuses')}</SelectItem>
                <SelectItem value="pending">{t('tasks.status.pending')}</SelectItem>
                <SelectItem value="in_progress">{t('tasks.status.in_progress')}</SelectItem>
                <SelectItem value="completed">{t('tasks.status.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('tasks.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('tasksAppointments.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasksAppointments.allTypes')}</SelectItem>
                <SelectItem value="call">{t('tasks.types.call')}</SelectItem>
                <SelectItem value="meeting">{t('tasks.types.meeting')}</SelectItem>
                <SelectItem value="visit">{t('tasks.types.visit')}</SelectItem>
                <SelectItem value="follow_up">{t('tasks.types.follow_up')}</SelectItem>
                <SelectItem value="reminder">{t('tasks.types.reminder')}</SelectItem>
                <SelectItem value="other">{t('tasks.types.other')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('tasksAppointments.priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tasksAppointments.allPriorities')}</SelectItem>
                <SelectItem value="low">{t('tasks.priority.low')}</SelectItem>
                <SelectItem value="normal">{t('tasks.priority.normal')}</SelectItem>
                <SelectItem value="high">{t('tasks.priority.high')}</SelectItem>
                <SelectItem value="urgent">{t('tasks.priority.urgent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('tasks.form.addNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="arabic-text">
                  {editingTask ? t('tasks.form.editTaskTitle') : t('tasks.form.addNewTitle')}
                </DialogTitle>
                <DialogDescription className="arabic-text">
                  {t('tasks.form.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-title" className="arabic-text">{t('tasksAppointments.taskTitle')}</Label>
                    <Input
                      id="task-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('tasks.form.titlePlaceholder')}
                      className="arabic-text"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-type" className="arabic-text">{t('tasksAppointments.taskType')}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">{t('tasks.types.call')}</SelectItem>
                        <SelectItem value="meeting">{t('tasks.types.meeting')}</SelectItem>
                        <SelectItem value="visit">{t('tasks.types.visit')}</SelectItem>
                        <SelectItem value="follow_up">{t('tasks.types.follow_up')}</SelectItem>
                        <SelectItem value="reminder">{t('tasks.types.reminder')}</SelectItem>
                        <SelectItem value="other">{t('tasks.types.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="task-description" className="arabic-text">{t('tasksAppointments.description')}</Label>
                  <Textarea
                    id="task-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('tasksAppointments.taskDescription')}
                    className="arabic-text"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="task-priority" className="arabic-text">{t('tasksAppointments.taskPriority')}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('tasks.priority.low')}</SelectItem>
                        <SelectItem value="normal">{t('tasks.priority.normal')}</SelectItem>
                        <SelectItem value="high">{t('tasks.priority.high')}</SelectItem>
                        <SelectItem value="urgent">{t('tasks.priority.urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-status" className="arabic-text">{t('tasksAppointments.taskStatus')}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('tasks.status.pending')}</SelectItem>
                        <SelectItem value="in_progress">{t('tasks.status.in_progress')}</SelectItem>
                        <SelectItem value="completed">{t('tasks.status.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('tasks.status.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="arabic-text">{t('tasksAppointments.dueDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-right font-normal arabic-text"
                        >
                          <Calendar className="ml-2 h-4 w-4" />
                          {selectedDate ? formatDate(selectedDate.toISOString()) : t('tasksAppointments.selectDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setFormData({ ...formData, due_date: date.toISOString() });
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-assigned" className="arabic-text">{t('tasksAppointments.assignedTo')}</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('tasksAppointments.selectAssigned')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('common.notSpecified')}</SelectItem>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-team" className="arabic-text">{t('tasksAppointments.team')}</Label>
                    <Select
                      value={formData.team}
                      onValueChange={(value) => setFormData({ ...formData, team: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('tasksAppointments.selectTeam')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('common.notSpecified')}</SelectItem>
                        {teams.map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="task-lead" className="arabic-text">{t('tasksAppointments.relatedLead')}</Label>
                    <Select
                      value={formData.related_lead}
                      onValueChange={(value) => setFormData({ ...formData, related_lead: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('tasksAppointments.selectLead')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('common.notSpecified')}</SelectItem>
                        {leads.map((lead: any) => (
                          <SelectItem key={lead.id} value={lead.id.toString()}>
                            {lead.first_name} {lead.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-deal" className="arabic-text">{t('tasksAppointments.relatedDeal')}</Label>
                    <Select
                      value={formData.related_deal}
                      onValueChange={(value) => setFormData({ ...formData, related_deal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('tasksAppointments.selectDeal')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('common.notSpecified')}</SelectItem>
                        {deals.map((deal: any) => (
                          <SelectItem key={deal.id} value={deal.id.toString()}>
                            {deal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-property" className="arabic-text">{t('tasksAppointments.relatedProperty')}</Label>
                    <Select
                      value={formData.related_property}
                      onValueChange={(value) => setFormData({ ...formData, related_property: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('tasksAppointments.selectProperty')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('common.notSpecified')}</SelectItem>
                        {properties.map((property: any) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(formData.type === 'meeting' || formData.type === 'visit') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-location" className="arabic-text">{t('tasksAppointments.location')}</Label>
                      <Input
                        id="task-location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder={t('tasksAppointments.locationPlaceholder')}
                        className="arabic-text"
                      />
                    </div>
                    {formData.type === 'meeting' && (
                      <div>
                        <Label htmlFor="task-link" className="arabic-text">{t('tasks.form.meetingLink')}</Label>
                        <Input
                          id="task-link"
                          value={formData.meeting_link}
                          onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                          placeholder="https://meet.google.com/..."
                          className="arabic-text"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="task-notes" className="arabic-text">{t('tasksAppointments.notes')}</Label>
                  <Textarea
                    id="task-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('tasksAppointments.additionalNotes')}
                    className="arabic-text"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingTask(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    {t('tasksAppointments.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                    className="flex-1"
                  >
                    {createTaskMutation.isPending || updateTaskMutation.isPending ? t('tasksAppointments.saving') : t('tasksAppointments.save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">{t('tasksAppointments.taskList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="arabic-text">{t('tasksAppointments.task')}</TableHead>
                  <TableHead className="arabic-text">{t('tasksAppointments.type')}</TableHead>
                  <TableHead className="arabic-text">{t('tasksAppointments.priority')}</TableHead>
                  <TableHead className="arabic-text">{t('tasksAppointments.status')}</TableHead>
                  <TableHead className="arabic-text">{t('tasksAppointments.deadline')}</TableHead>
                  <TableHead className="arabic-text">{t('tasksAppointments.assigned')}</TableHead>
                  <TableHead className="arabic-text">{t('tasksAppointments.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        {t('tasksAppointments.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('tasksAppointments.noTasks')}
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium arabic-text">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground arabic-text line-clamp-2">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTaskTypeColor(task.type)}>
                          {getTaskTypeLabel(task.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="arabic-text">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(task.due_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.assigned_to ? (
                          <div className="text-sm arabic-text">
                            {task.assigned_to.firstName && task.assigned_to.lastName
                              ? `${task.assigned_to.firstName} ${task.assigned_to.lastName}`
                              : task.assigned_to.username}
                          </div>
                        ) : (
                          <span className="text-muted-foreground arabic-text">{t('common.notSpecified')}</span>
                        )}
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
                              onClick={() => handleEditTask(task)}
                              className="arabic-text"
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              {t('tasksAppointments.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTask(task)}
                              className="arabic-text text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              {t('tasksAppointments.delete')}
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
      </div>
    </DashboardLayout>
  );
};

export default TasksAppointments;
