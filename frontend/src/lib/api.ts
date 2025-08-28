import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  register: (data: { email: string; password: string; first_name: string; last_name: string; company_name: string }) =>
    apiClient.post('/auth/register', data),

  me: () => apiClient.get('/auth/me'),

  // Analytics
  getDashboard: () => apiClient.get('/analytics/dashboard'),

  // Leads
  getLeads: (params = {}) =>
    apiClient.get('/leads', { params }),

  getLead: (id: string) =>
    apiClient.get(`/leads/${id}`),

  createLead: (data: Record<string, unknown>) =>
    apiClient.post('/leads', data),

  updateLead: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/leads/${id}`, data),

  deleteLead: (id: string) =>
    apiClient.delete(`/leads/${id}`),

  // Properties
  getProperties: (params = {}) =>
    apiClient.get('/properties', { params }),

  getProperty: (id: string) =>
    apiClient.get(`/properties/${id}`),

  createProperty: (data: Record<string, unknown>) =>
    apiClient.post('/properties', data),

  updateProperty: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/properties/${id}`, data),

  deleteProperty: (id: string) =>
    apiClient.delete(`/properties/${id}`),

  // Deals
  getDeals: (params = {}) =>
    apiClient.get('/deals', { params }),

  getDeal: (id: string) =>
    apiClient.get(`/deals/${id}`),

  createDeal: (data: Record<string, unknown>) =>
    apiClient.post('/deals', data),

  updateDeal: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/deals/${id}`, data),

  deleteDeal: (id: string) =>
    apiClient.delete(`/deals/${id}`),

  // Activities
  getActivities: (params = {}) =>
    apiClient.get('/activities', { params }),

  getActivity: (id: string) =>
    apiClient.get(`/activities/${id}`),

  createActivity: (data: Record<string, unknown>) =>
    apiClient.post('/activities', data),

  updateActivity: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/activities/${id}`, data),

  deleteActivity: (id: string) =>
    apiClient.delete(`/activities/${id}`),

  // Companies
  getCompanies: (params = {}) =>
    apiClient.get('/companies', { params }),

  getCompany: (id: string) =>
    apiClient.get(`/companies/${id}`),

  createCompany: (data: Record<string, unknown>) =>
    apiClient.post('/companies', data),

  updateCompany: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/companies/${id}`, data),

  deleteCompany: (id: string) =>
    apiClient.delete(`/companies/${id}`),

  // Lead Sources
  getLeadSources: (params = {}) =>
    apiClient.get('/lead-sources', { params }),

  getLeadSource: (id: string) =>
    apiClient.get(`/lead-sources/${id}`),

  createLeadSource: (data: Record<string, unknown>) =>
    apiClient.post('/lead-sources', data),

  updateLeadSource: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/lead-sources/${id}`, data),

  deleteLeadSource: (id: string) =>
    apiClient.delete(`/lead-sources/${id}`),

  // WhatsApp Chats
  getWhatsAppChats: (params = {}) =>
    apiClient.get('/whatsapp', { params }),

  getWhatsAppChat: (id: string) =>
    apiClient.get(`/whatsapp/${id}`),

  createWhatsAppChat: (data: Record<string, unknown>) =>
    apiClient.post('/whatsapp', data),

  updateWhatsAppChat: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/whatsapp/${id}`, data),

  deleteWhatsAppChat: (id: string) =>
    apiClient.delete(`/whatsapp/${id}`),

  // WhatsApp Messages
  getWhatsAppMessages: (params = {}) =>
    apiClient.get('/whatsapp/messages', { params }),

  createWhatsAppMessage: (data: Record<string, unknown>) =>
    apiClient.post('/whatsapp/messages', data),

  // File Upload
  upload: (formData: FormData) =>
    apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Notifications
  getNotifications: (params = {}) =>
    apiClient.get('/notifications', { params }),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),

  markNotificationAsRead: (id: string) =>
    apiClient.put(`/notifications/${id}/mark-read`),

  markAllNotificationsAsRead: () =>
    apiClient.put('/notifications/mark-all-read'),

  archiveNotification: (id: string) =>
    apiClient.put(`/notifications/${id}/archive`),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),

  clearAllNotifications: () =>
    apiClient.delete('/notifications/clear-all'),

  // Roles & Permissions
  getRoles: (params = {}) =>
    apiClient.get('/roles', { params }),

  getRole: (id: string) =>
    apiClient.get(`/roles/${id}`),

  createRole: (data: Record<string, unknown>) =>
    apiClient.post('/roles', data),

  updateRole: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/roles/${id}`, data),

  deleteRole: (id: string) =>
    apiClient.delete(`/roles/${id}`),

  getPermissions: (params = {}) =>
    apiClient.get('/permissions', { params }),

  getPermission: (id: string) =>
    apiClient.get(`/permissions/${id}`),

  createPermission: (data: Record<string, unknown>) =>
    apiClient.post('/permissions', data),

  updatePermission: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/permissions/${id}`, data),

  deletePermission: (id: string) =>
    apiClient.delete(`/permissions/${id}`),

  // Teams Management
  getTeams: (params = {}) =>
    apiClient.get('/teams', { params }),

  getTeam: (id: string) =>
    apiClient.get(`/teams/${id}`),

  createTeam: (data: Record<string, unknown>) =>
    apiClient.post('/teams', data),

  updateTeam: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/teams/${id}`, data),

  deleteTeam: (id: string) =>
    apiClient.delete(`/teams/${id}`),

  // Tasks & Appointments
  getTasks: (params = {}) =>
    apiClient.get('/tasks', { params }),

  getTask: (id: string) =>
    apiClient.get(`/tasks/${id}`),

  createTask: (data: Record<string, unknown>) =>
    apiClient.post('/tasks', data),

  updateTask: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/tasks/${id}`, data),

  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`),

  // Advanced Reports & Analytics
  getAnalytics: (params = {}) =>
    apiClient.get('/analytics', { params }),

  getSalesReports: (params = {}) =>
    apiClient.get('/analytics/sales', { params }),

  getCustomerReports: (params = {}) =>
    apiClient.get('/analytics/customers', { params }),

  getDealReports: (params = {}) =>
    apiClient.get('/analytics/deals', { params }),

  getMarketingReports: (params = {}) =>
    apiClient.get('/analytics/marketing', { params }),

  getExportFunctionality: (params = {}) =>
    apiClient.get('/analytics/export', { params }),

  // Marketing Campaigns
  getMarketingCampaigns: (params = {}) =>
    apiClient.get('/marketing-campaigns', { params }),

  getMarketingCampaign: (id: string) =>
    apiClient.get(`/marketing-campaigns/${id}`),

  createMarketingCampaign: (data: Record<string, unknown>) =>
    apiClient.post('/marketing-campaigns', data),

  updateMarketingCampaign: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/marketing-campaigns/${id}`, data),

  deleteMarketingCampaign: (id: string) =>
    apiClient.delete(`/marketing-campaigns/${id}`),

  // Campaign Tracking
  getCampaignTracking: (params = {}) =>
    apiClient.get('/campaign-tracking', { params }),

  // AI & Recommendations
  getSmartRecommendations: (params = {}) =>
    apiClient.get('/ai/recommendations', { params }),

  getClientScoring: (params = {}) =>
    apiClient.get('/ai/scoring', { params }),

  getDealForecast: (params = {}) =>
    apiClient.get('/ai/forecast', { params }),

  getAIInsights: (params = {}) =>
    apiClient.get('/ai/insights', { params }),

  getTeamPerformanceAnalytics: (params = {}) =>
    apiClient.get('/ai/team-performance', { params }),

  // Lead Lifecycle
  getLeadLifecycles: (params = {}) =>
    apiClient.get('/lead-lifecycle', { params }),

  getLeadLifecycle: (id: string) =>
    apiClient.get(`/lead-lifecycle/${id}`),

  createLeadLifecycle: (data: Record<string, unknown>) =>
    apiClient.post('/lead-lifecycle', data),

  updateLeadLifecycle: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/lead-lifecycle/${id}`, data),

  deleteLeadLifecycle: (id: string) =>
    apiClient.delete(`/lead-lifecycle/${id}`),

  // Deals Kanban - Enhanced APIs
  getDealsKanban: (params = {}) =>
    apiClient.get('/deals', { params }),

  updateDealStage: (id: string, stage: string) =>
    apiClient.put(`/deals/${id}`, { stage }),

  // Payments & Subscriptions
  getSubscriptionPlans: (params = {}) =>
    apiClient.get('/payments/plans', { params }),

  getCompanySubscriptions: (params = {}) =>
    apiClient.get('/payments/subscriptions', { params }),

  getCompanySubscription: (id: string) =>
    apiClient.get(`/payments/subscriptions/${id}`),

  createCompanySubscription: (data: Record<string, unknown>) =>
    apiClient.post('/payments/subscriptions', data),

  updateCompanySubscription: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/payments/subscriptions/${id}`, data),

  deleteCompanySubscription: (id: string) =>
    apiClient.delete(`/payments/subscriptions/${id}`),

  getBillingHistories: (params = {}) =>
    apiClient.get('/payments/billing', { params }),

  getBillingHistory: (id: string) =>
    apiClient.get(`/payments/billing/${id}`),

  createBillingHistory: (data: Record<string, unknown>) =>
    apiClient.post('/payments/billing', data),

  updateBillingHistory: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/payments/billing/${id}`, data),

  deleteBillingHistory: (id: string) =>
    apiClient.delete(`/payments/billing/${id}`),

  // Profile & Settings
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put('/auth/profile', data),

  updatePassword: (data: Record<string, unknown>) =>
    apiClient.put('/auth/change-password', data),
};

export default apiClient;
export { apiClient }; 