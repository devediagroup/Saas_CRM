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
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Heart
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

interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  district: string;
  status: string;
  description: string;
  features: string[];
  images: string[];
  createdAt: string;
  agent: string;
  views: number;
  favorites: number;
}

const Properties = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "Apartment",
    listing_type: "Sale",
    price: 0,
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    location: "",
    address: "",
    status: "Available"
  });

  const queryClient = useQueryClient();

  // Fetch properties from API
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties', searchTerm, typeFilter, statusFilter, priceFilter],
    queryFn: () => api.getProperties({
      ...(searchTerm && { title_contains: searchTerm }),
      ...(typeFilter !== 'all' && { property_type: typeFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      sort: 'created_at:desc'
    })
  });

  const properties = Array.isArray(propertiesData?.data) ? propertiesData.data : [];

  // CRUD mutations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(t('properties.messages.created'));
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error(t('properties.messages.error'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.updateProperty(id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(t('properties.messages.updated'));
      setEditingProperty(null);
      resetForm();
    },
    onError: () => {
      toast.error(t('properties.messages.error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProperty(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(t('properties.messages.deleted'));
    },
    onError: () => {
      toast.error(t('properties.messages.error'));
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      property_type: "Apartment",
      listing_type: "Sale",
      price: 0,
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      location: "",
      address: "",
      status: "Available"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      property_type: property.property_type || 'Apartment',
      listing_type: property.listing_type || 'Sale',
      price: property.price || 0,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      location: property.location || '',
      address: property.address || '',
      status: property.status || 'Available'
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('properties.messages.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booked': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold': 
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rented': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
                         (property.title && property.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    let matchesPrice = true;
    if (priceFilter !== 'all') {
      const price = property.price;
      switch (priceFilter) {
        case 'under-300k': matchesPrice = price < 300000; break;
        case '300k-600k': matchesPrice = price >= 300000 && price <= 600000; break;
        case '600k-1m': matchesPrice = price >= 600000 && price <= 1000000; break;
        case 'over-1m': matchesPrice = price > 1000000; break;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesPrice;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 arabic-text">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('properties.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('properties.search')}
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
            {t('properties.add')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('properties.stats.totalProperties')}</p>
                  <p className="text-2xl font-bold text-primary">{properties.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Square className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('properties.stats.availableProperties')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {properties.filter(p => p.status === 'available').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('properties.stats.bookedProperties')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {properties.filter(p => p.status === 'booked').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="crm-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('properties.stats.averagePrice')}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>{t('properties.filters.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('properties.filters.searchPlaceholder')}
                    className="pr-10 arabic-text"
                    dir="rtl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t('properties.filters.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.types.all')}</SelectItem>
                  <SelectItem value="villa">{t('properties.types.villa')}</SelectItem>
                  <SelectItem value="apartment">{t('properties.types.apartment')}</SelectItem>
                  <SelectItem value="land">{t('properties.types.land')}</SelectItem>
                  <SelectItem value="office">{t('properties.types.office')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t('properties.filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.statuses.all')}</SelectItem>
                  <SelectItem value="available">{t('properties.statuses.available')}</SelectItem>
                  <SelectItem value="booked">{t('properties.statuses.booked')}</SelectItem>
                  <SelectItem value="sold">{t('properties.statuses.sold')}</SelectItem>
                  <SelectItem value="rented">{t('properties.statuses.rented')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={t('properties.filters.pricePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.priceRanges.all')}</SelectItem>
                  <SelectItem value="under-300k">{t('properties.priceRanges.under-300k')}</SelectItem>
                  <SelectItem value="300k-600k">{t('properties.priceRanges.300k-600k')}</SelectItem>
                  <SelectItem value="600k-1m">{t('properties.priceRanges.600k-1m')}</SelectItem>
                  <SelectItem value="over-1m">{t('properties.priceRanges.over-1m')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="crm-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                {/* Property Image Placeholder */}
                <div className="h-48 bg-gradient-to-r from-muted to-muted/50 rounded-t-lg flex items-center justify-center">
                  <Square className="h-12 w-12 text-muted-foreground" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
                
                {/* Favorites */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="bg-white/90 rounded-full p-1.5">
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-xs bg-white/90 px-2 py-1 rounded-full">
                    {property.favorites}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Price */}
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{property.district}, {property.location}</span>
                  </div>
                  
                  {/* Property Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{property.area} {t('properties.area')}</span>
                    </div>
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {property.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.features.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Agent and Views */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">{property.agent}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{property.views}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <div className="p-4 pt-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MoreHorizontal className="h-4 w-4 ml-2" />
                      {t('properties.dropdown.options')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Eye className="ml-2 h-4 w-4" />
                      {t('properties.dropdown.viewDetails')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(property)}>
                      <Edit className="ml-2 h-4 w-4" />
                      {t('properties.dropdown.editProperty')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Heart className="ml-2 h-4 w-4" />
                      {t('properties.dropdown.addToFavorites')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(property.id)}>
                      <Trash2 className="ml-2 h-4 w-4" />
                      {t('properties.dropdown.deleteProperty')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredProperties.length === 0 && (
          <Card className="crm-card">
            <CardContent className="text-center py-12">
              <Square className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('properties.messages.noProperties')}</h3>
              <p className="text-muted-foreground mb-4">{t('properties.messages.noPropertiesDesc')}</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setStatusFilter("all");
                setPriceFilter("all");
              }}>
                {t('properties.messages.resetFilters')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Property Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingProperty} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingProperty(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="arabic-text">
                {editingProperty ? t('properties.form.editProperty') : t('properties.form.addNewProperty')}
              </DialogTitle>
              <DialogDescription className="arabic-text">
                {editingProperty ? t('properties.form.editPropertyDesc') : t('properties.form.addPropertyDesc')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="arabic-text">{t('properties.form.title')}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type" className="arabic-text">{t('properties.form.propertyType')}</Label>
                  <Select value={formData.property_type} onValueChange={(value) => setFormData({...formData, property_type: value})}>
                    <SelectTrigger className="arabic-text">
                                              <SelectValue placeholder={t('properties.form.choosePropertyType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">{t('properties.propertyTypes.apartment')}</SelectItem>
                      <SelectItem value="Villa">{t('properties.propertyTypes.villa')}</SelectItem>
                      <SelectItem value="Office">{t('properties.propertyTypes.office')}</SelectItem>
                      <SelectItem value="Shop">{t('properties.propertyTypes.shop')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="arabic-text">{t('properties.form.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area" className="arabic-text">{t('properties.form.area')}</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: parseInt(e.target.value)})}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms" className="arabic-text">{t('properties.form.bedrooms')}</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                    className="arabic-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="arabic-text">{t('properties.form.location')}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="arabic-text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="arabic-text">{t('properties.form.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="arabic-text">
                                              <SelectValue placeholder={t('properties.form.chooseStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">{t('properties.propertyStatuses.available')}</SelectItem>
                      <SelectItem value="Reserved">{t('properties.propertyStatuses.reserved')}</SelectItem>
                      <SelectItem value="Sold">{t('properties.propertyStatuses.sold')}</SelectItem>
                      <SelectItem value="Rented">{t('properties.propertyStatuses.rented')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                                  <Label htmlFor="description" className="arabic-text">{t('properties.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="arabic-text"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingProperty(null);
                  resetForm();
                }} className="arabic-text">
                  {t('properties.form.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="arabic-text">
                  {editingProperty ? t('properties.form.update') : t('properties.form.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Properties;