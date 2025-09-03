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
  Calendar,
  MapPin,
  Users,
  Target,
  TrendingUp,
  DollarSign
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

interface Project {
  id: string;
  name: string;
  description: string;
  developer_id: string;
  developer?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  location: string;
  address: string;
  project_type: 'residential' | 'commercial' | 'mixed' | 'industrial';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  start_date: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  total_units: number;
  sold_units: number;
  available_units: number;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  amenities: string[];
  features: string[];
  images: string[];
  documents: string[];
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const Projects = () => {
  const { t } = useTranslation();
  const { can, canCRUD } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [developerFilter, setDeveloperFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    developer_id: "",
    location: "",
    address: "",
    project_type: "residential" as 'residential' | 'commercial' | 'mixed' | 'industrial',
    status: "planning" as 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled',
    start_date: "",
    expected_completion_date: "",
    total_units: 0,
    price_range: {
      min: 0,
      max: 0,
      currency: "USD"
    },
    amenities: [] as string[],
    features: [] as string[]
  });

  const queryClient = useQueryClient();

  // Fetch projects from API
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', searchTerm, typeFilter, statusFilter, developerFilter],
    queryFn: () => api.getProjects({
      ...(searchTerm && { name_contains: searchTerm }),
      ...(typeFilter !== 'all' && { project_type: typeFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(developerFilter !== 'all' && { developer_id: developerFilter })
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch developers for dropdown
  const { data: developersData } = useQuery({
    queryKey: ['developers'],
    queryFn: () => api.getDevelopers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        developer_id: "",
        location: "",
        address: "",
        project_type: "residential" as 'residential' | 'commercial' | 'mixed' | 'industrial',
        status: "planning" as 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled',
        start_date: "",
        expected_completion_date: "",
        total_units: 0,
        price_range: { min: 0, max: 0, currency: "USD" },
        amenities: [],
        features: []
      });
      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create project");
      console.error("Create project error:", error);
    }
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      api.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
      toast.success("Project updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update project");
      console.error("Update project error:", error);
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      console.error("Delete project error:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createProjectMutation.mutate(formData);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      developer_id: project.developer_id,
      location: project.location,
      address: project.address,
      project_type: project.project_type,
      status: project.status,
      start_date: project.start_date,
      expected_completion_date: project.expected_completion_date,
      total_units: project.total_units,
      price_range: project.price_range,
      amenities: project.amenities || [],
      features: project.features || []
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const projects = projectsData?.data || [];
  const developers = developersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const getProgressPercentage = (project: Project) => {
    if (project.status === 'completed') return 100;
    if (project.status === 'planning') return 0;
    if (project.status === 'cancelled') return 0;
    
    // Calculate based on sold units vs total units
    if (project.total_units > 0) {
      return Math.round((project.sold_units / project.total_units) * 100);
    }
    return 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage real estate projects and their development progress
            </p>
          </div>
          <Can permission="projects.create">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </Can>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
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
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={developerFilter} onValueChange={setDeveloperFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Developers</SelectItem>
                  {developers.map((developer: any) => (
                    <SelectItem key={developer.id} value={developer.id}>
                      {developer.name}
                    </SelectItem>
                  ))}
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

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {project.images && project.images.length > 0 ? (
                        <img
                          src={project.images[0]}
                          alt={project.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getTypeColor(project.project_type)}>
                            {project.project_type}
                          </Badge>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
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
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(project.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  
                  {/* Developer Info */}
                  {project.developer && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{project.developer.name}</span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressPercentage(project)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(project)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Units Info */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{project.total_units}</div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{project.sold_units}</div>
                      <div className="text-muted-foreground">Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{project.available_units}</div>
                      <div className="text-muted-foreground">Available</div>
                    </div>
                  </div>

                  {/* Price Range */}
                  {project.price_range && (
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {project.price_range.min.toLocaleString()} - {project.price_range.max.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(project.start_date).getFullYear()} - {new Date(project.expected_completion_date).getFullYear()}
                    </span>
                  </div>
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
                      <th className="text-left p-4 font-medium">Project</th>
                      <th className="text-left p-4 font-medium">Developer</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Progress</th>
                      <th className="text-left p-4 font-medium">Units</th>
                      <th className="text-left p-4 font-medium">Location</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project: Project) => (
                      <tr key={project.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {project.images && project.images.length > 0 ? (
                              <img
                                src={project.images[0]}
                                alt={project.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {project.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {project.developer ? (
                            <div className="flex items-center space-x-2">
                              {project.developer.logo_url && (
                                <img
                                  src={project.developer.logo_url}
                                  alt={project.developer.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <span className="text-sm">{project.developer.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getTypeColor(project.project_type)}>
                            {project.project_type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{getProgressPercentage(project)}%</div>
                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${getProgressPercentage(project)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{project.sold_units}/{project.total_units} sold</div>
                            <div className="text-muted-foreground">{project.available_units} available</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>{project.location}</div>
                            <div className="text-muted-foreground">{project.address}</div>
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
                              <Can permission="projects.update">
                                <DropdownMenuItem onClick={() => handleEdit(project)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Can>
                              <Can permission="projects.delete">
                                <DropdownMenuItem onClick={() => handleDelete(project.id)}>
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
        <Dialog open={isCreateDialogOpen || !!editingProject} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingProject(null);
            setFormData({
              name: "",
              description: "",
              developer_id: "",
              location: "",
              address: "",
              project_type: "residential" as 'residential' | 'commercial' | 'mixed' | 'industrial',
              status: "planning" as 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled',
              start_date: "",
              expected_completion_date: "",
              total_units: 0,
              price_range: { min: 0, max: 0, currency: "USD" },
              amenities: [],
              features: []
            });
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject 
                  ? "Update project information" 
                  : "Create a new project profile"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="developer">Developer *</Label>
                  <Select value={formData.developer_id} onValueChange={(value) => setFormData({ ...formData, developer_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Developer" />
                    </SelectTrigger>
                    <SelectContent>
                      {developers.map((developer: any) => (
                        <SelectItem key={developer.id} value={developer.id}>
                          {developer.name}
                        </SelectItem>
                      ))}
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Project Type *</Label>
                  <Select value={formData.project_type} onValueChange={(value: any) => setFormData({ ...formData, project_type: value })}>
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_units">Total Units</Label>
                  <Input
                    id="total_units"
                    type="number"
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_completion">Expected Completion</Label>
                  <Input
                    id="expected_completion"
                    type="date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_min">Min Price</Label>
                  <Input
                    id="price_min"
                    type="number"
                    value={formData.price_range.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      price_range: { ...formData.price_range, min: parseFloat(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_max">Max Price</Label>
                  <Input
                    id="price_max"
                    type="number"
                    value={formData.price_range.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      price_range: { ...formData.price_range, max: parseFloat(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.price_range.currency} onValueChange={(value) => setFormData({
                    ...formData,
                    price_range: { ...formData.price_range, currency: value }
                  })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
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
                    setEditingProject(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProjectMutation.isPending || updateProjectMutation.isPending}>
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
