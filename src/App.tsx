import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { Toaster } from '@/components/ui/toaster';

interface Workspace {
  id: string;
  name: string;
  code: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  memberCount: number;
}

const App = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  if (selectedWorkspace) {
    return (
      <>
        <WorkspacePage 
          workspace={selectedWorkspace} 
          onBack={() => setSelectedWorkspace(null)} 
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <DashboardPage onSelectWorkspace={setSelectedWorkspace} />
      <Toaster />
    </>
  );
};

export default App;