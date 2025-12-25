import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Hash,
  User,
  Mail,
  Pencil,
  Check,
  X
} from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  code: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  memberCount: number;
}

// Mock workspaces for demo
const mockWorkspaces: Workspace[] = [
  { id: '1', name: 'Engineering Team', code: 'ENG-2024', role: 'owner', memberCount: 8 },
  { id: '2', name: 'Design Sprint', code: 'DSN-001', role: 'member', memberCount: 4 },
];

export function DashboardPage({ onSelectWorkspace }: { onSelectWorkspace: (workspace: Workspace) => void }) {
  const { user, logout, setUser } = useAuthStore();
  const [workspaces] = useState<Workspace[]>(mockWorkspaces);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const handleJoinWorkspace = () => {
    if (joinCode.trim()) {
      // In real app, this would call an API
      alert(`Joining workspace with code: ${joinCode}`);
      setJoinCode('');
      setShowJoinInput(false);
    }
  };

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      // In real app, this would call an API
      const newWorkspace: Workspace = {
        id: Date.now().toString(),
        name: newWorkspaceName,
        code: `WS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        role: 'owner',
        memberCount: 1
      };
      onSelectWorkspace(newWorkspace);
    }
  };

  const handleSaveName = () => {
    if (user && editName.trim()) {
      setUser({ ...user, name: editName.trim() });
      setEditingName(false);
    }
  };

  const handleSaveEmail = () => {
    if (user && editEmail.trim()) {
      setUser({ ...user, email: editEmail.trim() });
      setEditingEmail(false);
    }
  };

  const roleColors: Record<string, string> = {
    owner: 'bg-status-completed/10 text-status-completed',
    admin: 'bg-status-progress/10 text-status-progress',
    member: 'bg-status-ready/10 text-status-ready',
    viewer: 'bg-muted text-muted-foreground'
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-foreground">Account Settings</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-10 max-w-2xl">
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </h2>
              
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Photo</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Display Name</p>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={handleSaveName}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-foreground font-medium">{user?.name || 'Not set'}</p>
                    )}
                  </div>
                  {!editingName && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    {editingEmail ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={handleSaveEmail}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingEmail(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-foreground font-medium">{user?.email || 'Not set'}</p>
                    )}
                  </div>
                  {!editingEmail && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingEmail(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Username (read-only) */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Username</p>
                  <p className="text-foreground font-medium">@{user?.username}</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskBoard</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
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

          {/* Workspaces List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Workspaces</h2>
            
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
        </div>
      </main>
    </div>
  );
}