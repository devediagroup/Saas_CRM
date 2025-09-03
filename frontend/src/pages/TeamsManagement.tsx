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
  Users,
  UserPlus,
  Crown,
  Settings,
  Mail,
  Phone
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Team {
  id: number;
  name: string;
  description: string;
  type: 'sales' | 'marketing' | 'support' | 'management' | 'development' | 'operations';
  is_active: boolean;
  leader: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  members: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }[];
  permissions: any;
  createdAt: string;
}

const TeamsManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "sales",
    is_active: true,
    leader_id: "",
    member_ids: [] as string[]
  });

  const queryClient = useQueryClient();

  // Fetch teams from API
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams', searchTerm, typeFilter, statusFilter],
    queryFn: () => apiClient.get('/teams', {
      params: {
        ...(searchTerm && { 'filters[name][$containsi]': searchTerm }),
        ...(typeFilter !== 'all' && { 'filters[type][$eq]': typeFilter }),
        ...(statusFilter !== 'all' && { 'filters[is_active][$eq]': statusFilter === 'active' }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'leader',
        'populate[1]': 'members'
      }
    })
  });

  // Fetch users for leader and members selection
  const { data: usersData } = useQuery({
    queryKey: ['users-for-teams'],
    queryFn: () => apiClient.get('/users')
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/teams', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(t('teams.messages.teamCreated'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('teams.messages.createError'));
    }
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/teams/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(t('teams.messages.teamUpdated'));
      setEditingTeam(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('teams.messages.updateError'));
    }
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(t('teams.messages.teamDeleted'));
    },
    onError: () => {
      toast.error(t('teams.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "sales",
      is_active: true,
      leader_id: "",
      member_ids: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const teamData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      is_active: formData.is_active,
      ...(formData.leader_id && { leader: formData.leader_id }),
      ...(formData.member_ids.length > 0 && { members: formData.member_ids })
    };

    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data: teamData });
    } else {
      createTeamMutation.mutate(teamData);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      type: team.type,
      is_active: team.is_active,
      leader_id: team.leader?.id.toString() || "",
      member_ids: team.members?.map(m => m.id.toString()) || []
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTeam = (team: Team) => {
    if (confirm(t('teams.messages.confirmDelete'))) {
      deleteTeamMutation.mutate(team.id);
    }
  };

  const teams = teamsData?.data?.data || [];
  const users = usersData?.data || [];

  const getTeamTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-purple-100 text-purple-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'management': return 'bg-red-100 text-red-800';
      case 'development': return 'bg-orange-100 text-orange-800';
      case 'operations': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamTypeLabel = (type: string) => {
    switch (type) {
      case 'sales': return t('teams.types.sales');
      case 'marketing': return t('teams.types.marketing');
      case 'support': return t('teams.types.support');
      case 'management': return t('teams.types.management');
      case 'development': return t('teams.types.development');
      case 'operations': return t('teams.types.operations');
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('teams.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('teams.subtitle')}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('teams.searchTeams')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 w-64 arabic-text"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('teams.teamType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('teams.allTypes')}</SelectItem>
                <SelectItem value="sales">{t('teams.types.sales')}</SelectItem>
                <SelectItem value="marketing">{t('teams.types.marketing')}</SelectItem>
                <SelectItem value="support">{t('teams.types.support')}</SelectItem>
                <SelectItem value="management">{t('teams.types.management')}</SelectItem>
                <SelectItem value="development">{t('teams.types.development')}</SelectItem>
                <SelectItem value="operations">{t('teams.types.operations')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('teams.all')}</SelectItem>
                <SelectItem value="active">{t('teams.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('teams.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('teams.addNewTeam')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="arabic-text">
                  {editingTeam ? t('teams.editTeam') : t('teams.addNewTeam')}
                </DialogTitle>
                <DialogDescription className="arabic-text">
                  {t('teams.enterTeamData')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="team-name" className="arabic-text">{t('teams.teamName')}</Label>
                    <Input
                      id="team-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('teams.teamNameExample')}
                      className="arabic-text"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-type" className="arabic-text">{t('teams.teamType')}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">{t('teams.types.sales')}</SelectItem>
                        <SelectItem value="marketing">{t('teams.types.marketing')}</SelectItem>
                        <SelectItem value="support">{t('teams.types.support')}</SelectItem>
                        <SelectItem value="management">{t('teams.types.management')}</SelectItem>
                        <SelectItem value="development">{t('teams.types.development')}</SelectItem>
                        <SelectItem value="operations">{t('teams.types.operations')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="team-description" className="arabic-text">{t('teams.description')}</Label>
                  <Textarea
                    id="team-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('teams.teamDescriptionPlaceholder')}
                    className="arabic-text"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="team-leader" className="arabic-text">{t('teams.teamLeader')}</Label>
                  <Select
                    value={formData.leader_id}
                    onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('teams.selectTeamLeader')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('teams.noLeader')}</SelectItem>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="arabic-text">{t('teams.teamMembers')}</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={`member-${user.id}`}
                          checked={formData.member_ids.includes(user.id.toString())}
                          onChange={(e) => {
                            const memberId = user.id.toString();
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                member_ids: [...formData.member_ids, memberId]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                member_ids: formData.member_ids.filter(id => id !== memberId)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor={`member-${user.id}`}
                          className="text-sm arabic-text cursor-pointer flex-1"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {user.firstName && user.lastName
                                  ? `${user.firstName[0]}${user.lastName[0]}`
                                  : user.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                            </span>
                            <span className="text-muted-foreground">({user.email})</span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="team-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="team-active" className="arabic-text">{t('teams.active')}</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingTeam(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTeamMutation.isPending || updateTeamMutation.isPending}
                    className="flex-1"
                  >
                    {createTeamMutation.isPending || updateTeamMutation.isPending ? t('teams.saving') : t('teams.save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teams Table */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">{t('teams.teamsList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="arabic-text">{t('teams.teamName')}</TableHead>
                  <TableHead className="arabic-text">{t('teams.teamType')}</TableHead>
                  <TableHead className="arabic-text">{t('teams.teamLeader')}</TableHead>
                  <TableHead className="arabic-text">{t('teams.teamMembers')}</TableHead>
                  <TableHead className="arabic-text">{t('teams.status')}</TableHead>
                  <TableHead className="arabic-text">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        {t('teams.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('teams.noTeams')}
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team: Team) => (
                    <TableRow key={team.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium arabic-text">{team.name}</div>
                          {team.description && (
                            <div className="text-sm text-muted-foreground arabic-text line-clamp-2">
                              {team.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTeamTypeColor(team.type)}>
                          {getTeamTypeLabel(team.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {team.leader ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {team.leader.firstName && team.leader.lastName
                                  ? `${team.leader.firstName[0]}${team.leader.lastName[0]}`
                                  : team.leader.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm arabic-text">
                              {team.leader.firstName && team.leader.lastName
                                ? `${team.leader.firstName} ${team.leader.lastName}`
                                : team.leader.username}
                            </div>
                            <Crown className="h-3 w-3 text-yellow-500" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground arabic-text">{t('teams.noLeader')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{team.members?.length || 0} {t('teams.member')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            {t('teams.status.active')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            {t('teams.status.inactive')}
                          </Badge>
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
                              onClick={() => handleEditTeam(team)}
                              className="arabic-text"
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              {t('teams.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTeam(team)}
                              className="arabic-text text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              {t('teams.delete')}
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

export default TeamsManagement;
