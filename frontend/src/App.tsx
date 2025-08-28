import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuspenseWrapper } from "@/components/ui/loading";
import { queryClient, cacheUtils } from "@/lib/query-client";

// Critical pages - loaded immediately
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy loaded pages - loaded on demand
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Activities = React.lazy(() => import("./pages/Activities"));
const Leads = React.lazy(() => import("./pages/Leads"));
const Properties = React.lazy(() => import("./pages/Properties"));
const Deals = React.lazy(() => import("./pages/Deals"));
const Companies = React.lazy(() => import("./pages/Companies"));
const LeadSources = React.lazy(() => import("./pages/LeadSources"));
const WhatsApp = React.lazy(() => import("./pages/WhatsApp"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Notifications = React.lazy(() => import("./pages/Notifications"));

// Admin pages - loaded separately
const Subscriptions = React.lazy(() => import("./pages/Subscriptions"));
const Billing = React.lazy(() => import("./pages/Billing"));
const UsageTracking = React.lazy(() => import("./pages/UsageTracking"));
const FeatureFlags = React.lazy(() => import("./pages/FeatureFlags"));
const Security = React.lazy(() => import("./pages/Security"));
const AIAnalysis = React.lazy(() => import("./pages/AIAnalysis"));
const AuditLogs = React.lazy(() => import("./pages/AuditLogs"));
const Profile = React.lazy(() => import("./pages/Profile"));

// Advanced features - loaded separately
const RolesPermissions = React.lazy(() => import("./pages/RolesPermissions"));
const TeamsManagement = React.lazy(() => import("./pages/TeamsManagement"));
const TasksAppointments = React.lazy(() => import("./pages/TasksAppointments"));
const AdvancedReports = React.lazy(() => import("./pages/AdvancedReports"));
const MarketingCampaigns = React.lazy(() => import("./pages/MarketingCampaigns"));
const AIRecommendations = React.lazy(() => import("./pages/AIRecommendations"));
const LeadLifecycle = React.lazy(() => import("./pages/LeadLifecycle"));
const DealsKanban = React.lazy(() => import("./pages/DealsKanban"));
const PaymentsSubscriptions = React.lazy(() => import("./pages/PaymentsSubscriptions"));

// Setup cache utilities on app start
cacheUtils.setupBackgroundRefetch();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Critical routes - loaded immediately */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main app routes - lazy loaded */}
          <Route
            path="/dashboard"
            element={
              <SuspenseWrapper>
                <Dashboard />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/activities"
            element={
              <SuspenseWrapper>
                <Activities />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/leads"
            element={
              <SuspenseWrapper>
                <Leads />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/properties"
            element={
              <SuspenseWrapper>
                <Properties />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/deals"
            element={
              <SuspenseWrapper>
                <Deals />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/companies"
            element={
              <SuspenseWrapper>
                <Companies />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/lead-sources"
            element={
              <SuspenseWrapper>
                <LeadSources />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/whatsapp"
            element={
              <SuspenseWrapper>
                <WhatsApp />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/analytics"
            element={
              <SuspenseWrapper>
                <Analytics />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <SuspenseWrapper>
                <Settings />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/notifications"
            element={
              <SuspenseWrapper>
                <Notifications />
              </SuspenseWrapper>
            }
          />

          {/* Admin routes - separate chunk */}
          <Route
            path="/subscriptions"
            element={
              <SuspenseWrapper>
                <Subscriptions />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/billing"
            element={
              <SuspenseWrapper>
                <Billing />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/usage-tracking"
            element={
              <SuspenseWrapper>
                <UsageTracking />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/feature-flags"
            element={
              <SuspenseWrapper>
                <FeatureFlags />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/security"
            element={
              <SuspenseWrapper>
                <Security />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/ai-analysis"
            element={
              <SuspenseWrapper>
                <AIAnalysis />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <SuspenseWrapper>
                <AuditLogs />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <SuspenseWrapper>
                <Profile />
              </SuspenseWrapper>
            }
          />

          {/* Advanced features - separate chunk */}
          <Route
            path="/roles-permissions"
            element={
              <SuspenseWrapper>
                <RolesPermissions />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/teams-management"
            element={
              <SuspenseWrapper>
                <TeamsManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/tasks-appointments"
            element={
              <SuspenseWrapper>
                <TasksAppointments />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/advanced-reports"
            element={
              <SuspenseWrapper>
                <AdvancedReports />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/marketing-campaigns"
            element={
              <SuspenseWrapper>
                <MarketingCampaigns />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/ai-recommendations"
            element={
              <SuspenseWrapper>
                <AIRecommendations />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/lead-lifecycle"
            element={
              <SuspenseWrapper>
                <LeadLifecycle />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/deals-kanban"
            element={
              <SuspenseWrapper>
                <DealsKanban />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/payments-subscriptions"
            element={
              <SuspenseWrapper>
                <PaymentsSubscriptions />
              </SuspenseWrapper>
            }
          />

          {/* Error route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
