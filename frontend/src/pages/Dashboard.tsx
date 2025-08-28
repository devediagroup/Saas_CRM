import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Building2, 
  Handshake, 
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import apiClient from "@/lib/api";

const Dashboard = () => {
  const { t } = useTranslation();

  // Fetch dashboard analytics from API (disabled for now - endpoint may not exist)
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => Promise.resolve({ data: null }), // Disable for now
    enabled: false, // Don't run this query
    retry: false,
    refetchOnWindowFocus: false
  });

  // Fetch recent leads from API
  const { data: leadsData, isLoading: leadsLoading, error: leadsError } = useQuery({
    queryKey: ['recentLeads'],
    queryFn: () => api.getLeads({
      limit: 4,
      sort: 'created_at:desc'
    }),
    retry: false,
    refetchOnWindowFocus: false
  });

  // Fetch recent properties from API
  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = useQuery({
    queryKey: ['recentProperties'],
    queryFn: () => api.getProperties({
      limit: 4,
      sort: 'created_at:desc'
    }),
    retry: false,
    refetchOnWindowFocus: false
  });

  // Extract data from API responses with safe fallbacks
  const stats = {
    leads: { count: leadsData?.data?.length || 0, change: 0 },
    properties: { count: propertiesData?.data?.length || 0, change: 0 },
    deals: { count: 0, change: 0 },
    revenue: { count: 0, change: 0 }
  };

  const recentLeads = leadsData?.data || [];
  const recentProperties = propertiesData?.data || [];

  // Show error message if backend is not available
  if (leadsError || propertiesError) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">{t('hardcoded.connectionError')}</h2>
          <p className="text-red-600 mb-4">
          {t('hardcoded.cannotConnect')}
          </p>
          <div className="bg-gray-100 p-3 rounded text-left text-sm text-gray-700">
          <strong>{t('hardcoded.toRunBackend')}</strong><br/>
          cd /Users/dandouh/crm-strapi/backend<br/>
          npm run start:dev
          </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('leads.status.new'): return 'status-pending';
      case t('leads.status.contacted'): return 'status-active';
      case t('leads.status.interested'): return 'status-active';
      case t('properties.statuses.available'): return 'status-active';
      case t('properties.statuses.booked'): return 'status-pending';
      case t('properties.statuses.sold'): return 'status-inactive';
      default: return 'status-pending';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 arabic-text">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('dashboard.welcome', { name: t('common.name') })}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('hardcoded.lastUpdate')} {new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="crm-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('dashboard.statistics.totalLeads')}
              </CardTitle>
              <Users className="h-4 w-4 text-accent-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.leads.count}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUpRight className="h-3 w-3 ml-1" />
                +{stats.leads.change}% {t('hardcoded.fromLastMonth')}
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('dashboard.statistics.totalProperties')}
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.properties.count}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUpRight className="h-3 w-3 ml-1" />
                +{stats.properties.change}% {t('hardcoded.fromLastMonth')}
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('dashboard.statistics.completedDeals')}
              </CardTitle>
              <Handshake className="h-4 w-4 text-accent-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.deals.count}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUpRight className="h-3 w-3 ml-1" />
                +{stats.deals.change}% {t('hardcoded.fromLastMonth')}
              </div>
            </CardContent>
          </Card>

          <Card className="crm-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('hardcoded.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(stats.revenue.count)}
              </div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUpRight className="h-3 w-3 ml-1" />
                +{stats.revenue.change}% {t('hardcoded.fromLastMonth')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <Card className="crm-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t('hardcoded.recentLeads')}</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/leads">{t('hardcoded.viewAll')}</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">{t('common.loading')}</div>
                ) : recentLeads.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">{t('leads.messages.noLeads')}</div>
                ) : recentLeads.map((lead) => {
                  // Handle Strapi v4 data structure
                  const leadData = lead.attributes || lead;
                  const fullName = `${leadData.first_name || ''} ${leadData.last_name || ''}`.trim() || leadData.name || t('hardcoded.undefined');
                  const phone = leadData.phone || t('hardcoded.undefined');
                  const status = leadData.status || t('leads.status.new');
                  const source = leadData.source || t('hardcoded.undefined');
                  
                  return (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                          {fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{fullName}</p>
                          <p className="text-xs text-muted-foreground">{phone}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`status-badge ${getStatusColor(status)}`}>
                          {status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{source}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card className="crm-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t('hardcoded.recentProperties')}</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="/properties">{t('hardcoded.viewAll')}</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertiesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">{t('common.loading')}</div>
                ) : recentProperties.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">{t('properties.messages.noProperties')}</div>
                ) : recentProperties.map((property) => {
                  // Handle Strapi v4 data structure
                  const propertyData = property.attributes || property;
                  const title = propertyData.title || t('hardcoded.property');
                  const location = propertyData.location || t('hardcoded.undefined');
                  const type = propertyData.property_type || propertyData.type || t('hardcoded.undefined');
                  const status = propertyData.status || t('properties.statuses.available');
                  const price = propertyData.price || 0;
                  const area = propertyData.area || 0;
                  
                  return (
                    <div key={property.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{title}</p>
                          <p className="text-xs text-muted-foreground">{location} • {type}</p>
                        </div>
                        <span className={`status-badge ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary">{formatPrice(price)}</p>
                        <p className="text-xs text-muted-foreground">{area} {t('properties.fields.area')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('hardcoded.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/leads">
                  <Users className="h-6 w-6" />
                  {t('hardcoded.addClient')}
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/properties">
                  <Building2 className="h-6 w-6" />
                  {t('hardcoded.addProperty')}
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/activities">
                  <Phone className="h-6 w-6" />
                  {t('hardcoded.logActivity')}
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <a href="/whatsapp">
                  <MessageSquare className="h-6 w-6" />
                  {t('hardcoded.whatsapp')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;