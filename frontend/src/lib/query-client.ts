import { QueryClient } from '@tanstack/react-query';

// Default query options for better performance
const defaultQueryOptions = {
  queries: {
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Keep data in cache for 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

    // Retry failed requests 3 times
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus for critical data
    refetchOnWindowFocus: false,

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Network mode
    networkMode: 'online' as const,
  },

  mutations: {
    // Retry mutations once
    retry: 1,

    // Network mode
    networkMode: 'online' as const,
  },
};

// Create optimized QueryClient
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Query keys for consistent caching
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },

  // Leads
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.leads.details(), id] as const,
  },

  // Properties
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.properties.details(), id] as const,
  },

  // Deals
  deals: {
    all: ['deals'] as const,
    lists: () => [...queryKeys.deals.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.deals.lists(), filters] as const,
    details: () => [...queryKeys.deals.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.deals.details(), id] as const,
  },

  // Companies
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.companies.details(), id] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: () => [...queryKeys.analytics.all, 'overview'] as const,
    leads: (period: string) => [...queryKeys.analytics.all, 'leads', period] as const,
    deals: (period: string) => [...queryKeys.analytics.all, 'deals', period] as const,
    revenue: (period: string) => [...queryKeys.analytics.all, 'revenue', period] as const,
  },

  // WhatsApp
  whatsapp: {
    all: ['whatsapp'] as const,
    chats: () => [...queryKeys.whatsapp.all, 'chats'] as const,
    messages: (chatId: string | number) => [...queryKeys.whatsapp.all, 'messages', chatId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    recent: (limit: number) => [...queryKeys.notifications.all, 'recent', limit] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
    company: () => [...queryKeys.settings.all, 'company'] as const,
    notifications: () => [...queryKeys.settings.all, 'notifications'] as const,
  },
};

// Prefetch functions for better UX
export const prefetchQueries = {
  // Prefetch user data
  userData: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.auth.user,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },

  // Prefetch dashboard data
  dashboardData: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.analytics.overview(),
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  },

  // Prefetch leads list
  leadsList: (filters = {}) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.leads.list(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },
};

// Cache management utilities
export const cacheUtils = {
  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  },

  // Clear specific entity cache
  clearEntity: (entity: keyof typeof queryKeys) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys[entity].all,
    });
  },

  // Prefetch on app start
  prefetchOnStart: () => {
    prefetchQueries.userData();
    prefetchQueries.dashboardData();
  },

  // Set up background refetching for critical data
  setupBackgroundRefetch: () => {
    // Refetch user data every 10 minutes
    setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.user,
      });
    }, 1000 * 60 * 10);

    // Refetch notifications every 2 minutes
    setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unread(),
      });
    }, 1000 * 60 * 2);
  },
};

export default queryClient;
