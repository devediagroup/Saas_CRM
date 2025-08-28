import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Handshake,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

const AdvancedReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReportType, setSelectedReportType] = useState("sales");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { t } = useTranslation();

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedPeriod],
    queryFn: () => apiClient.get('/analytics', {
      params: {
        period: selectedPeriod,
        'populate[0]': 'leads',
        'populate[1]': 'properties',
        'populate[2]': 'deals',
        'populate[3]': 'companies'
      }
    })
  });

  // Fetch sales reports
  const { data: salesReportsData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-reports', selectedPeriod],
    queryFn: () => apiClient.get('/sales-reports', {
      params: {
        period: selectedPeriod,
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  // Fetch customer reports
  const { data: customerReportsData, isLoading: customerLoading } = useQuery({
    queryKey: ['customer-reports', selectedPeriod],
    queryFn: () => apiClient.get('/customer-reports', {
      params: {
        period: selectedPeriod,
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  // Fetch deal reports
  const { data: dealReportsData, isLoading: dealLoading } = useQuery({
    queryKey: ['deal-reports', selectedPeriod],
    queryFn: () => apiClient.get('/deal-reports', {
      params: {
        period: selectedPeriod,
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  // Fetch marketing reports
  const { data: marketingReportsData, isLoading: marketingLoading } = useQuery({
    queryKey: ['marketing-reports', selectedPeriod],
    queryFn: () => apiClient.get('/marketing-reports', {
      params: {
        period: selectedPeriod,
        'sort[0]': 'createdAt:desc'
      }
    })
  });

  const analytics = analyticsData?.data?.data || [];
  const salesReports = salesReportsData?.data?.data || [];
  const customerReports = customerReportsData?.data?.data || [];
  const dealReports = dealReportsData?.data?.data || [];
  const marketingReports = marketingReportsData?.data?.data || [];

  const generateReport = async (format: 'pdf' | 'excel') => {
    setIsGeneratingReport(true);
    try {
      const response = await apiClient.get('/export-functionality', {
        params: {
          type: selectedReportType,
          format: format,
          period: selectedPeriod
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReportType}-report-${selectedPeriod}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(t('reports.exportSuccess'));
    } catch (error) {
      toast.error(t('reports.exportError'));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('reports.advanced.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('reports.advanced.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generateReport('excel')}
              disabled={isGeneratingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('reports.export.excel')}
            </Button>
            <Button
              onClick={() => generateReport('pdf')}
              disabled={isGeneratingReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('reports.export.pdf')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('reports.filters.periodPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('reports.filters.period.day')}</SelectItem>
              <SelectItem value="week">{t('reports.filters.period.week')}</SelectItem>
              <SelectItem value="month">{t('reports.filters.period.month')}</SelectItem>
              <SelectItem value="quarter">{t('reports.filters.period.quarter')}</SelectItem>
              <SelectItem value="year">{t('reports.filters.period.year')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('reports.filters.typePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">{t('reports.filters.types.sales')}</SelectItem>
              <SelectItem value="customers">{t('reports.filters.types.customers')}</SelectItem>
              <SelectItem value="deals">{t('reports.filters.types.deals')}</SelectItem>
              <SelectItem value="marketing">{t('reports.filters.types.marketing')}</SelectItem>
              <SelectItem value="performance">{t('reports.filters.types.performance')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('reports.metrics.totalSales')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {formatCurrency(analytics?.total_sales || 0)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                <span className="arabic-text">+{formatPercentage(analytics?.sales_growth || 0)} {t('reports.metrics.salesGrowth')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('reports.metrics.customersCount')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {analytics?.total_customers || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                <span className="arabic-text">+{analytics?.customer_growth || 0} {t('reports.metrics.newCustomer')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('reports.metrics.activeDeals')}</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {analytics?.active_deals || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Activity className="h-3 w-3 ml-1 text-blue-500" />
                <span className="arabic-text">{analytics?.deal_conversion_rate || 0}% {t('reports.metrics.conversionRate')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('reports.metrics.availableProperties')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {analytics?.available_properties || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 ml-1 text-orange-500" />
                <span className="arabic-text">{analytics?.property_occupancy_rate || 0}% {t('reports.metrics.occupancyRate')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs value={selectedReportType} onValueChange={setSelectedReportType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('reports.filters.types.sales')}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('reports.filters.types.customers')}
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              {t('reports.filters.types.deals')}
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('reports.filters.types.marketing')}
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              {t('reports.filters.types.performance')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.salesByTeam')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="arabic-text">{t('reports.table.team')}</TableHead>
                        <TableHead className="arabic-text">{t('reports.table.sales')}</TableHead>
                        <TableHead className="arabic-text">{t('reports.table.target')}</TableHead>
                        <TableHead className="arabic-text">{t('reports.table.achievement')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              {t('common.loading')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : salesReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {t('common.noData')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        salesReports.map((report: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="arabic-text">{report.team_name}</TableCell>
                            <TableCell className="arabic-text">{formatCurrency(report.sales_amount)}</TableCell>
                            <TableCell className="arabic-text">{formatCurrency(report.target_amount)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={report.achievement_percentage} className="w-20" />
                                <span className="text-sm arabic-text">
                                  {formatPercentage(report.achievement_percentage)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.salesByProduct')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesReports.slice(0, 5).map((report: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="arabic-text">{report.product_name}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm arabic-text">{formatCurrency(report.product_sales)}</div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {formatPercentage(report.product_share)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.customerDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerReports.map((report: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="arabic-text">{report.source_name}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm arabic-text">{report.customer_count} {t('reports.metrics.leadsCount')}</div>
                          <Badge className="bg-green-100 text-green-800">
                            {formatPercentage(report.source_percentage)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.retentionRate')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {formatPercentage(customerReports[0]?.retention_rate || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground arabic-text">
                      {t('reports.metrics.retentionDescription')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.dealStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.new')}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {dealReports.filter((r: any) => r.status === 'new').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.inProgress')}</span>
                      <Badge className="bg-green-100 text-green-800">
                        {dealReports.filter((r: any) => r.status === 'in_progress').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.completed')}</span>
                      <Badge className="bg-green-100 text-green-800">
                        {dealReports.filter((r: any) => r.status === 'completed').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.dealValue')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold arabic-text mb-2">
                      {formatCurrency(dealReports.reduce((sum: number, r: any) => sum + (r.deal_value || 0), 0))}
                    </div>
                    <p className="text-sm text-muted-foreground arabic-text">
                      {t('reports.metrics.totalDealValue')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.conversionRate')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatPercentage(dealReports[0]?.conversion_rate || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground arabic-text">
                      {t('reports.metrics.dealCloseRate')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.marketingPerformance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="arabic-text">{t('reports.table.campaign')}</TableHead>
                        <TableHead className="arabic-text">{t('reports.table.spend')}</TableHead>
                        <TableHead className="arabic-text">{t('reports.table.revenue')}</TableHead>
                        <TableHead className="arabic-text">{t('reports.table.roi')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketingReports.map((report: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="arabic-text">{report.campaign_name}</TableCell>
                          <TableCell className="arabic-text">{formatCurrency(report.spend)}</TableCell>
                          <TableCell className="arabic-text">{formatCurrency(report.revenue)}</TableCell>
                          <TableCell>
                            <Badge className={report.roi >= 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {formatPercentage(report.roi)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.leadSources')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketingReports.map((report: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="arabic-text">{report.source_name}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm arabic-text">{report.leads_count} {t('reports.metrics.leadsCount')}</div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {formatPercentage(report.source_efficiency)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.teamPerformance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.averageProductivity')}</span>
                      <Badge className="bg-green-100 text-green-800">
                        {analytics?.average_productivity || 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.satisfactionRate')}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {formatPercentage(analytics?.satisfaction_rate || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.responseTime')}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {analytics?.response_time || 0} {t('common.hours')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('reports.metrics.kpi')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.growthRate')}</span>
                      <Badge className="bg-green-100 text-green-800">
                        {formatPercentage(analytics?.growth_rate || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.retentionRate')}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {formatPercentage(analytics?.retention_rate || 0)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="arabic-text">{t('reports.metrics.conversionRate')}</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {formatPercentage(analytics?.conversion_rate || 0)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdvancedReports;
