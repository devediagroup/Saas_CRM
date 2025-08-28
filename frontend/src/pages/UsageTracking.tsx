import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Database, 
  Zap,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Target,
  Gauge,
  LineChart,
  PieChart,
  Download
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface UsageTracking {
  id: number;
  company: {
    id: number;
    name: string;
  };
  resource_type: string;
  usage_count: number;
  limit_count: number;
  period_start: string;
  period_end: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'normal' | 'warning' | 'exceeded';
  createdAt: string;
  updatedAt: string;
}

export default function UsageTracking() {
  const { t } = useTranslation();
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Fetch usage tracking data
  const { data: usageData = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ['usage-tracking', selectedCompany, selectedPeriod],
    queryFn: () => {
      let url = '/usage-trackings?populate=*';
      if (selectedCompany !== 'all') {
        url += `&filters[company][id][$eq]=${selectedCompany}`;
      }
      return apiClient.get(url).then(res => res.data.data || []);
    }
  });

  // Fetch companies for filter
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.get('/companies').then(res => res.data.data || [])
  });

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusBadge = (status: string, percentage: number) => {
    if (percentage >= 100) {
      return <Badge className="bg-red-100 text-red-800">{t('usageTracking.status.exceeded')}</Badge>;
    }
    if (percentage >= 80) {
      return <Badge className="bg-yellow-100 text-yellow-800">{t('usageTracking.status.warning')}</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">{t('usageTracking.status.normal')}</Badge>;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType?.toLowerCase()) {
      case 'users':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'leads':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'properties':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'storage':
        return <Database className="h-5 w-5 text-orange-500" />;
      case 'api_calls':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getResourceName = (resourceType: string) => {
    const resourceNames: { [key: string]: string } = {
      users: t('usageTracking.resources.users'),
      leads: t('usageTracking.resources.leads'),
      properties: t('usageTracking.resources.properties'),
      deals: t('usageTracking.resources.deals'),
      storage: t('usageTracking.resources.storage'),
      api_calls: t('usageTracking.resources.apiCalls'),
      whatsapp_messages: t('usageTracking.resources.whatsappMessages'),
      email_sends: t('usageTracking.resources.emailSends')
    };
    return resourceNames[resourceType] || resourceType;
  };

  // Calculate overall statistics
  const totalResources = usageData.length;
  const warningResources = usageData.filter((item: UsageTracking) => {
    const percentage = getUsagePercentage(item.usage_count, item.limit_count);
    return percentage >= 80 && percentage < 100;
  }).length;
  const exceededResources = usageData.filter((item: UsageTracking) => {
    const percentage = getUsagePercentage(item.usage_count, item.limit_count);
    return percentage >= 100;
  }).length;
  const normalResources = totalResources - warningResources - exceededResources;

  // Group usage by company
  const usageByCompany = usageData.reduce((acc: any, item: UsageTracking) => {
    const companyName = item.company?.name || t('common.notSpecified');
    if (!acc[companyName]) {
      acc[companyName] = [];
    }
    acc[companyName].push(item);
    return acc;
  }, {});

  if (isLoadingUsage) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('usageTracking.loading')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('usageTracking.title')}</h1>
            <p className="text-gray-600 mt-1">{t('usageTracking.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              {t('usageTracking.exportReport')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('usageTracking.selectCompany')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('usageTracking.allCompanies')}</SelectItem>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('usageTracking.selectPeriod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">{t('usageTracking.periods.current')}</SelectItem>
                    <SelectItem value="last_month">{t('usageTracking.periods.lastMonth')}</SelectItem>
                    <SelectItem value="last_3_months">{t('usageTracking.periods.last3Months')}</SelectItem>
                    <SelectItem value="last_year">{t('usageTracking.periods.lastYear')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('usageTracking.stats.totalResources')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalResources}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('usageTracking.stats.normal')}</p>
                  <p className="text-3xl font-bold text-green-600">{normalResources}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('usageTracking.stats.warning')}</p>
                  <p className="text-3xl font-bold text-yellow-600">{warningResources}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('usageTracking.stats.exceeded')}</p>
                  <p className="text-3xl font-bold text-red-600">{exceededResources}</p>
                </div>
                <Gauge className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usageData.map((item: UsageTracking) => {
            const percentage = getUsagePercentage(item.usage_count, item.limit_count);
            return (
              <Card key={item.id} className={`${percentage >= 100 ? 'ring-2 ring-red-200' : percentage >= 80 ? 'ring-2 ring-yellow-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getResourceIcon(item.resource_type)}
                      <div className="mr-3">
                        <h3 className="font-semibold text-gray-900">
                          {getResourceName(item.resource_type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.company?.name || t('common.notSpecified')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.status, percentage)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{t('usageTracking.currentUsage')}:</span>
                      <span className="font-medium">
                        {item.usage_count.toLocaleString()} / {item.limit_count.toLocaleString()}
                      </span>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% {t('usageTracking.used')}</span>
                      <span>
                        {item.limit_count - item.usage_count > 0 
                                                      ? `${(item.limit_count - item.usage_count).toLocaleString()} ${t('usageTracking.remaining')}`
                            : t('usageTracking.status.exceeded')
                        }
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {item.period_start ? new Date(item.period_start).toLocaleDateString('ar-SA') : t('common.notSpecified')} - 
                          {item.period_end ? new Date(item.period_end).toLocaleDateString('ar-SA') : t('common.notSpecified')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage by Company Table */}
        {Object.keys(usageByCompany).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="ml-2 h-5 w-5" />
                {t('usageTracking.usageByCompany')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('usageTracking.company')}</TableHead>
                    <TableHead>{t('usageTracking.resourceType')}</TableHead>
                    <TableHead>{t('usageTracking.currentUsage')}</TableHead>
                    <TableHead>{t('usageTracking.maxLimit')}</TableHead>
                    <TableHead>{t('usageTracking.percentage')}</TableHead>
                    <TableHead>{t('usageTracking.status')}</TableHead>
                    <TableHead>{t('usageTracking.period')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData.map((item: UsageTracking) => {
                    const percentage = getUsagePercentage(item.usage_count, item.limit_count);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            {item.company?.name || t('common.notSpecified')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getResourceIcon(item.resource_type)}
                            <span className="mr-2">{getResourceName(item.resource_type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.usage_count.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{item.limit_count.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <Progress value={percentage} className="h-2" />
                            </div>
                            <span className="text-sm font-medium min-w-12">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status, percentage)}</TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {item.billing_cycle === 'monthly' ? t('usageTracking.monthly') : t('usageTracking.yearly')}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="ml-2 h-5 w-5" />
              {t('usageTracking.usageTrends')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Resource Type Distribution */}
              {Object.entries(
                usageData.reduce((acc: any, item: UsageTracking) => {
                  const resourceName = getResourceName(item.resource_type);
                  if (!acc[resourceName]) {
                    acc[resourceName] = { total: 0, used: 0 };
                  }
                  acc[resourceName].total += item.limit_count;
                  acc[resourceName].used += item.usage_count;
                  return acc;
                }, {})
              ).map(([resourceName, data]: [string, any]) => {
                const percentage = getUsagePercentage(data.used, data.total);
                return (
                  <Card key={resourceName} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{resourceName}</h4>
                      <span className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2 mb-2" />
                    <div className="text-xs text-gray-600">
                      {data.used.toLocaleString()} / {data.total.toLocaleString()}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Recommendations */}
        {(warningResources > 0 || exceededResources > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-700">
                <AlertTriangle className="ml-2 h-5 w-5" />
                {t('usageTracking.alertsAndRecommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exceededResources > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <h4 className="font-medium text-red-800">
                          {t('usageTracking.alerts.exceededLimit', { count: exceededResources })}
                        </h4>
                        <p className="text-sm text-red-600 mt-1">
                          {t('usageTracking.alerts.exceededRecommendation')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {warningResources > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          {t('usageTracking.alerts.warningLimit', { count: warningResources })}
                        </h4>
                        <p className="text-sm text-yellow-600 mt-1">
                          {t('usageTracking.alerts.warningRecommendation')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
} 