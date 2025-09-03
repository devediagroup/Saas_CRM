import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

const Analytics = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
    to: new Date()
  });
  const [period, setPeriod] = useState("month");
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['analytics', dateRange, period],
    queryFn: () => api.getDashboard()
  });

  // حذف البيانات الوهمية واستبدالها ببيانات حقيقية من API
  const { data: monthlyRevenueData } = useQuery({
    queryKey: ['monthlyRevenue', dateRange, period],
    queryFn: () => api.getSalesReports({
      period: period,
      type: 'monthly_revenue'
    })
  });

  const { data: leadSourcesData } = useQuery({
    queryKey: ['leadSources', dateRange, period],
    queryFn: () => api.getLeadSources({
      period: period,
      analytics: true
    })
  });

  const { data: dealsData } = useQuery({
    queryKey: ['dealsByStatus', dateRange, period],
    queryFn: () => api.getDeals({
      period: period,
      groupBy: 'status'
    })
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['activitySummary', dateRange, period],
    queryFn: () => api.getActivities({
      period: period,
      summary: true
    })
  });

  // تحويل البيانات من API إلى تنسيق الرسوم البيانية
  const monthlyRevenue = monthlyRevenueData?.data || [];
  const leadSources = leadSourcesData?.data || [];
  const dealsByStatus = dealsData?.data || [];
  const activitySummary = activitiesData?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    // Export functionality - could implement actual export logic here
    toast.success(t('analytics.exportStarted'));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground arabic-text">{t('analytics.title')}</h1>
            <p className="text-muted-foreground arabic-text">
              {t('analytics.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleExport} className="gap-2 arabic-text">
              <Download className="h-4 w-4" />
              {t('analytics.exportReport')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{t('analytics.periods.day')}</SelectItem>
                  <SelectItem value="week">{t('analytics.periods.week')}</SelectItem>
                  <SelectItem value="month">{t('analytics.periods.month')}</SelectItem>
                  <SelectItem value="quarter">{t('analytics.periods.quarter')}</SelectItem>
                  <SelectItem value="year">{t('analytics.periods.year')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
                <SelectTrigger className="w-40" dir="rtl">
                  <SelectValue placeholder={t('analytics.filters.selectDeveloper')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('analytics.filters.allDevelopers')}</SelectItem>
                  <SelectItem value="dev1">Developer 1</SelectItem>
                  <SelectItem value="dev2">Developer 2</SelectItem>
                  <SelectItem value="dev3">Developer 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-40" dir="rtl">
                  <SelectValue placeholder={t('analytics.filters.selectProject')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('analytics.filters.allProjects')}</SelectItem>
                  <SelectItem value="proj1">Project 1</SelectItem>
                  <SelectItem value="proj2">Project 2</SelectItem>
                  <SelectItem value="proj3">Project 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('analytics.kpis.totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(12300000)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                <span className="text-green-500">+23.1%</span>
                <span className="arabic-text mr-1">{t('analytics.kpis.lastMonth')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('analytics.kpis.totalDeals')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">166</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                <span className="text-green-500">+12.5%</span>
                <span className="arabic-text mr-1">{t('analytics.kpis.lastMonth')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('analytics.kpis.totalLeads')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                <span className="text-green-500">+8.2%</span>
                <span className="arabic-text mr-1">{t('analytics.kpis.lastMonth')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('analytics.kpis.conversionRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                <span className="text-green-500">+3.2%</span>
                <span className="arabic-text mr-1">{t('analytics.kpis.lastMonth')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.charts.monthlyRevenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}${t('analytics.units.million')}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), t('analytics.labels.revenue')]}
                    labelFormatter={(label) => `${t('analytics.labels.month')} ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Sources Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.charts.leadSources')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadSources}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {leadSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, t('analytics.labels.percentage')]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deals by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.charts.dealsByStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealsByStatus.map((deal, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: deal.color }}
                      />
                      <span className="arabic-text">{deal.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{deal.count}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((deal.count / dealsByStatus.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.charts.activitySummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitySummary.map((activity, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="arabic-text font-medium">{activity.type}</span>
                      <span className="font-semibold">{activity.count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${activity.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {activity.percentage}% {t('analytics.summary.percentage')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">{t('analytics.charts.dealsTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000000}${t('analytics.units.million')}`} />
                <YAxis yAxisId="right" orientation="left" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? t('analytics.labels.revenue') : t('analytics.labels.dealsCount')
                  ]}
                  labelFormatter={(label) => `${t('analytics.labels.month')} ${label}`}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={4} opacity={0.7} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="deals"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* New Charts for Developer and Project Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.charts.salesByDeveloper')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { developer: 'Developer 1', sales: 4500000, deals: 28 },
                  { developer: 'Developer 2', sales: 3200000, deals: 22 },
                  { developer: 'Developer 3', sales: 2800000, deals: 18 },
                  { developer: 'Developer 4', sales: 1800000, deals: 12 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="developer" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'sales' ? formatCurrency(value) : value,
                      name === 'sales' ? t('analytics.labels.sales') : t('analytics.labels.dealsCount')
                    ]}
                  />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.charts.salesByProject')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { project: 'Project A', sales: 3800000, units: 15 },
                  { project: 'Project B', sales: 2900000, units: 12 },
                  { project: 'Project C', sales: 2200000, units: 9 },
                  { project: 'Project D', sales: 1800000, units: 7 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="project" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'sales' ? formatCurrency(value) : value,
                      name === 'sales' ? t('analytics.labels.sales') : t('analytics.labels.unitsCount')
                    ]}
                  />
                  <Bar dataKey="sales" fill="#f59e0b" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.summary.topSalesRep')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.salesReps.ahmedMohamed')}</span>
                  <Badge>{formatCurrency(2800000)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.salesReps.saraAli')}</span>
                  <Badge variant="secondary">{formatCurrency(2200000)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.salesReps.mohamedAhmed')}</span>
                  <Badge variant="outline">{formatCurrency(1900000)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.summary.topRegions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.regions.riyadh')}</span>
                  <Badge>45 {t('analytics.summary.deals')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.regions.jeddah')}</span>
                  <Badge variant="secondary">32 {t('analytics.summary.deals')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.regions.dammam')}</span>
                  <Badge variant="outline">28 {t('analytics.summary.deals')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">{t('analytics.summary.popularPropertyTypes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.propertyTypes.villa')}</span>
                  <Badge>38%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.propertyTypes.apartment')}</span>
                  <Badge variant="secondary">31%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.propertyTypes.land')}</span>
                  <Badge variant="outline">19%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="arabic-text">{t('analytics.propertyTypes.office')}</span>
                  <Badge variant="outline">12%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics; 