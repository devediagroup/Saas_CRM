import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Phone, 
  Mail,
  MapPin,
  Filter,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

interface Company {
  id: number;
  documentId?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  status?: 'active' | 'inactive';
  subscription_type?: 'basic' | 'premium' | 'enterprise';
  employees_count?: number;
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
}

const Companies = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    status: "active",
    subscription_type: "basic",
    employees_count: 1
  });

  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies', searchTerm, statusFilter, subscriptionFilter],
    queryFn: () => api.getCompanies({
      'filters[name][$containsi]': searchTerm,
      ...(statusFilter !== 'all' && { 'filters[status][$eq]': statusFilter }),
      ...(subscriptionFilter !== 'all' && { 'filters[subscription_type][$eq]': subscriptionFilter }),
      'sort[0]': 'createdAt:desc'
    })
  });

  const companies = Array.isArray(companiesData?.data?.data) ? companiesData.data.data : [];

  // Filter companies based on search and filters
  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = !searchTerm || 
                         (company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? company.is_active === true : company.is_active === false);
    const matchesSubscription = subscriptionFilter === 'all' || company.subscription_type === subscriptionFilter;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  // Create company mutation
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(t('companies.successCreate'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('companies.errorCreate'));
    }
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateCompany(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(t('companies.successUpdate'));
      setEditingCompany(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('companies.errorUpdate'));
    }
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCompany(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(t('companies.successDelete'));
    },
    onError: () => {
      toast.error(t('companies.errorDelete'));
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      status: "active",
      subscription_type: "basic",
      employees_count: 1
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      status: company.status,
      subscription_type: company.subscription_type,
      employees_count: company.employees_count
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('companies.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{t(`companies.${status}`)}</Badge>;
  };

  const getSubscriptionBadge = (type: string) => {
    const variants = {
      basic: "outline",
      premium: "default",
      enterprise: "secondary"
    };
    return <Badge variant={variants[type as keyof typeof variants] as any}>{t(`companies.${type}`)}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground arabic-text">{t('companies.title')}</h1>
            <p className="text-muted-foreground arabic-text">
              {t('companies.subtitle')}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 arabic-text">
                <Plus className="h-4 w-4" />
                {t('companies.addCompany')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="arabic-text">
                  {editingCompany ? t('companies.editCompany') : t('companies.addCompany')}
                </DialogTitle>
                <DialogDescription className="arabic-text">
                  {editingCompany ? t('companies.editCompanyDesc') : t('companies.addCompanyDesc')}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="arabic-text">{t('companies.companyName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('companies.companyNamePlaceholder')}
                    required
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="arabic-text">{t('common.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('companies.emailPlaceholder')}
                    required
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="arabic-text">{t('common.phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('companies.phonePlaceholder')}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="arabic-text">{t('common.address')}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('companies.addressPlaceholder')}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="arabic-text">{t('companies.city')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t('companies.cityPlaceholder')}
                    dir="rtl"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="arabic-text">{t('companies.status')}</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('companies.active')}</SelectItem>
                        <SelectItem value="inactive">{t('companies.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="arabic-text">{t('companies.subscriptionType')}</Label>
                    <Select value={formData.subscription_type} onValueChange={(value) => setFormData({ ...formData, subscription_type: value })}>
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">{t('companies.basic')}</SelectItem>
                        <SelectItem value="premium">{t('companies.premium')}</SelectItem>
                        <SelectItem value="enterprise">{t('companies.enterprise')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees" className="arabic-text">{t('companies.employeesCount')}</Label>
                  <Input
                    id="employees"
                    type="number"
                    min="1"
                    value={formData.employees_count}
                    onChange={(e) => setFormData({ ...formData, employees_count: parseInt(e.target.value) })}
                    placeholder={t('companies.employeesPlaceholder')}
                  />
                </div>
                
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCompany(null);
                    resetForm();
                  }}>
                    {t('companies.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? t('companies.saving') : editingCompany ? t('companies.update') : t('companies.add')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('companies.searchCompanies')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('companies.allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('companies.active')}</SelectItem>
                    <SelectItem value="inactive">{t('companies.inactive')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="w-32" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('companies.allSubscriptions')}</SelectItem>
                    <SelectItem value="basic">{t('companies.basic')}</SelectItem>
                    <SelectItem value="premium">{t('companies.premium')}</SelectItem>
                    <SelectItem value="enterprise">{t('companies.enterprise')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 arabic-text">{t('companies.noCompanies')}</h3>
              <p className="text-muted-foreground mb-4 arabic-text">
                {t('companies.noCompaniesDesc')}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 arabic-text">
                <Plus className="h-4 w-4" />
                {t('companies.addCompany')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: Company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg arabic-text">{company.name}</CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(company.is_active ? 'active' : 'inactive')}
                      {company.subscription_type && getSubscriptionBadge(company.subscription_type)}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        handleEdit(company);
                        setIsCreateDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4 ml-2" />
                        {t('companies.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(company.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        {t('companies.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {company.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">{company.email}</span>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">{company.phone}</span>
                    </div>
                  )}
                  
                  {company.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="arabic-text">{company.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="arabic-text">{company.employees_count || 0} {t('companies.employees')}</span>
                  </div>

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <span className="arabic-text">
                      {t('companies.createdDate')}: {new Date(company.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Companies; 