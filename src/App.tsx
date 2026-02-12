import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RouteGuard } from '@/components/guards/RouteGuard';
import { AppShell } from '@/layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { UserSettingsPage } from './pages/UserSettingsPage';
import { ArchivedPage } from './pages/ArchivedPage';
import { Toaster } from '@/components/ui/toaster';

const App = () => {
  return (
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
