import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Building,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Search,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';

interface AIAnalysis {
  id: number;
  analysis_type: string;
  data_source: string;
  insights: any;
  recommendations: string[];
  confidence_score: number;
  status: 'pending' | 'completed' | 'failed';
  created_by?: string;
  processed_at?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export default function AIAnalysis() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch AI analyses
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['ai-analyses'],
    queryFn: () => api.getActivities().then(res => res.data.data || [])
  });

  // Run new analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: (analysisType: string) =>
      api.createActivity({
        data: {
          analysis_type: analysisType,
          status: 'pending'
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analyses'] });
      toast.success(t('success.created'));
      setIsRunningAnalysis(false);
    },
    onError: () => {
      toast.error(t('errors.generic'));
      setIsRunningAnalysis(false);
    }
  });

  const getAnalysisTypeIcon = (analysisType: string) => {
    switch (analysisType?.toLowerCase()) {
      case 'lead_scoring':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'sales_forecasting':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'customer_segmentation':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'property_valuation':
        return <Building className="h-5 w-5 text-orange-500" />;
      case 'market_analysis':
        return <BarChart3 className="h-5 w-5 text-indigo-500" />;
      case 'churn_prediction':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'price_optimization':
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAnalysisTypeLabel = (analysisType: string) => {
    const labels = {
      lead_scoring: t('aiRecommendations.leadScoring'),
      sales_forecasting: t('aiRecommendations.salesForecasting'),
      customer_segmentation: t('aiRecommendations.customerSegmentation'),
      property_valuation: t('aiRecommendations.propertyValuation'),
      market_analysis: t('aiRecommendations.marketAnalysis'),
      churn_prediction: t('aiRecommendations.churnPrediction'),
      price_optimization: t('aiRecommendations.priceOptimization'),
      sentiment_analysis: t('aiRecommendations.sentimentAnalysis'),
      recommendation_engine: t('aiRecommendations.recommendationEngine')
    };
    return labels[analysisType as keyof typeof labels] || analysisType;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('activities.statuses.scheduled'), color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { label: t('activities.statuses.completed'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: t('errors.generic'), color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleRunAnalysis = (analysisType: string) => {
    setIsRunningAnalysis(true);
    runAnalysisMutation.mutate(analysisType);
  };

  // Filter analyses
  const filteredAnalyses = analyses.filter((analysis: AIAnalysis) => {
    const matchesType = selectedAnalysisType === 'all' || analysis.analysis_type === selectedAnalysisType;
    const matchesSearch =
      analysis.analysis_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAnalysisTypeLabel(analysis.analysis_type).includes(searchTerm);

    return matchesType && matchesSearch;
  });

  // Calculate statistics
  const totalAnalyses = analyses.length;
  const completedAnalyses = analyses.filter((a: AIAnalysis) => a.status === 'completed').length;
  const pendingAnalyses = analyses.filter((a: AIAnalysis) => a.status === 'pending').length;
  const avgConfidence = analyses.length > 0
    ? analyses.reduce((sum: number, a: AIAnalysis) => sum + (a.confidence_score || 0), 0) / analyses.length
    : 0;

  // استبدال البيانات الوهمية ببيانات حقيقية من API
  const { data: realInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => api.getDashboard()
  });

  // استخدام البيانات الحقيقية مع fallback للقيم الافتراضية
  const insights = realInsights?.data || {
    lead_conversion_rate: 0,
    top_performing_source: t('leadSources.unknown'),
    predicted_monthly_revenue: 0,
    high_value_leads: 0,
    market_trend: t('analytics.marketTrend.stable'),
    recommended_actions: []
  };

  if (isLoadingAnalyses) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('aiRecommendations.title')}</h1>
            <p className="text-gray-600 mt-1">{t('aiRecommendations.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              {t('common.export')}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isRunningAnalysis}
            >
              <Play className="ml-2 h-4 w-4" />
              {isRunningAnalysis ? t('aiRecommendations.analyzing') : t('aiRecommendations.runNewAnalysis')}
            </Button>
          </div>
        </div>

        {/* Quick Analysis Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="ml-2 h-5 w-5" />
              {t('aiRecommendations.quickAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => handleRunAnalysis('lead_scoring')}
                disabled={isRunningAnalysis}
              >
                <Target className="h-6 w-6 mb-2 text-green-500" />
                <span className="text-sm">{t('aiRecommendations.leadScoring')}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => handleRunAnalysis('sales_forecasting')}
                disabled={isRunningAnalysis}
              >
                <TrendingUp className="h-6 w-6 mb-2 text-blue-500" />
                <span className="text-sm">{t('aiRecommendations.salesForecasting')}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => handleRunAnalysis('market_analysis')}
                disabled={isRunningAnalysis}
              >
                <BarChart3 className="h-6 w-6 mb-2 text-indigo-500" />
                <span className="text-sm">{t('aiRecommendations.marketAnalysis')}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => handleRunAnalysis('churn_prediction')}
                disabled={isRunningAnalysis}
              >
                <TrendingDown className="h-6 w-6 mb-2 text-red-500" />
                <span className="text-sm">{t('aiRecommendations.churnPrediction')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('aiRecommendations.totalAnalyses')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalAnalyses}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('aiRecommendations.completed')}</p>
                  <p className="text-3xl font-bold text-green-600">{completedAnalyses}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('aiRecommendations.pending')}</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingAnalyses}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('aiRecommendations.averageConfidence')}</p>
                  <p className={`text-3xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                    {avgConfidence.toFixed(1)}%
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="ml-2 h-5 w-5" />
                {t('aiRecommendations.leadConversionRate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {insights.lead_conversion_rate}%
                </div>
                <Progress value={insights.lead_conversion_rate} className="h-2 mb-2" />
                <p className="text-sm text-gray-600">{t('hardcoded.fromLastMonth')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="ml-2 h-5 w-5" />
                {t('aiRecommendations.predictedRevenue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  ${insights.predicted_monthly_revenue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">{t('aiRecommendations.nextMonth')}</p>
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{t('aiRecommendations.growthPercentage')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="ml-2 h-5 w-5" />
                {t('aiRecommendations.highValueLeads')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {insights.high_value_leads}
                </div>
                <p className="text-sm text-gray-600">{t('aiRecommendations.thisWeek')}</p>
                <Badge className="bg-purple-100 text-purple-800 mt-2">
                  {t('common.priority')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="ml-2 h-5 w-5" />
              {t('aiRecommendations.smartRecommendations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommended_actions.map((recommendation, index) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                  </div>
                  <div className="mr-3 flex-1">
                    <p className="text-sm text-gray-900">{recommendation}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('hardcoded.searchInAnalytics')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                  <SelectTrigger className="w-48">
                    <Filter className="ml-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('aiRecommendations.allAnalyses')}</SelectItem>
                    <SelectItem value="lead_scoring">{t('aiRecommendations.leadScoring')}</SelectItem>
                    <SelectItem value="sales_forecasting">{t('aiRecommendations.salesForecasting')}</SelectItem>
                    <SelectItem value="customer_segmentation">{t('aiRecommendations.customerSegmentation')}</SelectItem>
                    <SelectItem value="market_analysis">{t('aiRecommendations.marketAnalysis')}</SelectItem>
                    <SelectItem value="churn_prediction">{t('aiRecommendations.churnPrediction')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="ml-2 h-5 w-5" />
              {t('aiRecommendations.analysisLog')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('aiRecommendations.analysisType')}</TableHead>
                  <TableHead>{t('aiRecommendations.status')}</TableHead>
                  <TableHead>{t('aiRecommendations.confidenceScore')}</TableHead>
                  <TableHead>{t('aiRecommendations.keyInsights')}</TableHead>
                  <TableHead>{t('aiRecommendations.executionDate')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.map((analysis: AIAnalysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getAnalysisTypeIcon(analysis.analysis_type)}
                        <span className="mr-2">{getAnalysisTypeLabel(analysis.analysis_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                    <TableCell>
                      {analysis.confidence_score ? (
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <Progress value={analysis.confidence_score} className="h-2" />
                          </div>
                          <span className={`text-sm font-medium ${getConfidenceColor(analysis.confidence_score)}`}>
                            {analysis.confidence_score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">{t('common.noData')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {analysis.insights ? (
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          {t('common.view')}
                        </Button>
                      ) : (
                        <span className="text-gray-400">{t('common.noData')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(analysis.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Market Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="ml-2 h-5 w-5" />
              {t('aiRecommendations.marketTrends')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">{t('aiRecommendations.upwardTrend')}</h3>
                <p className="text-sm text-green-600 mt-1">{t('aiRecommendations.increasedDemand')}</p>
                <div className="text-2xl font-bold text-green-700 mt-2">{t('aiRecommendations.growthPercentage')}</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800">{t('aiRecommendations.priceStability')}</h3>
                <p className="text-sm text-blue-600 mt-1">{t('aiRecommendations.stablePrices')}</p>
                <div className="text-2xl font-bold text-blue-700 mt-2">{t('aiRecommendations.priceValue')}</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-800">{t('aiRecommendations.customerActivity')}</h3>
                <p className="text-sm text-purple-600 mt-1">{t('aiRecommendations.increasedInquiries')}</p>
                <div className="text-2xl font-bold text-purple-700 mt-2">{t('aiRecommendations.inquiryIncrease')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 