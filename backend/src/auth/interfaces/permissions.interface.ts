export interface Permission {
  resource: string;
  action: string;
  description: string;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

export interface UserPermissions {
  userId: string;
  customPermissions: Record<string, boolean>;
  rolePermissions: string[];
}

// Common permission patterns
export const PERMISSION_PATTERNS = {
  // Users
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ALL: 'users.*',

  // Companies
  COMPANIES_READ: 'companies.read',
  COMPANIES_CREATE: 'companies.create',
  COMPANIES_UPDATE: 'companies.update',
  COMPANIES_DELETE: 'companies.delete',
  COMPANIES_ALL: 'companies.*',

  // Leads
  LEADS_READ: 'leads.read',
  LEADS_CREATE: 'leads.create',
  LEADS_UPDATE: 'leads.update',
  LEADS_DELETE: 'leads.delete',
  LEADS_ALL: 'leads.*',

  // Properties
  PROPERTIES_READ: 'properties.read',
  PROPERTIES_CREATE: 'properties.create',
  PROPERTIES_UPDATE: 'properties.update',
  PROPERTIES_DELETE: 'properties.delete',
  PROPERTIES_ALL: 'properties.*',

  // Deals
  DEALS_READ: 'deals.read',
  DEALS_CREATE: 'deals.create',
  DEALS_UPDATE: 'deals.update',
  DEALS_DELETE: 'deals.delete',
  DEALS_ALL: 'deals.*',

  // Activities
  ACTIVITIES_READ: 'activities.read',
  ACTIVITIES_CREATE: 'activities.create',
  ACTIVITIES_UPDATE: 'activities.update',
  ACTIVITIES_DELETE: 'activities.delete',
  ACTIVITIES_ALL: 'activities.*',

  // Developers
  DEVELOPERS_READ: 'developers.read',
  DEVELOPERS_CREATE: 'developers.create',
  DEVELOPERS_UPDATE: 'developers.update',
  DEVELOPERS_DELETE: 'developers.delete',
  DEVELOPERS_ALL: 'developers.*',

  // Projects
  PROJECTS_READ: 'projects.read',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_ALL: 'projects.*',

  // Analytics
  ANALYTICS_READ: 'analytics.read',
  ANALYTICS_CREATE: 'analytics.create',
  ANALYTICS_UPDATE: 'analytics.update',
  ANALYTICS_DELETE: 'analytics.delete',
  ANALYTICS_ALL: 'analytics.*',

  // Reports
  REPORTS_READ: 'reports.read',
  REPORTS_CREATE: 'reports.create',
  REPORTS_UPDATE: 'reports.update',
  REPORTS_DELETE: 'reports.delete',
  REPORTS_ALL: 'reports.*',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_CREATE: 'settings.create',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_DELETE: 'settings.delete',
  SETTINGS_ALL: 'settings.*',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_CREATE: 'notifications.create',
  NOTIFICATIONS_UPDATE: 'notifications.update',
  NOTIFICATIONS_DELETE: 'notifications.delete',
  NOTIFICATIONS_ALL: 'notifications.*',

  // Payments
  PAYMENTS_READ: 'payments.read',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_UPDATE: 'payments.update',
  PAYMENTS_DELETE: 'payments.delete',
  PAYMENTS_ALL: 'payments.*',

  // AI Analysis
  AI_READ: 'ai.read',
  AI_CREATE: 'ai.create',
  AI_UPDATE: 'ai.update',
  AI_DELETE: 'ai.delete',
  AI_ALL: 'ai.*',

  // Marketing Campaigns
  CAMPAIGNS_READ: 'campaigns.read',
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_UPDATE: 'campaigns.update',
  CAMPAIGNS_DELETE: 'campaigns.delete',
  CAMPAIGNS_ALL: 'campaigns.*',

  // Special Permissions
  LEADS_ASSIGN: 'leads.assign',
  DEALS_APPROVE: 'deals.approve',
  AUDIT_LOGS_READ: 'audit.read',
} as const;
