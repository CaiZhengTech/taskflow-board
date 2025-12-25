import { useState } from 'react';
import { BoardHeader } from '@/components/board/BoardHeader';
import { BoardFilters } from '@/components/board/BoardFilters';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CreateTaskModal } from '@/components/board/CreateTaskModal';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ArrowLeft, 
  Settings,
  UserPlus,
  Shield,
  Eye,
  Pencil,
  Crown,
  Hash
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatarInitial: string;
}

interface Workspace {
  id: string;
  name: string;
  code: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  memberCount: number;
}

// Mock collaborators
const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'You', email: 'demo@taskboard.io', role: 'owner', avatarInitial: 'Y' },
  { id: '2', name: 'Alex Chen', email: 'alex@company.com', role: 'admin', avatarInitial: 'A' },
  { id: '3', name: 'Sarah Miller', email: 'sarah@company.com', role: 'member', avatarInitial: 'S' },
  { id: '4', name: 'John Doe', email: 'john@company.com', role: 'viewer', avatarInitial: 'J' },
];

const roleIcons: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: Pencil,
  viewer: Eye
};

const roleDescriptions: Record<string, string> = {
  owner: 'Full access, can delete workspace',
  admin: 'Can manage tasks and members',
  member: 'Can create and edit tasks',
  viewer: 'Read-only access'
};

export function WorkspacePage({ 
  workspace, 
  onBack 
}: { 
  workspace: Workspace; 
  onBack: () => void;
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [collaborators] = useState<Collaborator[]>(mockCollaborators);

  const roleColors: Record<string, string> = {
    owner: 'bg-status-completed/10 text-status-completed border-status-completed/20',
    admin: 'bg-status-progress/10 text-status-progress border-status-progress/20',
    member: 'bg-status-ready/10 text-status-ready border-status-ready/20',
    viewer: 'bg-muted text-muted-foreground border-border'
  };

  if (showCollaborators) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCollaborators(false)}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Board
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-10 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Users className="h-8 w-8" />
              Team Members
            </h1>
            <p className="text-muted-foreground">
              Manage collaborators for <span className="font-medium text-foreground">{workspace.name}</span>
            </p>
          </div>

          {/* Workspace Code */}
          <div className="p-4 rounded-xl border border-border bg-card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
                <p className="text-lg font-mono font-semibold text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  {workspace.code}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Copy Code
              </Button>
            </div>
          </div>

          {/* Add Member */}
          {(workspace.role === 'owner' || workspace.role === 'admin') && (
            <Button className="mb-6">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}

          {/* Members List */}
          <div className="space-y-3">
            {collaborators.map((collab) => {
              const RoleIcon = roleIcons[collab.role];
              return (
                <div 
                  key={collab.id}
                  className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {collab.avatarInitial}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {collab.name}
                        {collab.id === '1' && <span className="text-muted-foreground ml-2">(You)</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{collab.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium capitalize flex items-center gap-2 ${roleColors[collab.role]}`}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {collab.role}
                    </div>
                    {(workspace.role === 'owner' || workspace.role === 'admin') && collab.id !== '1' && (
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role Descriptions */}
          <div className="mt-10 p-6 rounded-xl bg-muted/30 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Role Permissions</h3>
            <div className="grid gap-3">
              {Object.entries(roleDescriptions).map(([role, desc]) => {
                const RoleIcon = roleIcons[role];
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Custom Header with back button */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{workspace.name}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {workspace.code}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCollaborators(true)}>
              <Users className="h-4 w-4 mr-2" />
              Team ({mockCollaborators.length})
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              New Task
            </Button>
          </div>
        </div>
      </header>
      
      <BoardFilters />
      <KanbanBoard />
      
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus="backlog"
      />
    </div>
  );
}