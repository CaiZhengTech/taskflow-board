import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ManagerDashboardWidgets, EmployeeDashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { RoleToggle } from '@/components/board/RoleToggle';
import { useUiStore } from '@/stores/uiStore';
import {
  Plus,
  Users,
  Hash,
  ChevronRight,
  Archive,
  FolderOpen,
  BarChart3,
  LayoutDashboard,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { workspaces, archivedWorkspaces, addWorkspace, setCurrentWorkspace, restoreWorkspace, deleteArchivedWorkspace } = useWorkspaceStore();
  const { rolePreviewToggle, setRolePreviewToggle } = useUiStore();

  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const handleJoinWorkspace = () => {
    if (joinCode.trim()) {
      setSuccessModal({ title: 'Joining Workspace', message: `Looking for workspace with code: ${joinCode}...` });
      setJoinCode('');
      setShowJoinInput(false);
    }
  };

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const ws = addWorkspace(newWorkspaceName);
      setShowNewWorkspace(false);
      setNewWorkspaceName('');
      setSuccessModal({ title: 'Workspace Created!', message: `"${ws.name}" is ready. Share code ${ws.code} to invite others.` });
    }
  };

  const handleSelectWorkspace = (ws: typeof workspaces[0]) => {
    setCurrentWorkspace(ws);
    navigate(`/app/workspaces/${ws.id}/board`);
  };

  const roleColors: Record<string, string> = {
    owner: 'bg-status-completed/10 text-status-completed',
    manager: 'bg-status-progress/10 text-status-progress',
    contributor: 'bg-status-ready/10 text-status-ready',
    viewer: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Welcome back, {user?.name || user?.username}!
            </h1>
            <p className="text-muted-foreground">Select a workspace or create a new one.</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleToggle currentView={rolePreviewToggle} onToggle={setRolePreviewToggle} />
            <Button
              variant={showInsights ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Insights
            </Button>
          </div>
        </div>

        {/* Insights widgets */}
        {showInsights && (
          <div className="mb-8 p-6 rounded-xl border border-border bg-card animate-fade-in">
            {rolePreviewToggle === 'manager' ? <ManagerDashboardWidgets /> : <EmployeeDashboardWidgets />}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
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
              <Input placeholder="Enter workspace code (e.g., ENG-2024)" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="flex-1" />
              <Button onClick={handleJoinWorkspace}>Join</Button>
              <Button variant="ghost" onClick={() => setShowJoinInput(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Create Workspace */}
        {showNewWorkspace && (
          <div className="mb-8 p-6 rounded-xl border border-primary/30 bg-primary/5 animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Workspace</h3>
            <div className="flex gap-3">
              <Input placeholder="Workspace name" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} className="flex-1" />
              <Button onClick={handleCreateWorkspace}>Create</Button>
              <Button variant="ghost" onClick={() => setShowNewWorkspace(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Workspaces */}
        <div className="space-y-4 mb-10">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Your Workspaces
          </h2>

          {workspaces.length === 0 ? (
            <EmptyState
              icon={LayoutDashboard}
              title="No workspaces yet"
              description="Create your first workspace or join an existing one with a code."
              actionLabel="Create Workspace"
              onAction={() => setShowNewWorkspace(true)}
            />
          ) : (
            <div className="grid gap-4">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace)}
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
                            <Hash className="h-3 w-3" />{workspace.code}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />{workspace.memberCount} members
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

        {/* Archived */}
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
                archivedWorkspaces.map((ws) => (
                  <div key={ws.id} className="p-6 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                          {ws.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-muted-foreground">{ws.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Hash className="h-3 w-3" />{ws.code}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />{ws.memberCount} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { restoreWorkspace(ws.id); toast.success(`"${ws.name}" restored`); }}>
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Restore
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => { deleteArchivedWorkspace(ws.id); toast.success(`"${ws.name}" permanently deleted`); }}>
                          <Trash2 className="h-3.5 w-3.5" />
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

      {successModal && (
        <SuccessModal isOpen onClose={() => setSuccessModal(null)} title={successModal.title} message={successModal.message} />
      )}
    </div>
  );
}
