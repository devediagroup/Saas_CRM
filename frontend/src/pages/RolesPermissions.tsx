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
  Shield,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { Can, CanAny } from "@/components/PermissionGuard";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: any;
  level: number;
  is_active: boolean;
  is_system: boolean;
  users: any[];
  createdAt: string;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  is_active: boolean;
  is_system: boolean;
  roles: any[];
}

const RolesPermissions = () => {
  const { t } = useTranslation();
  const { can, canCRUD } = usePermissions();
  const [activeTab, setActiveTab] = useState("roles");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isCreatePermissionDialogOpen, setIsCreatePermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [roleFormData, setRoleFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    level: 5,
    is_active: true
  });

  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    resource: "",
    action: "read",
    scope: "own",
    is_active: true
  });

  const queryClient = useQueryClient();

  // Fetch roles from API
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', searchTerm, statusFilter],
    queryFn: () => apiClient.get('/roles', {
      params: {
        ...(searchTerm && { 'filters[name][$containsi]': searchTerm }),
        ...(statusFilter !== 'all' && { 'filters[is_active][$eq]': statusFilter === 'active' }),
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  // Fetch permissions from API
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions', searchTerm, statusFilter],
    queryFn: () => apiClient.get('/permissions', {
      params: {
        ...(searchTerm && { 'filters[name][$containsi]': searchTerm }),
        ...(statusFilter !== 'all' && { 'filters[is_active][$eq]': statusFilter === 'active' }),
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/roles', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(t('rolesPermissions.roles.messages.created'));
      setIsCreateRoleDialogOpen(false);
      resetRoleForm();
    },
    onError: () => {
      toast.error(t('rolesPermissions.roles.messages.createError'));
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/roles/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(t('rolesPermissions.roles.messages.updated'));
      setEditingRole(null);
      resetRoleForm();
    },
    onError: () => {
      toast.error(t('rolesPermissions.roles.messages.updateError'));
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(t('rolesPermissions.roles.messages.deleted'));
    },
    onError: () => {
      toast.error(t('rolesPermissions.roles.messages.deleteError'));
    }
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/permissions', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success(t('rolesPermissions.permissions.messages.created'));
      setIsCreatePermissionDialogOpen(false);
      resetPermissionForm();
    },
    onError: () => {
      toast.error(t('rolesPermissions.permissions.messages.createError'));
    }
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.put(`/permissions/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success(t('rolesPermissions.permissions.messages.updated'));
      setEditingPermission(null);
      resetPermissionForm();
    },
    onError: () => {
      toast.error(t('rolesPermissions.permissions.messages.updateError'));
    }
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success(t('rolesPermissions.permissions.messages.deleted'));
    },
    onError: () => {
      toast.error(t('rolesPermissions.permissions.messages.deleteError'));
    }
  });

  const resetRoleForm = () => {
    setRoleFormData({
      name: "",
      display_name: "",
      description: "",
      level: 5,
      is_active: true
    });
  };

  const resetPermissionForm = () => {
    setPermissionFormData({
      name: "",
      display_name: "",
      description: "",
      resource: "",
      action: "read",
      scope: "own",
      is_active: true
    });
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: roleFormData });
    } else {
      createRoleMutation.mutate(roleFormData);
    }
  };

  const handlePermissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPermission) {
      updatePermissionMutation.mutate({ id: editingPermission.id, data: permissionFormData });
    } else {
      createPermissionMutation.mutate(permissionFormData);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      level: role.level,
      is_active: role.is_active
    });
    setIsCreateRoleDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionFormData({
      name: permission.name,
      display_name: permission.display_name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      is_active: permission.is_active
    });
    setIsCreatePermissionDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.is_system) {
      toast.error(t('rolesPermissions.roles.messages.cannotDeleteSystem'));
      return;
    }
    if (confirm(t('rolesPermissions.roles.messages.confirmDelete'))) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const handleDeletePermission = (permission: Permission) => {
    if (permission.is_system) {
      toast.error(t('rolesPermissions.permissions.messages.cannotDeleteSystem'));
      return;
    }
    if (confirm(t('rolesPermissions.permissions.messages.confirmDelete'))) {
      deletePermissionMutation.mutate(permission.id);
    }
  };

  const roles = rolesData?.data?.data || [];
  const permissions = permissionsData?.data?.data || [];

  const getRoleLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 5: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'manage': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'own': return 'bg-cyan-100 text-cyan-800';
      case 'team': return 'bg-indigo-100 text-indigo-800';
      case 'company': return 'bg-purple-100 text-purple-800';
      case 'all': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('rolesPermissions.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('rolesPermissions.subtitle')}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('rolesPermissions.tabs.roles')}
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('rolesPermissions.tabs.permissions')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            {/* Roles Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('rolesPermissions.search.roles')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 w-64 arabic-text"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('rolesPermissions.filters.all')}</SelectItem>
                    <SelectItem value="active">{t('rolesPermissions.filters.active')}</SelectItem>
                    <SelectItem value="inactive">{t('rolesPermissions.filters.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Can permission="users.create">
                <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t('rolesPermissions.roles.addNew')}
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="arabic-text">
                      {editingRole ? t('rolesPermissions.roles.editRole') : t('rolesPermissions.roles.newRole')}
                    </DialogTitle>
                    <DialogDescription className="arabic-text">
                      {editingRole ? t('rolesPermissions.roles.editRoleDesc') : t('rolesPermissions.roles.addRoleDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="role-name" className="arabic-text">{t('rolesPermissions.roles.form.roleName')}</Label>
                      <Input
                        id="role-name"
                        value={roleFormData.name}
                        onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                        placeholder={t('rolesPermissions.roles.form.placeholder.roleName')}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-display-name" className="arabic-text">{t('rolesPermissions.roles.form.displayName')}</Label>
                      <Input
                        id="role-display-name"
                        value={roleFormData.display_name}
                        onChange={(e) => setRoleFormData({ ...roleFormData, display_name: e.target.value })}
                        placeholder={t('rolesPermissions.roles.form.placeholder.displayName')}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-description" className="arabic-text">{t('rolesPermissions.roles.form.description')}</Label>
                      <Textarea
                        id="role-description"
                        value={roleFormData.description}
                        onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                        placeholder={t('rolesPermissions.roles.form.placeholder.description')}
                        className="arabic-text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-level" className="arabic-text">{t('rolesPermissions.roles.form.roleLevel')}</Label>
                      <Select
                        value={roleFormData.level.toString()}
                        onValueChange={(value) => setRoleFormData({ ...roleFormData, level: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('rolesPermissions.roles.levels.1')}</SelectItem>
                          <SelectItem value="2">{t('rolesPermissions.roles.levels.2')}</SelectItem>
                          <SelectItem value="3">{t('rolesPermissions.roles.levels.3')}</SelectItem>
                          <SelectItem value="4">{t('rolesPermissions.roles.levels.4')}</SelectItem>
                          <SelectItem value="5">{t('rolesPermissions.roles.levels.5')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="role-active"
                        checked={roleFormData.is_active}
                        onCheckedChange={(checked) => setRoleFormData({ ...roleFormData, is_active: checked })}
                      />
                      <Label htmlFor="role-active" className="arabic-text">{t('rolesPermissions.roles.form.active')}</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateRoleDialogOpen(false);
                          setEditingRole(null);
                          resetRoleForm();
                        }}
                        className="flex-1"
                      >
                        {t('rolesPermissions.roles.form.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                        className="flex-1"
                      >
                        {createRoleMutation.isPending || updateRoleMutation.isPending ? t('rolesPermissions.roles.form.saving') : t('rolesPermissions.roles.form.save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
                </Dialog>
              </Can>
            </div>

            {/* Roles Table */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">{t('rolesPermissions.roles.table.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">{t('rolesPermissions.roles.table.roleName')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.roles.table.displayName')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.roles.table.level')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.roles.table.status')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.roles.table.users')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.roles.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {t('rolesPermissions.roles.table.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t('rolesPermissions.roles.table.noRoles')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((role: Role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell className="arabic-text">{role.display_name}</TableCell>
                          <TableCell>
                            <Badge className={getRoleLevelColor(role.level)}>
                              {t('rolesPermissions.roles.table.level')} {role.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {role.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 ml-1" />
                                {t('rolesPermissions.roles.status.active')}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 ml-1" />
                                {t('rolesPermissions.roles.status.inactive')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{role.users?.length || 0}</span>
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
                                <Can permission="users.update">
                                  <DropdownMenuItem
                                    onClick={() => handleEditRole(role)}
                                    className="arabic-text"
                                  >
                                    <Edit className="h-4 w-4 ml-2" />
                                    {t('rolesPermissions.actions.edit')}
                                  </DropdownMenuItem>
                                </Can>
                                {!role.is_system && (
                                  <Can permission="users.delete">
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteRole(role)}
                                      className="arabic-text text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 ml-2" />
                                      {t('rolesPermissions.actions.delete')}
                                    </DropdownMenuItem>
                                  </Can>
                                )}
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

          <TabsContent value="permissions" className="space-y-6">
            {/* Permissions Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('rolesPermissions.search.permissions')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 w-64 arabic-text"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('rolesPermissions.filters.all')}</SelectItem>
                    <SelectItem value="active">{t('rolesPermissions.filters.active')}</SelectItem>
                    <SelectItem value="inactive">{t('rolesPermissions.filters.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Can permission="settings.update">
                <Dialog open={isCreatePermissionDialogOpen} onOpenChange={setIsCreatePermissionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t('rolesPermissions.permissions.addNew')}
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="arabic-text">
                      {editingPermission ? t('rolesPermissions.permissions.editPermission') : t('rolesPermissions.permissions.newPermission')}
                    </DialogTitle>
                    <DialogDescription className="arabic-text">
                      {editingPermission ? t('rolesPermissions.permissions.editPermissionDesc') : t('rolesPermissions.permissions.addPermissionDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePermissionSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="permission-name" className="arabic-text">{t('rolesPermissions.permissions.form.permissionName')}</Label>
                      <Input
                        id="permission-name"
                        value={permissionFormData.name}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
                        placeholder={t('rolesPermissions.permissions.form.placeholder.permissionName')}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="permission-display-name" className="arabic-text">{t('rolesPermissions.permissions.form.displayName')}</Label>
                      <Input
                        id="permission-display-name"
                        value={permissionFormData.display_name}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, display_name: e.target.value })}
                        placeholder={t('rolesPermissions.permissions.form.placeholder.displayName')}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="permission-resource" className="arabic-text">{t('rolesPermissions.permissions.form.resource')}</Label>
                      <Input
                        id="permission-resource"
                        value={permissionFormData.resource}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, resource: e.target.value })}
                        placeholder={t('rolesPermissions.permissions.form.placeholder.resource')}
                        className="arabic-text"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="permission-action" className="arabic-text">{t('rolesPermissions.permissions.form.action')}</Label>
                      <Select
                        value={permissionFormData.action}
                        onValueChange={(value) => setPermissionFormData({ ...permissionFormData, action: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="create">{t('rolesPermissions.permissions.actions.create')}</SelectItem>
                          <SelectItem value="read">{t('rolesPermissions.permissions.actions.read')}</SelectItem>
                          <SelectItem value="update">{t('rolesPermissions.permissions.actions.update')}</SelectItem>
                          <SelectItem value="delete">{t('rolesPermissions.permissions.actions.delete')}</SelectItem>
                          <SelectItem value="list">{t('rolesPermissions.permissions.actions.list')}</SelectItem>
                          <SelectItem value="export">{t('rolesPermissions.permissions.actions.export')}</SelectItem>
                          <SelectItem value="import">{t('rolesPermissions.permissions.actions.import')}</SelectItem>
                          <SelectItem value="approve">{t('rolesPermissions.permissions.actions.approve')}</SelectItem>
                          <SelectItem value="reject">{t('rolesPermissions.permissions.actions.reject')}</SelectItem>
                          <SelectItem value="assign">{t('rolesPermissions.permissions.actions.assign')}</SelectItem>
                          <SelectItem value="manage">{t('rolesPermissions.permissions.actions.manage')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="permission-scope" className="arabic-text">{t('rolesPermissions.permissions.form.scope')}</Label>
                      <Select
                        value={permissionFormData.scope}
                        onValueChange={(value) => setPermissionFormData({ ...permissionFormData, scope: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">{t('rolesPermissions.permissions.scopes.own')}</SelectItem>
                          <SelectItem value="team">{t('rolesPermissions.permissions.scopes.team')}</SelectItem>
                          <SelectItem value="company">{t('rolesPermissions.permissions.scopes.company')}</SelectItem>
                          <SelectItem value="all">{t('rolesPermissions.permissions.scopes.all')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="permission-description" className="arabic-text">{t('rolesPermissions.permissions.form.description')}</Label>
                      <Textarea
                        id="permission-description"
                        value={permissionFormData.description}
                        onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
                        placeholder={t('rolesPermissions.permissions.form.placeholder.description')}
                        className="arabic-text"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="permission-active"
                        checked={permissionFormData.is_active}
                        onCheckedChange={(checked) => setPermissionFormData({ ...permissionFormData, is_active: checked })}
                      />
                      <Label htmlFor="permission-active" className="arabic-text">{t('rolesPermissions.permissions.form.active')}</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreatePermissionDialogOpen(false);
                          setEditingPermission(null);
                          resetPermissionForm();
                        }}
                        className="flex-1"
                      >
                        {t('rolesPermissions.permissions.form.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPermissionMutation.isPending || updatePermissionMutation.isPending}
                        className="flex-1"
                      >
                        {createPermissionMutation.isPending || updatePermissionMutation.isPending ? t('rolesPermissions.permissions.form.saving') : t('rolesPermissions.permissions.form.save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
                </Dialog>
              </Can>
            </div>

            {/* Permissions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">{t('rolesPermissions.permissions.table.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">{t('rolesPermissions.permissions.table.name')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.permissions.table.resource')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.permissions.table.action')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.permissions.table.scope')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.permissions.table.status')}</TableHead>
                      <TableHead className="arabic-text">{t('rolesPermissions.permissions.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {t('rolesPermissions.permissions.table.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : permissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t('rolesPermissions.permissions.table.noPermissions')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      permissions.map((permission: Permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-muted-foreground arabic-text">
                                {permission.display_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{permission.resource}</TableCell>
                          <TableCell>
                            <Badge className={getActionColor(permission.action)}>
                              {permission.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getScopeColor(permission.scope)}>
                              {permission.scope}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {permission.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 ml-1" />
                                {t('rolesPermissions.permissions.status.active')}
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 ml-1" />
                                {t('rolesPermissions.permissions.status.inactive')}
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
                                <Can permission="settings.update">
                                  <DropdownMenuItem
                                    onClick={() => handleEditPermission(permission)}
                                    className="arabic-text"
                                  >
                                    <Edit className="h-4 w-4 ml-2" />
                                    {t('rolesPermissions.actions.edit')}
                                  </DropdownMenuItem>
                                </Can>
                                {!permission.is_system && (
                                  <Can permission="settings.update">
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePermission(permission)}
                                      className="arabic-text text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 ml-2" />
                                      {t('rolesPermissions.actions.delete')}
                                    </DropdownMenuItem>
                                  </Can>
                                )}
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

export default RolesPermissions;
