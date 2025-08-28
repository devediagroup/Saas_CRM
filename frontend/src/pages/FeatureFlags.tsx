import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { 
  Flag, 
  Settings, 
  Eye, 
  EyeOff, 
  Users, 
  Building,
  Zap,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  BarChart3,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Globe
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface FeatureFlag {
  id: number;
  name: string;
  key: string;
  description: string;
  is_enabled: boolean;
  target_type: 'all' | 'company' | 'user' | 'percentage';
  target_value?: string;
  rollout_percentage?: number;
  environment: 'development' | 'staging' | 'production';
  category: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeatureFlags() {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [environmentFilter, setEnvironmentFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    is_enabled: false,
    target_type: 'all',
    target_value: '',
    rollout_percentage: '',
    environment: 'development',
    category: '',
    tags: '',
    start_date: '',
    end_date: '',
    created_by: ''
  });

  const queryClient = useQueryClient();

  // Fetch feature flags
  const { data: featureFlags = [], isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => apiClient.get('/feature-flags').then(res => res.data.data || [])
  });

  // Create feature flag mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/feature-flags', { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success(t('featureFlags.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('featureFlags.messages.createError'));
    }
  });

  // Update feature flag mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.put(`/feature-flags/${id}`, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success(t('featureFlags.messages.updated'));
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('featureFlags.messages.updateError'));
    }
  });

  // Toggle feature flag mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_enabled }: { id: number; is_enabled: boolean }) => 
      apiClient.put(`/feature-flags/${id}`, { data: { is_enabled } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success(t('featureFlags.messages.statusUpdated'));
    },
    onError: () => {
      toast.error(t('featureFlags.messages.statusUpdateError'));
    }
  });

  // Delete feature flag mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/feature-flags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success(t('featureFlags.messages.deleted'));
    },
    onError: () => {
      toast.error(t('featureFlags.messages.deleteError'));
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      description: '',
      is_enabled: false,
      target_type: 'all',
      target_value: '',
      rollout_percentage: '',
      environment: 'development',
      category: '',
      tags: '',
      start_date: '',
      end_date: '',
      created_by: ''
    });
    setSelectedFeature(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      rollout_percentage: formData.rollout_percentage ? parseInt(formData.rollout_percentage) : null,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    if (selectedFeature) {
      updateMutation.mutate({ id: selectedFeature.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (feature: FeatureFlag) => {
    setSelectedFeature(feature);
    setFormData({
      name: feature.name || '',
      key: feature.key || '',
      description: feature.description || '',
      is_enabled: feature.is_enabled || false,
      target_type: feature.target_type || 'all',
      target_value: feature.target_value || '',
      rollout_percentage: feature.rollout_percentage?.toString() || '',
      environment: feature.environment || 'development',
      category: feature.category || '',
      tags: feature.tags?.join(', ') || '',
      start_date: feature.start_date?.split('T')[0] || '',
      end_date: feature.end_date?.split('T')[0] || '',
      created_by: feature.created_by || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleToggle = (feature: FeatureFlag) => {
    toggleMutation.mutate({ 
      id: feature.id, 
      is_enabled: !feature.is_enabled 
    });
  };

  const getStatusBadge = (isEnabled: boolean) => {
    return isEnabled ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        {t('featureFlags.status.enabled')}
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        {t('featureFlags.status.disabled')}
      </Badge>
    );
  };

  const getEnvironmentBadge = (environment: string) => {
    const envConfig = {
      development: { label: t('featureFlags.environments.development'), color: 'bg-blue-100 text-blue-800' },
      staging: { label: t('featureFlags.environments.staging'), color: 'bg-yellow-100 text-yellow-800' },
      production: { label: t('featureFlags.environments.production'), color: 'bg-green-100 text-green-800' }
    };
    const config = envConfig[environment as keyof typeof envConfig] || envConfig.development;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'ui':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'api':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'messaging':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4 text-orange-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case 'all':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'company':
        return <Building className="h-4 w-4 text-purple-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'percentage':
        return <Target className="h-4 w-4 text-orange-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    const labels = {
      all: t('featureFlags.targetTypes.all'),
      company: t('featureFlags.targetTypes.company'),
      user: t('featureFlags.targetTypes.user'),
      percentage: t('featureFlags.targetTypes.percentage')
    };
    return labels[targetType as keyof typeof labels] || targetType;
  };

  // Filter feature flags
  const filteredFeatures = featureFlags.filter((feature: FeatureFlag) => {
    const matchesSearch = 
      feature.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || feature.category === categoryFilter;
    const matchesEnvironment = environmentFilter === 'all' || feature.environment === environmentFilter;
    
    return matchesSearch && matchesCategory && matchesEnvironment;
  });

  // Calculate statistics
  const totalFeatures = featureFlags.length;
  const enabledFeatures = featureFlags.filter((f: FeatureFlag) => f.is_enabled).length;
  const disabledFeatures = totalFeatures - enabledFeatures;
  const productionFeatures = featureFlags.filter((f: FeatureFlag) => f.environment === 'production').length;

  // Get unique categories
  const categories = Array.from(new Set(featureFlags.map((f: FeatureFlag) => f.category).filter(Boolean)));

  if (isLoadingFeatures) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('featureFlags.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('featureFlags.title')}</h1>
            <p className="text-gray-600 mt-1">{t('featureFlags.subtitle')}</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="ml-2 h-4 w-4" />
                {t('featureFlags.addNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('featureFlags.createNew')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('featureFlags.form.featureName')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('featureFlags.placeholders.featureName')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">{t('featureFlags.form.featureKey')}</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({...formData, key: e.target.value})}
                      placeholder={t('featureFlags.placeholders.featureKey')}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">{t('featureFlags.form.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t('featureFlags.placeholders.description')}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">{t('featureFlags.form.category')}</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder={t('featureFlags.placeholders.category')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">{t('featureFlags.form.environment')}</Label>
                    <Select value={formData.environment} onValueChange={(value) => setFormData({...formData, environment: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">{t('featureFlags.environments.development')}</SelectItem>
                        <SelectItem value="staging">{t('featureFlags.environments.staging')}</SelectItem>
                        <SelectItem value="production">{t('featureFlags.environments.production')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_type">{t('featureFlags.form.targetType')}</Label>
                    <Select value={formData.target_type} onValueChange={(value) => setFormData({...formData, target_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('featureFlags.targetTypes.all')}</SelectItem>
                        <SelectItem value="company">{t('featureFlags.targetTypes.company')}</SelectItem>
                        <SelectItem value="user">{t('featureFlags.targetTypes.user')}</SelectItem>
                        <SelectItem value="percentage">{t('featureFlags.targetTypes.percentage')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target_value">{t('featureFlags.form.targetValue')}</Label>
                    <Input
                      id="target_value"
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                      placeholder={t('featureFlags.placeholders.targetValue')}
                    />
                  </div>
                </div>
                {formData.target_type === 'percentage' && (
                                  <div>
                  <Label htmlFor="rollout_percentage">{t('featureFlags.form.rolloutPercentage')}</Label>
                  <Input
                    id="rollout_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rollout_percentage}
                    onChange={(e) => setFormData({...formData, rollout_percentage: e.target.value})}
                    placeholder={t('featureFlags.placeholders.rolloutPercentage')}
                  />
                </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">{t('featureFlags.form.startDate')}</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">{t('featureFlags.form.endDate')}</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">{t('featureFlags.form.tags')}</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder={t('featureFlags.placeholders.tags')}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_enabled"
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({...formData, is_enabled: checked})}
                  />
                  <Label htmlFor="is_enabled">{t('featureFlags.form.enableFeature')}</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('featureFlags.form.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('featureFlags.form.saving') : t('featureFlags.form.save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('featureFlags.stats.totalFeatures')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalFeatures}</p>
                </div>
                <Flag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('featureFlags.stats.enabled')}</p>
                  <p className="text-3xl font-bold text-green-600">{enabledFeatures}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('featureFlags.stats.disabled')}</p>
                  <p className="text-3xl font-bold text-gray-600">{disabledFeatures}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('featureFlags.stats.inProduction')}</p>
                  <p className="text-3xl font-bold text-purple-600">{productionFeatures}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('featureFlags.filters.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="ml-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('featureFlags.filters.allCategories')}</SelectItem>
                    {categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('featureFlags.filters.allEnvironments')}</SelectItem>
                    <SelectItem value="development">{t('featureFlags.environments.development')}</SelectItem>
                    <SelectItem value="staging">{t('featureFlags.environments.staging')}</SelectItem>
                    <SelectItem value="production">{t('featureFlags.environments.production')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="ml-2 h-5 w-5" />
              {t('featureFlags.table.availableFeatures')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('featureFlags.table.feature')}</TableHead>
                  <TableHead>{t('featureFlags.table.key')}</TableHead>
                  <TableHead>{t('featureFlags.table.category')}</TableHead>
                  <TableHead>{t('featureFlags.table.environment')}</TableHead>
                  <TableHead>{t('featureFlags.table.targeting')}</TableHead>
                  <TableHead>{t('featureFlags.table.status')}</TableHead>
                  <TableHead>{t('featureFlags.table.control')}</TableHead>
                  <TableHead>{t('featureFlags.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map((feature: FeatureFlag) => (
                  <TableRow key={feature.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{feature.name}</div>
                        {feature.description && (
                          <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                        )}
                        {feature.tags && feature.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {feature.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {feature.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getCategoryIcon(feature.category)}
                        <span className="mr-2">{feature.category || t('featureFlags.table.notSpecified')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getEnvironmentBadge(feature.environment)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTargetTypeIcon(feature.target_type)}
                        <div className="mr-2">
                          <div className="text-sm font-medium">
                            {getTargetTypeLabel(feature.target_type)}
                          </div>
                          {feature.target_value && (
                            <div className="text-xs text-gray-600">
                              {feature.target_value}
                            </div>
                          )}
                          {feature.rollout_percentage && (
                            <div className="text-xs text-gray-600">
                              {feature.rollout_percentage}%
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(feature.is_enabled)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={feature.is_enabled}
                        onCheckedChange={() => handleToggle(feature)}
                        disabled={toggleMutation.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(feature)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm(t('featureFlags.messages.confirmDelete'))) {
                              deleteMutation.mutate(feature.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('featureFlags.editFeature')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('featureFlags.form.featureName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={t('featureFlags.placeholders.featureName')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="key">{t('featureFlags.form.featureKey')}</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({...formData, key: e.target.value})}
                    placeholder={t('featureFlags.placeholders.featureKey')}
                    required
                  />
                </div>
              </div>
                              <div>
                  <Label htmlFor="description">{t('featureFlags.form.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t('featureFlags.placeholders.description')}
                    rows={3}
                  />
                </div>
              <div className="grid grid-cols-2 gap-4">
                                  <div>
                    <Label htmlFor="category">{t('featureFlags.form.category')}</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder={t('featureFlags.placeholders.category')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">{t('featureFlags.form.environment')}</Label>
                    <Select value={formData.environment} onValueChange={(value) => setFormData({...formData, environment: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">{t('featureFlags.environments.development')}</SelectItem>
                        <SelectItem value="staging">{t('featureFlags.environments.staging')}</SelectItem>
                        <SelectItem value="production">{t('featureFlags.environments.production')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                                  <div>
                    <Label htmlFor="target_type">{t('featureFlags.form.targetType')}</Label>
                    <Select value={formData.target_type} onValueChange={(value) => setFormData({...formData, target_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('featureFlags.targetTypes.all')}</SelectItem>
                        <SelectItem value="company">{t('featureFlags.targetTypes.company')}</SelectItem>
                        <SelectItem value="user">{t('featureFlags.targetTypes.user')}</SelectItem>
                        <SelectItem value="percentage">{t('featureFlags.targetTypes.percentage')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target_value">{t('featureFlags.form.targetValue')}</Label>
                    <Input
                      id="target_value"
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                      placeholder={t('featureFlags.placeholders.targetValue')}
                    />
                  </div>
              </div>
              {formData.target_type === 'percentage' && (
                <div>
                  <Label htmlFor="rollout_percentage">{t('featureFlags.form.rolloutPercentage')}</Label>
                  <Input
                    id="rollout_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rollout_percentage}
                    onChange={(e) => setFormData({...formData, rollout_percentage: e.target.value})}
                    placeholder={t('featureFlags.placeholders.rolloutPercentage')}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                                  <div>
                    <Label htmlFor="start_date">{t('featureFlags.form.startDate')}</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">{t('featureFlags.form.endDate')}</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
              </div>
                              <div>
                  <Label htmlFor="tags">{t('featureFlags.form.tags')}</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder={t('featureFlags.placeholders.tags')}
                  />
                </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) => setFormData({...formData, is_enabled: checked})}
                />
                                  <Label htmlFor="is_enabled">{t('featureFlags.form.enableFeature')}</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  {t('featureFlags.form.cancel')}
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('featureFlags.form.saving') : t('featureFlags.form.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 