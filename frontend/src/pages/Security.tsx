import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity,
  Users,
  Globe,
  Server,
  Database,
  Wifi,
  Smartphone,
  Monitor,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Zap,
  Target,
  TrendingUp,
  XCircle,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface SecurityEvent {
  id: number;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  user_agent: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
  };
  description: string;
  metadata?: any;
  location?: string;
  is_blocked: boolean;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
  };
  ip_address: string;
  user_agent: string;
  changes?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export default function Security() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'events' | 'audit'>('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  // Fetch security events
  const { data: securityEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => apiClient.get('/security-events?populate=*&sort[0]=createdAt:desc').then(res => res.data.data || [])
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: isLoadingAudit } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.get('/audit-logs?populate=*&sort[0]=createdAt:desc').then(res => res.data.data || [])
  });

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { label: t('security.events.severity.low'), color: 'bg-green-100 text-green-800', icon: CheckCircle },
      medium: { label: t('security.events.severity.medium'), color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      high: { label: t('security.events.severity.high'), color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      critical: { label: t('security.events.severity.critical'), color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case 'login_attempt':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'failed_login':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'data_breach':
        return <Database className="h-4 w-4 text-red-500" />;
      case 'unauthorized_access':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'api_abuse':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'malware_detected':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'ddos_attack':
        return <Server className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'login':
        return <LogIn className="h-4 w-4 text-blue-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent?.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4 text-blue-500" />;
    }
    return <Monitor className="h-4 w-4 text-gray-500" />;
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels = {
      login_attempt: t('security.events.types.login_attempt'),
      failed_login: t('security.events.types.failed_login'),
      suspicious_activity: t('security.events.types.suspicious_activity'),
      data_breach: t('security.events.types.data_breach'),
      unauthorized_access: t('security.events.types.unauthorized_access'),
      api_abuse: t('security.events.types.api_abuse'),
      malware_detected: t('security.events.types.malware_detected'),
      ddos_attack: t('security.events.types.ddos_attack')
    };
    return labels[eventType as keyof typeof labels] || eventType;
  };

  const getActionLabel = (action: string) => {
    const labels = {
      create: t('security.audit.actions.create'),
      update: t('security.audit.actions.update'),
      delete: t('security.audit.actions.delete'),
      login: t('security.audit.actions.login'),
      logout: t('security.audit.actions.logout'),
      view: t('security.audit.actions.view')
    };
    return labels[action as keyof typeof labels] || action;
  };

  // Filter events
  const filteredEvents = securityEvents.filter((event: SecurityEvent) => {
    const matchesSearch = 
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source_ip?.includes(searchTerm) ||
      event.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log: AuditLog) => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate statistics
  const totalEvents = securityEvents.length;
  const criticalEvents = securityEvents.filter((e: SecurityEvent) => e.severity === 'critical').length;
  const highEvents = securityEvents.filter((e: SecurityEvent) => e.severity === 'high').length;
  const blockedEvents = securityEvents.filter((e: SecurityEvent) => e.is_blocked).length;
  const unresolvedEvents = securityEvents.filter((e: SecurityEvent) => !e.is_resolved).length;

  // Get recent activity
  const recentActivity = [...securityEvents, ...auditLogs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  if (isLoadingEvents || isLoadingAudit) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('security.loading')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('security.title')}</h1>
            <p className="text-gray-600 mt-1">{t('security.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="ml-2 h-4 w-4" />
              {t('security.actions.refresh')}
            </Button>
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              {t('security.actions.exportReport')}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('security.stats.totalEvents')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('security.stats.critical')}</p>
                  <p className="text-3xl font-bold text-red-600">{criticalEvents}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('security.stats.high')}</p>
                  <p className="text-3xl font-bold text-orange-600">{highEvents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('security.stats.blocked')}</p>
                  <p className="text-3xl font-bold text-green-600">{blockedEvents}</p>
                </div>
                <Lock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('security.stats.unresolved')}</p>
                  <p className="text-3xl font-bold text-yellow-600">{unresolvedEvents}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Threat Level Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="ml-2 h-5 w-5" />
              {t('security.threatLevel.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-orange-600">{t('security.threatLevel.medium')}</h3>
                <p className="text-sm text-gray-600">{t('security.threatLevel.basedOnEvents')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">65%</p>
                <p className="text-sm text-gray-600">{t('security.threatLevel.outOf')} 100</p>
              </div>
            </div>
            <Progress value={65} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{t('security.threatLevel.low')}</span>
              <span>{t('security.threatLevel.medium')}</span>
              <span>{t('security.threatLevel.high')}</span>
              <span>{t('security.threatLevel.critical')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('security.tabs.securityEvents')} ({securityEvents.length})
            </button>
            <button
              onClick={() => setSelectedTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('security.tabs.auditLog')} ({auditLogs.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('security.filters.searchEvents')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTab === 'events' && (
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="ml-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('security.filters.allLevels')}</SelectItem>
                      <SelectItem value="low">{t('security.filters.low')}</SelectItem>
                      <SelectItem value="medium">{t('security.filters.medium')}</SelectItem>
                      <SelectItem value="high">{t('security.filters.high')}</SelectItem>
                      <SelectItem value="critical">{t('security.filters.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <Calendar className="ml-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                                      <SelectContent>
                      <SelectItem value="today">{t('security.filters.today')}</SelectItem>
                      <SelectItem value="week">{t('security.filters.thisWeek')}</SelectItem>
                      <SelectItem value="month">{t('security.filters.thisMonth')}</SelectItem>
                      <SelectItem value="year">{t('security.filters.thisYear')}</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Events Table */}
        {selectedTab === 'events' && (
          <Card>
            <CardHeader>
                          <CardTitle className="flex items-center">
              <AlertTriangle className="ml-2 h-5 w-5" />
              {t('security.events.title')}
            </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('security.events.table.eventType')}</TableHead>
                    <TableHead>{t('security.events.table.severity')}</TableHead>
                    <TableHead>{t('security.events.table.description')}</TableHead>
                    <TableHead>{t('security.events.table.user')}</TableHead>
                    <TableHead>{t('security.events.table.ipAddress')}</TableHead>
                    <TableHead>{t('security.events.table.location')}</TableHead>
                    <TableHead>{t('security.events.table.status')}</TableHead>
                    <TableHead>{t('security.events.table.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event: SecurityEvent) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getEventTypeIcon(event.event_type)}
                          <span className="mr-2">{getEventTypeLabel(event.event_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{event.description}</p>
                          {event.user_agent && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              {getDeviceIcon(event.user_agent)}
                              <span className="mr-1 truncate">{event.user_agent}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.user ? (
                          <div>
                            <div className="font-medium text-sm">{event.user.username}</div>
                            <div className="text-xs text-gray-500">{event.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">{t('security.events.notSpecified')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-3 w-3 text-gray-400 mr-1" />
                          <code className="text-xs">{event.source_ip}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">{t('security.events.notSpecified')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {event.is_blocked && (
                            <Badge className="bg-red-100 text-red-800">{t('security.events.status.blocked')}</Badge>
                          )}
                          {event.is_resolved ? (
                            <Badge className="bg-green-100 text-green-800">{t('security.events.status.resolved')}</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">{t('security.events.status.pending')}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Audit Logs Table */}
        {selectedTab === 'audit' && (
          <Card>
            <CardHeader>
                          <CardTitle className="flex items-center">
              <Activity className="ml-2 h-5 w-5" />
              {t('security.audit.title')}
            </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('security.audit.table.action')}</TableHead>
                    <TableHead>{t('security.audit.table.resourceType')}</TableHead>
                    <TableHead>{t('security.audit.table.user')}</TableHead>
                    <TableHead>{t('security.audit.table.ipAddress')}</TableHead>
                    <TableHead>{t('security.audit.table.changes')}</TableHead>
                    <TableHead>{t('security.audit.table.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getActionIcon(log.action)}
                          <span className="mr-2">{getActionLabel(log.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div className="font-medium text-sm">{log.user.username}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">{t('security.audit.system')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-3 w-3 text-gray-400 mr-1" />
                          <code className="text-xs">{log.ip_address}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.changes ? (
                                                      <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              {t('security.audit.table.changes')}
                            </Button>
                        ) : (
                          <span className="text-gray-400">{t('security.audit.noChanges')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="ml-2 h-5 w-5" />
              {t('security.recentActivity.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {item.event_type ? (
                      <>
                        {getEventTypeIcon(item.event_type)}
                        <div className="mr-3">
                          <div className="text-sm font-medium">
                            {getEventTypeLabel(item.event_type)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description || t('security.recentActivity.securityEvent')}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {getActionIcon(item.action)}
                        <div className="mr-3">
                          <div className="text-sm font-medium">
                            {getActionLabel(item.action)} - {item.resource_type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.user?.email || t('security.audit.system')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                    {item.severity && (
                      <div className="mt-1">
                        {getSeverityBadge(item.severity)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 