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
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Developer {
  id: string;
  name: string;
  description: string;
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  logo_url?: string;
  website_url?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  business_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  specializations: string[];
  certifications: string[];
  awards: string[];
  years_experience: number;
  completed_projects: number;
  total_investment: number;
  status: 'active' | 'inactive' | 'suspended';
  type: 'residential' | 'commercial' | 'mixed' | 'industrial';
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const Developers = () => {
  const { t } = useTranslation();
  const { can, canCRUD } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "residential" as 'residential' | 'commercial' | 'mixed' | 'industrial',
    contact_info: {
      email: "",
      phone: "",
      website: "",
      address: ""
    },
    logo_url: "",
    website_url: "",
    specializations: [] as string[],
    years_experience: 0,
    status: "active" as 'active' | 'inactive' | 'suspended'
  });

  const queryClient = useQueryClient();

  // Fetch developers from API
  const { data: developersData, isLoading } = useQuery({
    queryKey: ['developers', searchTerm, typeFilter, statusFilter],
    queryFn: () => api.getDevelopers({
      ...(searchTerm && { name_contains: searchTerm }),
      ...(typeFilter !== 'all' && { type: typeFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter })
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create developer mutation
  const createDeveloperMutation = useMutation({
    mutationFn: (data: Partial<Developer>) => api.createDeveloper(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "residential" as 'residential' | 'commercial' | 'mixed' | 'industrial',
        contact_info: { email: "", phone: "", website: "", address: "" },
        logo_url: "",
        website_url: "",
        specializations: [],
        years_experience: 0,
        status: "active" as 'active' | 'inactive' | 'suspended'
      });
      toast.success("Developer created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create developer");
      console.error("Create developer error:", error);
    }
  });

  // Update developer mutation
  const updateDeveloperMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Developer> }) => 
      api.updateDeveloper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setEditingDeveloper(null);
      toast.success("Developer updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update developer");
      console.error("Update developer error:", error);
    }
  });

  // Delete developer mutation
  const deleteDeveloperMutation = useMutation({
    mutationFn: (id: string) => api.deleteDeveloper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      toast.success("Developer deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete developer");
      console.error("Delete developer error:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeveloper) {
      updateDeveloperMutation.mutate({ id: editingDeveloper.id, data: formData });
    } else {
      createDeveloperMutation.mutate(formData);
    }
  };

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper(developer);
    setFormData({
      name: developer.name,
      description: developer.description,
      type: developer.type,
      contact_info: {
        email: developer.contact_info?.email || "",
        phone: developer.contact_info?.phone || "",
        website: developer.contact_info?.website || "",
        address: developer.contact_info?.address || ""
      },
      logo_url: developer.logo_url || "",
      website_url: developer.website_url || "",
      specializations: developer.specializations || [],
      years_experience: developer.years_experience || 0,
      status: developer.status
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this developer?")) {
      deleteDeveloperMutation.mutate(id);
    }
  };

  const developers = developersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'residential': return 'bg-blue-100 text-blue-800';
      case 'commercial': return 'bg-purple-100 text-purple-800';
      case 'mixed': return 'bg-orange-100 text-orange-800';
      case 'industrial': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
            <p className="text-muted-foreground">
              Manage real estate developers and their information
            </p>
          </div>
          <Can permission="developers.create">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Developer
            </Button>
          </Can>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search developers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developers Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading developers...</p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((developer: Developer) => (
              <Card key={developer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {developer.logo_url ? (
                        <img
                          src={developer.logo_url}
                          alt={developer.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{developer.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getTypeColor(developer.type)}>
                            {developer.type}
                          </Badge>
                          <Badge className={getStatusColor(developer.status)}>
                            {developer.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(developer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(developer.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {developer.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{developer.years_experience} years</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{developer.completed_projects} projects</span>
                    </div>
                  </div>

                  {developer.contact_info?.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{developer.contact_info.email}</span>
                    </div>
                  )}

                  {developer.website_url && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={developer.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {developer.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {developer.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {developer.specializations.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{developer.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Developer</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Experience</th>
                      <th className="text-left p-4 font-medium">Projects</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {developers.map((developer: Developer) => (
                      <tr key={developer.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {developer.logo_url ? (
                              <img
                                src={developer.logo_url}
                                alt={developer.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{developer.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {developer.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getTypeColor(developer.type)}>
                            {developer.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(developer.status)}>
                            {developer.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{developer.years_experience} years</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{developer.completed_projects}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {developer.contact_info?.email && (
                              <div className="text-sm">{developer.contact_info.email}</div>
                            )}
                            {developer.contact_info?.phone && (
                              <div className="text-sm text-muted-foreground">
                                {developer.contact_info.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Can permission="developers.update">
                                <DropdownMenuItem onClick={() => handleEdit(developer)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Can>
                              <Can permission="developers.delete">
                                <DropdownMenuItem onClick={() => handleDelete(developer.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </Can>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingDeveloper} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingDeveloper(null);
            setFormData({
              name: "",
              description: "",
              type: "residential",
              contact_info: { email: "", phone: "", website: "", address: "" },
              logo_url: "",
              website_url: "",
              specializations: [],
              years_experience: 0,
              status: "active"
            });
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDeveloper ? "Edit Developer" : "Add New Developer"}
              </DialogTitle>
              <DialogDescription>
                {editingDeveloper 
                  ? "Update developer information" 
                  : "Create a new developer profile"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, email: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contact_info.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact_info: { ...formData.contact_info, phone: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingDeveloper(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createDeveloperMutation.isPending || updateDeveloperMutation.isPending}>
                  {editingDeveloper ? "Update Developer" : "Create Developer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Developers;
