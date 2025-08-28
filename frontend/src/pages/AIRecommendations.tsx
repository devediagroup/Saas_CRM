import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Building2,
  Handshake,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  PieChart,
  LineChart
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface AIRecommendation {
  id: number;
  recommendation_type: string;
  title: string;
  description: string;
  confidence_score: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'leads' | 'properties' | 'deals' | 'marketing' | 'operations';
  status: 'pending' | 'applied' | 'rejected' | 'expired';
  target_entity?: {
    id: number;
    type: string;
    name: string;
  };
  expected_impact: {
    revenue_increase?: number;
    time_savings?: number;
    conversion_improvement?: number;
  };
  implementation_steps: string[];
  createdAt: string;
  applied_at?: string;
  result?: string;
}

interface ClientScoring {
  id: number;
  lead: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    budget_alignment: number;
    urgency_level: number;
    decision_making: number;
    communication_quality: number;
    property_preferences: number;
  };
  recommendations: string[];
  next_best_action: string;
  createdAt: string;
}

interface DealForecast {
  id: number;
  deal: {
    id: number;
    title: string;
  };
  probability: number;
  predicted_value: number;
  confidence_interval: {
    min: number;
    max: number;
  };
  factors: {
    lead_score: number;
    property_match: number;
    market_conditions: number;
    competitor_activity: number;
  };
  risks: string[];
  recommendations: string[];
  forecast_date: string;
}

const AIRecommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch AI recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['ai-recommendations', selectedCategory, selectedPriority],
    queryFn: () => apiClient.get('/smart-recommendations', {
      params: {
        ...(selectedCategory !== 'all' && { 'filters[category][$eq]': selectedCategory }),
        ...(selectedPriority !== 'all' && { 'filters[priority][$eq]': selectedPriority }),
        'sort[0]': 'createdAt:desc',
        'populate[0]': 'target_entity'
      }
    })
  });

  // Fetch client scoring
  const { data: clientScoringData, isLoading: clientLoading } = useQuery({
    queryKey: ['client-scoring'],
    queryFn: () => apiClient.get('/client-scoring', {
      params: {
        'sort[0]': 'score:desc',
        'populate[0]': 'lead'
      }
    })
  });

  // Fetch deal forecasts
  const { data: dealForecastsData, isLoading: forecastsLoading } = useQuery({
    queryKey: ['deal-forecasts'],
    queryFn: () => apiClient.get('/deal-forecast', {
      params: {
        'sort[0]': 'probability:desc',
        'populate[0]': 'deal'
      }
    })
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/smart-recommendations/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success(t('aiRecommendations.messages.recommendationsGenerated'));
      setIsGeneratingRecommendations(false);
    },
    onError: () => {
      toast.error(t('aiRecommendations.messages.generateError'));
      setIsGeneratingRecommendations(false);
    }
  });

  // Apply recommendation mutation
  const applyRecommendationMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback?: string }) =>
      apiClient.put(`/smart-recommendations/${id}/apply`, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success(t('aiRecommendations.messages.recommendationApplied'));
    },
    onError: () => {
      toast.error(t('aiRecommendations.messages.applyError'));
    }
  });

  // Reject recommendation mutation
  const rejectRecommendationMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: string }) =>
      apiClient.put(`/smart-recommendations/${id}/reject`, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success(t('aiRecommendations.messages.recommendationRejected'));
    },
    onError: () => {
      toast.error(t('aiRecommendations.messages.rejectError'));
    }
  });

  const recommendations = recommendationsData?.data?.data || [];
  const clientScores = clientScoringData?.data?.data || [];
  const dealForecasts = dealForecastsData?.data?.data || [];

  const generateRecommendations = () => {
    setIsGeneratingRecommendations(true);
    generateRecommendationsMutation.mutate({
      category: selectedCategory,
      priority: selectedPriority
    });
  };

  const handleApplyRecommendation = (recommendation: AIRecommendation) => {
    if (confirm(t('aiRecommendations.applyConfirm'))) {
      applyRecommendationMutation.mutate({ id: recommendation.id });
    }
  };

  const handleRejectRecommendation = (recommendation: AIRecommendation) => {
    const feedback = prompt(t('aiRecommendations.rejectPrompt'));
    rejectRecommendationMutation.mutate({
      id: recommendation.id,
      feedback: feedback || t('aiRecommendations.noReason')
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'leads': return 'bg-blue-100 text-blue-800';
      case 'properties': return 'bg-purple-100 text-purple-800';
      case 'deals': return 'bg-green-100 text-green-800';
      case 'marketing': return 'bg-orange-100 text-orange-800';
      case 'operations': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'leads': return t('aiRecommendations.leads');
      case 'properties': return t('aiRecommendations.properties');
      case 'deals': return t('aiRecommendations.deals');
      case 'marketing': return t('aiRecommendations.marketing');
      case 'operations': return t('aiRecommendations.operations');
      default: return category;
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold arabic-text">{t('aiRecommendations.title')}</h1>
            <p className="text-muted-foreground arabic-text mt-2">
              {t('aiRecommendations.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateRecommendations}
              disabled={isGeneratingRecommendations}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingRecommendations ? 'animate-spin' : ''}`} />
              {t('aiRecommendations.generateRecommendations')}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('aiRecommendations.activeRecommendations')}</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {recommendations.filter((r: AIRecommendation) => r.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('aiRecommendations.needReview')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('aiRecommendations.successRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {recommendations.length > 0
                  ? formatPercentage((recommendations.filter((r: AIRecommendation) => r.status === 'applied').length / recommendations.length) * 100)
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('aiRecommendations.appliedRecommendations')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('aiRecommendations.averageConfidence')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {recommendations.length > 0
                  ? formatPercentage(recommendations.reduce((sum: number, r: AIRecommendation) => sum + r.confidence_score, 0) / recommendations.length)
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {t('aiRecommendations.inRecommendations')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium arabic-text">{t('aiRecommendations.classifiedClients')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold arabic-text">
                {clientScores.length}
              </div>
              <p className="text-xs text-muted-foreground arabic-text">
                {clientScores.filter((c: ClientScoring) => c.grade === 'A').length} {t('aiRecommendations.gradeA')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('aiRecommendations.category')} />
            </SelectTrigger>
            <SelectContent>
                              <SelectItem value="all">{t('aiRecommendations.allCategories')}</SelectItem>
                <SelectItem value="leads">{t('aiRecommendations.leads')}</SelectItem>
                <SelectItem value="properties">{t('aiRecommendations.properties')}</SelectItem>
                <SelectItem value="deals">{t('aiRecommendations.deals')}</SelectItem>
                <SelectItem value="marketing">{t('aiRecommendations.marketing')}</SelectItem>
                <SelectItem value="operations">{t('aiRecommendations.operations')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('aiRecommendations.priority')} />
            </SelectTrigger>
            <SelectContent>
                              <SelectItem value="all">{t('aiRecommendations.allPriorities')}</SelectItem>
                <SelectItem value="urgent">{t('aiRecommendations.urgent')}</SelectItem>
                <SelectItem value="high">{t('aiRecommendations.high')}</SelectItem>
                <SelectItem value="medium">{t('aiRecommendations.medium')}</SelectItem>
                <SelectItem value="low">{t('aiRecommendations.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI Analysis Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t('aiRecommendations.recommendations')}
            </TabsTrigger>
            <TabsTrigger value="client-scoring" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('aiRecommendations.clientScoring')}
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('aiRecommendations.dealForecasts')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">{t('aiRecommendations.smartRecommendations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="arabic-text">{t('aiRecommendations.recommendation')}</TableHead>
                      <TableHead className="arabic-text">{t('aiRecommendations.category')}</TableHead>
                      <TableHead className="arabic-text">{t('aiRecommendations.priority')}</TableHead>
                      <TableHead className="arabic-text">{t('aiRecommendations.confidence')}</TableHead>
                      <TableHead className="arabic-text">{t('aiRecommendations.status')}</TableHead>
                      <TableHead className="arabic-text">{t('aiRecommendations.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendationsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {t('common.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : recommendations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t('common.noData')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      recommendations.map((recommendation: AIRecommendation) => (
                        <TableRow key={recommendation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium arabic-text">{recommendation.title}</div>
                              <div className="text-sm text-muted-foreground arabic-text line-clamp-2">
                                {recommendation.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(recommendation.category)}>
                              {getCategoryLabel(recommendation.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={recommendation.confidence_score} className="w-16" />
                              <span className="text-sm arabic-text">
                                {formatPercentage(recommendation.confidence_score)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              recommendation.status === 'applied' ? 'bg-green-100 text-green-800' :
                              recommendation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              recommendation.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {recommendation.status === 'applied' ? t('aiRecommendations.applied') :
                               recommendation.status === 'rejected' ? t('aiRecommendations.rejected') :
                               recommendation.status === 'expired' ? t('aiRecommendations.expired') : t('aiRecommendations.pending')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {recommendation.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApplyRecommendation(recommendation)}
                                    className="h-8"
                                  >
                                    <ThumbsUp className="h-3 w-3 ml-1" />
                                    {t('aiRecommendations.apply')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectRecommendation(recommendation)}
                                    className="h-8"
                                  >
                                    <ThumbsDown className="h-3 w-3 ml-1" />
                                    {t('aiRecommendations.reject')}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client-scoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-text">{t('aiRecommendations.clientScoring')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="arabic-text">{t('aiRecommendations.client')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.grade')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.score')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.nextRecommendation')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              {t('common.loading')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : clientScores.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {t('common.noData')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        clientScores.slice(0, 10).map((client: ClientScoring) => (
                          <TableRow key={client.id}>
                            <TableCell>
                              <div className="arabic-text">
                                {client.lead.first_name} {client.lead.last_name}
                                <div className="text-sm text-muted-foreground">
                                  {client.lead.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getGradeColor(client.grade)}>
                                {t('aiRecommendations.grade')} {client.grade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={client.score} className="w-16" />
                                <span className="text-sm arabic-text">
                                  {client.score}/100
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="arabic-text text-sm">
                              {client.next_best_action}
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
                  <CardTitle className="arabic-text">{t('aiRecommendations.gradeDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                      const count = clientScores.filter((c: ClientScoring) => c.grade === grade).length;
                      const percentage = clientScores.length > 0 ? (count / clientScores.length) * 100 : 0;
                      return (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getGradeColor(grade)}>
                              {t('aiRecommendations.grade')} {grade}
                            </Badge>
                            <span className="arabic-text">{count} {t('aiRecommendations.clientCount')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-20" />
                            <span className="text-sm arabic-text">
                              {formatPercentage(percentage)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <Card>
              <CardHeader>
                                  <CardTitle className="arabic-text">{t('aiRecommendations.dealForecast')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                                              <TableHead className="arabic-text">{t('aiRecommendations.deal')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.probability')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.expectedValue')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.confidenceRange')}</TableHead>
                        <TableHead className="arabic-text">{t('aiRecommendations.recommendationsList')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecastsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            {t('common.loading')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : dealForecasts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                      {t('common.noData')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      dealForecasts.map((forecast: DealForecast) => (
                        <TableRow key={forecast.id}>
                          <TableCell className="arabic-text">{forecast.deal.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={forecast.probability} className="w-16" />
                              <span className="text-sm arabic-text">
                                {formatPercentage(forecast.probability)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="arabic-text">
                            {formatCurrency(forecast.predicted_value)}
                          </TableCell>
                          <TableCell className="arabic-text text-sm">
                            {formatCurrency(forecast.confidence_interval.min)} - {formatCurrency(forecast.confidence_interval.max)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm arabic-text">
                              {forecast.recommendations.slice(0, 2).join(', ')}
                              {forecast.recommendations.length > 2 && '...'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AIRecommendations;
