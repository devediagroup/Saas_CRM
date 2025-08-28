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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Globe,
  Activity,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Settings,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building,
  Users,
  Target,
  Upload,
  MessageSquare,
  Bell
} from 'lucide-react';
import { apiClient } from '../lib/api';

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
  severity?: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
  error_message?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AuditLogs() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.get('/audit-logs?populate=*&sort[0]=createdAt:desc').then(res => res.data.data || [])
  });

  // Fetch users for filter
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then(res => res.data || [])
  });

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
      case 'export':
        return <Download className="h-4 w-4 text-purple-500" />;
      case 'import':
        return <Upload className="h-4 w-4 text-orange-500" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType?.toLowerCase()) {
      case 'lead':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'property':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'deal':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-orange-500" />;
      case 'company':
        return <Building className="h-4 w-4 text-indigo-500" />;
      case 'user':
        return <User className="h-4 w-4 text-gray-500" />;
      case 'whatsapp-message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'notification':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      create: t('auditLogs.actions.create'),
      update: t('auditLogs.actions.update'),
      delete: t('auditLogs.actions.delete'),
      login: t('auditLogs.actions.login'),
      logout: t('auditLogs.actions.logout'),
      view: t('auditLogs.actions.view'),
      export: t('auditLogs.actions.export'),
      import: t('auditLogs.actions.import'),
      settings: t('auditLogs.actions.settings'),
      approve: t('auditLogs.actions.approve'),
      reject: t('auditLogs.actions.reject'),
      archive: t('auditLogs.actions.archive'),
      restore: t('auditLogs.actions.restore')
    };
    return labels[action as keyof typeof labels] || action;
  };

  const getResourceLabel = (resourceType: string) => {
    const labels = {
      lead: t('auditLogs.resources.lead'),
      property: t('auditLogs.resources.property'),
      deal: t('auditLogs.resources.deal'),
      activity: t('auditLogs.resources.activity'),
      company: t('auditLogs.resources.company'),
      user: t('auditLogs.resources.user'),
      'whatsapp-message': t('auditLogs.resources.whatsappMessage'),
      notification: t('auditLogs.resources.notification'),
      'lead-source': t('auditLogs.resources.leadSource'),
      'subscription-plan': t('auditLogs.resources.subscriptionPlan'),
      'billing-history': t('auditLogs.resources.billingHistory')
    };
    return labels[resourceType as keyof typeof labels] || resourceType;
  };

  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        {t('auditLogs.status.success')}
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        {t('auditLogs.status.failed')}
      </Badge>
    );
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    const severityConfig = {
      low: { label: t('auditLogs.status.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('auditLogs.status.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('auditLogs.status.high'), color: 'bg-orange-100 text-orange-800' },
      critical: { label: t('auditLogs.status.critical'), color: 'bg-red-100 text-red-800' }
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig];
    if (!config) return null;
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsDialogOpen(true);
  };

  // Filter logs
  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    const matchesUser = userFilter === 'all' || log.user?.id?.toString() === userFilter;
    
    return matchesSearch && matchesAction && matchesResource && matchesUser;
  });

  // Calculate statistics
  const totalLogs = auditLogs.length;
  const successfulActions = auditLogs.filter((log: AuditLog) => log.success).length;
  const failedActions = totalLogs - successfulActions;
  const uniqueUsers = new Set(auditLogs.map((log: AuditLog) => log.user?.id).filter(Boolean)).size;
  
  // Get unique actions and resources for filters
  const uniqueActions = Array.from(new Set(auditLogs.map((log: AuditLog) => log.action).filter(Boolean)));
  const uniqueResources = Array.from(new Set(auditLogs.map((log: AuditLog) => log.resource_type).filter(Boolean)));

  // Recent activity summary
  const recentActivity = auditLogs.slice(0, 10);

  if (isLoadingLogs) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('auditLogs.loading')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('auditLogs.title')}</h1>
            <p className="text-gray-600 mt-1">{t('auditLogs.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="ml-2 h-4 w-4" />
              {t('auditLogs.refresh')}
            </Button>
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              {t('auditLogs.exportLog')}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('auditLogs.totalOperations')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalLogs}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('auditLogs.successfulOperations')}</p>
                  <p className="text-3xl font-bold text-green-600">{successfulActions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('auditLogs.failedOperations')}</p>
                  <p className="text-3xl font-bold text-red-600">{failedActions}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('auditLogs.activeUsers')}</p>
                  <p className="text-3xl font-bold text-purple-600">{uniqueUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="ml-2 h-5 w-5" />
              {t('auditLogs.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((log: AuditLog) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getActionIcon(log.action)}
                    <div className="mr-3">
                      <div className="text-sm font-medium">
                        {getActionLabel(log.action)} - {getResourceLabel(log.resource_type)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.user?.email || t('auditLogs.system')} • {log.ip_address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString('ar-SA')}
                    </div>
                    <div className="mt-1">
                      {getSuccessBadge(log.success)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('auditLogs.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </div>
              <div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auditLogs.action')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allActions')}</SelectItem>
                    {uniqueActions.map((action: string) => (
                      <SelectItem key={action} value={action}>
                        {getActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auditLogs.resourceType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allResources')}</SelectItem>
                    {uniqueResources.map((resource: string) => (
                      <SelectItem key={resource} value={resource}>
                        {getResourceLabel(resource)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auditLogs.user')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allUsers')}</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auditLogs.period')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('auditLogs.allTimes')}</SelectItem>
                    <SelectItem value="today">{t('auditLogs.today')}</SelectItem>
                    <SelectItem value="week">{t('auditLogs.thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('auditLogs.thisMonth')}</SelectItem>
                    <SelectItem value="year">{t('auditLogs.thisYear')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="ml-2 h-5 w-5" />
              {t('auditLogs.detailedLogs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('auditLogs.action')}</TableHead>
                  <TableHead>{t('auditLogs.resourceType')}</TableHead>
                  <TableHead>{t('auditLogs.user')}</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>{t('auditLogs.details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: AuditLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="mr-2">{getActionLabel(log.action)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getResourceIcon(log.resource_type)}
                        <div className="mr-2">
                          <div className="font-medium text-sm">
                            {getResourceLabel(log.resource_type)}
                          </div>
                          {log.resource_id && (
                            <div className="text-xs text-gray-500">
                              ID: {log.resource_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div>
                          <div className="font-medium text-sm">{log.user.username}</div>
                          <div className="text-xs text-gray-500">{log.user.email}</div>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <Settings className="h-4 w-4 mr-1" />
                          <span className="text-sm">{t('auditLogs.system')}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-3 w-3 text-gray-400 mr-1" />
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {log.ip_address}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getSuccessBadge(log.success)}
                        {log.severity && getSeverityBadge(log.severity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(log.createdAt).toLocaleTimeString('ar-SA')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {t('auditLogs.view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('auditLogs.operationDetails')}</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t('auditLogs.action')}:</label>
                    <div className="flex items-center mt-1">
                      {getActionIcon(selectedLog.action)}
                      <span className="mr-2">{getActionLabel(selectedLog.action)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t('auditLogs.resourceType')}:</label>
                    <div className="flex items-center mt-1">
                      {getResourceIcon(selectedLog.resource_type)}
                      <span className="mr-2">{getResourceLabel(selectedLog.resource_type)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t('auditLogs.user')}:</label>
                    <div className="mt-1">
                      {selectedLog.user ? (
                        <div>
                          <div className="font-medium">{selectedLog.user.username}</div>
                          <div className="text-sm text-gray-500">{selectedLog.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">{t('auditLogs.system')}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP {t('common.address')}:</label>
                    <div className="mt-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {selectedLog.ip_address}
                      </code>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">{t('auditLogs.userAgent')}:</label>
                  <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {selectedLog.user_agent}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">{t('auditLogs.result')}:</label>
                  <div className="mt-1">
                    {getSuccessBadge(selectedLog.success)}
                    {selectedLog.error_message && (
                      <div className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                        {selectedLog.error_message}
                      </div>
                    )}
                  </div>
                </div>

                {selectedLog.changes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t('auditLogs.changes')}:</label>
                    <div className="mt-1 text-sm bg-gray-50 p-3 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t('auditLogs.additionalData')}:</label>
                    <div className="mt-1 text-sm bg-gray-50 p-3 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">{t('common.date')} & {t('common.time')}:</label>
                  <div className="mt-1 text-sm text-gray-700">
                    {new Date(selectedLog.createdAt).toLocaleString('ar-SA')}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 