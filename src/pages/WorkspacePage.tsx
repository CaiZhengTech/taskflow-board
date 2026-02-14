import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUiStore } from '@/stores/uiStore';
import { BoardFilters } from '@/components/board/BoardFilters';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CreateTaskModal } from '@/components/board/CreateTaskModal';
import { BoardPresets } from '@/components/board/BoardPresets';
import { BulkActions } from '@/components/board/BulkActions';
import { ColumnManagerSheet } from '@/components/board/ColumnManagerSheet';
import { ManagerDashboardWidgets, EmployeeDashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { WithRole } from '@/components/guards/withRole';
import { Button } from '@/components/ui/button';
import {
  Users,
  Settings,
  UserPlus,
  Shield,
  Eye,
  Pencil,
  Crown,
  Hash,
  BarChart3,
  ArrowLeft,
  Columns3,
} from 'lucide-react';

const roleIcons: Record<string, typeof Crown> = { owner: Crown, manager: Shield, contributor: Pencil, viewer: Eye };
const roleDescriptions: Record<string, string> = {
  owner: 'Full access, can delete workspace',
  manager: 'Can manage tasks, columns, and members',
  contributor: 'Can create and edit tasks',
  viewer: 'Read-only access',
};

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspaces, currentWorkspace, setCurrentWorkspace, members, activePreset, setActivePreset } = useWorkspaceStore();
  const { selection, clearSelection } = useTaskStore();
  const { rolePreviewToggle } = useUiStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);

  // Sync workspace from URL
  useEffect(() => {
    if (id && (!currentWorkspace || currentWorkspace.id !== id)) {
      const ws = workspaces.find((w) => w.id === id);
      if (ws) setCurrentWorkspace(ws);
    }
  }, [id, currentWorkspace, workspaces, setCurrentWorkspace]);

  const workspace = currentWorkspace;

  const roleColors: Record<string, string> = {
    owner: 'bg-status-completed/10 text-status-completed border-status-completed/20',
    manager: 'bg-status-progress/10 text-status-progress border-status-progress/20',
    contributor: 'bg-status-ready/10 text-status-ready border-status-ready/20',
    viewer: 'bg-muted text-muted-foreground border-border',
  };

  if (!workspace) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Workspace not found.</p>
      </div>
    );
  }

  if (showCollaborators) {
    return (
      <div className="flex-1">
        <div className="border-b border-border bg-card px-6 py-3">
          <button onClick={() => setShowCollaborators(false)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Board
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Users className="h-6 w-6" />
            Team Members
          </h1>
          <p className="text-muted-foreground mb-8">
            Manage collaborators for <span className="font-medium text-foreground">{workspace.name}</span>
          </p>

          {/* Invite Code */}
          <div className="p-4 rounded-xl border border-border bg-card mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
              <p className="text-lg font-mono font-semibold text-foreground flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {workspace.code}
              </p>
            </div>
            <Button variant="outline" size="sm">Copy Code</Button>
          </div>

          <WithRole action="manage_members">
            <Button className="mb-6"><UserPlus className="h-4 w-4 mr-2" />Invite Member</Button>
          </WithRole>

          <div className="space-y-3">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role] || Eye;
              return (
                <div key={member.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {member.avatarInitial}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {member.name}
                        {member.id === '1' && <span className="text-muted-foreground ml-2">(You)</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium capitalize flex items-center gap-2 ${roleColors[member.role]}`}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {member.role}
                    </div>
                    <WithRole action="manage_members">
                      {member.id !== '1' && (
                        <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                      )}
                    </WithRole>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role Permissions */}
          <div className="mt-10 p-6 rounded-xl bg-muted/30 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Role Permissions</h3>
            <div className="grid gap-3">
              {Object.entries(roleDescriptions).map(([role, desc]) => {
                const RoleIcon = roleIcons[role] || Eye;
                return (
                  <div key={role} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${roleColors[role]}`}>
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground capitalize">{role}</span>
                      <span className="text-muted-foreground ml-2">— {desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Board sub-header */}
      <div className="border-b border-border bg-card px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate">{workspace.name}</h2>
          <span className="text-xs text-muted-foreground font-mono shrink-0">#{workspace.code}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={showDashboard ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowDashboard(!showDashboard)}
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Insights
          </Button>

          <WithRole action="apply_preset" disableOnly>
            <BoardPresets activePreset={activePreset} onSelectPreset={setActivePreset} />
          </WithRole>

          <WithRole action="manage_columns">
            <Button variant="ghost" size="sm" onClick={() => setShowColumnManager(true)}>
              <Columns3 className="h-4 w-4 mr-1.5" />
              Columns
            </Button>
          </WithRole>

          <Button variant="ghost" size="sm" onClick={() => setShowCollaborators(true)}>
            <Users className="h-4 w-4 mr-1.5" />
            Team ({members.length})
          </Button>

          <WithRole action="create_task">
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>New Task</Button>
          </WithRole>
        </div>
      </div>

      {/* Dashboard Widgets */}
      {showDashboard && (
        <div className="px-4 py-6 border-b border-border bg-muted/20 animate-fade-in">
          {rolePreviewToggle === 'manager' ? <ManagerDashboardWidgets /> : <EmployeeDashboardWidgets />}
        </div>
      )}

      {/* Bulk actions */}
      <BulkActions selectedIds={selection} onClear={clearSelection} />

      <BoardFilters />
      <KanbanBoard />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus="backlog"
      />

      <ColumnManagerSheet
        open={showColumnManager}
        onOpenChange={setShowColumnManager}
      />
    </div>
  );
}
