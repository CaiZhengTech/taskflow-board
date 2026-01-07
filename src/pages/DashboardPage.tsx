import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { ActivitiesDropdown } from '@/components/dashboard/ActivitiesDropdown';
import { UserSettingsPage } from '@/pages/UserSettingsPage';
import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  Hash,
  ChevronRight,
  Archive,
  FolderOpen
} from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  code: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  memberCount: number;
  isArchived?: boolean;
}

// Mock workspaces for demo
// TODO: Replace with actual API calls to PostgreSQL backend
const mockWorkspaces: Workspace[] = [
  { id: '1', name: 'Engineering Team', code: 'ENG-2024', role: 'owner', memberCount: 8 },
  { id: '2', name: 'Design Sprint', code: 'DSN-001', role: 'member', memberCount: 4 },
];

const mockArchivedWorkspaces: Workspace[] = [
  { id: '3', name: 'Q3 Marketing Campaign', code: 'MKT-Q3', role: 'owner', memberCount: 6, isArchived: true },
  { id: '4', name: 'Website Redesign 2023', code: 'WEB-23', role: 'admin', memberCount: 5, isArchived: true },
];

export function DashboardPage({ onSelectWorkspace }: { onSelectWorkspace: (workspace: Workspace) => void }) {
  const { user } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [archivedWorkspaces] = useState<Workspace[]>(mockArchivedWorkspaces);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  // Settings page state
  const [showSettings, setShowSettings] = useState<'profile' | 'security' | 'theme' | null>(null);
  
  // Success modal state
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const handleJoinWorkspace = () => {
    if (joinCode.trim()) {
      // TODO: Replace with actual API call to join workspace
      // API endpoint: POST /api/workspaces/join { code: joinCode }
      setSuccessModal({
        title: 'Joining Workspace',
        message: `Looking for workspace with code: ${joinCode}...`
      });
      setJoinCode('');
      setShowJoinInput(false);
    }
  };

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      // TODO: Replace with actual API call to create workspace
      // API endpoint: POST /api/workspaces { name: newWorkspaceName }
      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: newWorkspaceName,
        code: `WS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        role: 'owner',
        memberCount: 1
      };
      
      // Add to local state (will be replaced with actual DB insertion)
      setWorkspaces([...workspaces, newWorkspace]);
      setShowNewWorkspace(false);
      setNewWorkspaceName('');
      
      setSuccessModal({
        title: 'Workspace Created!',
        message: `"${newWorkspace.name}" is ready. Share code ${newWorkspace.code} to invite others.`
      });
    }
  };

  const handleSettingsNavigate = (section: 'profile' | 'security' | 'theme') => {
    setShowSettings(section);
  };

  const roleColors: Record<string, string> = {
    owner: 'bg-status-completed/10 text-status-completed',
    admin: 'bg-status-progress/10 text-status-progress',
    member: 'bg-status-ready/10 text-status-ready',
    viewer: 'bg-muted text-muted-foreground'
  };

  // Show settings page if active
  if (showSettings) {
    return (
      <UserSettingsPage 
        initialSection={showSettings}
        onBack={() => setShowSettings(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskBoard</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Activities dropdown (3-line menu) */}
            <ActivitiesDropdown />
            
            {/* User dropdown (profile picture) */}
            <UserDropdown onNavigate={handleSettingsNavigate} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name || user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Select a workspace to continue or create a new one.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={() => setShowNewWorkspace(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
            <Button variant="outline" onClick={() => setShowJoinInput(true)}>
              <Hash className="h-4 w-4 mr-2" />
              Join with Code
            </Button>
          </div>

          {/* Join Code Input */}
          {showJoinInput && (
            <div className="mb-8 p-6 rounded-xl border border-border bg-card animate-scale-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">Join a Workspace</h3>
              <div className="flex gap-3">
                <Input 
                  placeholder="Enter workspace code (e.g., ENG-2024)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleJoinWorkspace}>Join</Button>
                <Button variant="ghost" onClick={() => setShowJoinInput(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Create Workspace Modal */}
          {showNewWorkspace && (
            <div className="mb-8 p-6 rounded-xl border border-primary/30 bg-primary/5 animate-scale-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">Create New Workspace</h3>
              <div className="flex gap-3">
                <Input 
                  placeholder="Workspace name (e.g., Marketing Team)"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCreateWorkspace}>Create</Button>
                <Button variant="ghost" onClick={() => setShowNewWorkspace(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Your Workspaces */}
          <div className="space-y-4 mb-10">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Your Workspaces
            </h2>
            
            {workspaces.length === 0 ? (
              <div className="p-10 rounded-xl border border-dashed border-border text-center">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No workspaces yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workspace or join an existing one with a code.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => onSelectWorkspace(workspace)}
                    className="w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                          {workspace.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {workspace.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {workspace.code}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {workspace.memberCount} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[workspace.role]}`}>
                          {workspace.role}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Previous/Archived Workspaces */}
          <div className="space-y-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <Archive className="h-5 w-5" />
              Previous Workspaces
              <ChevronRight className={`h-4 w-4 transition-transform ${showArchived ? 'rotate-90' : ''}`} />
              <span className="text-sm font-normal">({archivedWorkspaces.length})</span>
            </button>
            
            {showArchived && (
              <div className="grid gap-4 animate-fade-in">
                {archivedWorkspaces.length === 0 ? (
                  <p className="text-muted-foreground py-4">No archived workspaces.</p>
                ) : (
                  archivedWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="w-full p-6 rounded-xl border border-border bg-muted/30 opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                            {workspace.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-muted-foreground">
                              {workspace.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {workspace.code}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {workspace.memberCount} members
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            Archived
                          </span>
                          <Button variant="outline" size="sm">
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {successModal && (
        <SuccessModal
          isOpen={true}
          onClose={() => setSuccessModal(null)}
          title={successModal.title}
          message={successModal.message}
        />
      )}
    </div>
  );
}
