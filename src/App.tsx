import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RouteGuard } from '@/components/guards/RouteGuard';
import { AppShell } from '@/layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { UserSettingsPage } from './pages/UserSettingsPage';
import { ArchivedPage } from './pages/ArchivedPage';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

// Error boundary to prevent full white-screen crashes
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">An unexpected error occurred.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated shell */}
        <Route path="/app" element={<RouteGuard><AppShell /></RouteGuard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="workspaces/:id/board" element={<WorkspacePage />} />
          <Route path="workspaces/:id/archived" element={<ArchivedPage />} />
          <Route path="settings" element={<UserSettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster />
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
