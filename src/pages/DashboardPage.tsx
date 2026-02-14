import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useInvitationStore } from '@/stores/invitationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ManagerDashboardWidgets, EmployeeDashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { RoleToggle } from '@/components/board/RoleToggle';
import { useUiStore } from '@/stores/uiStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Mail,
  MailOpen,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const openInvitationsOnLoad = !!(location.state as any)?.openInvitations;
  const { user } = useAuthStore();
  const { workspaces, archivedWorkspaces, currentWorkspace, addWorkspace, setCurrentWorkspace, archiveWorkspace, deleteWorkspace, restoreWorkspace, deleteArchivedWorkspace } = useWorkspaceStore();
  const { receivedInvitations, sentInvitations, acceptInvitation, declineInvitation, dismissInvitation } = useInvitationStore();
  const { rolePreviewToggle, setRolePreviewToggle } = useUiStore();

  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showInvitations, setShowInvitations] = useState(openInvitationsOnLoad);
  const [invitationsTab, setInvitationsTab] = useState<'received' | 'sent'>('received');
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const wsToDelete = workspaces.find((w) => w.id === deleteConfirmId);

  const pendingCount = receivedInvitations.filter(i => i.status === 'pending').length;

  const handleJoinWorkspace = () => {
    if (joinCode.trim()) {
      // Check if any received invitation has this code
      const matchingInvite = receivedInvitations.find(
        i => i.workspaceCode.toLowerCase() === joinCode.trim().toLowerCase() && i.status === 'pending'
      );
      if (matchingInvite) {
        acceptInvitation(matchingInvite.id);
        const ws = addWorkspace(matchingInvite.workspaceName, matchingInvite.role as any);
        toast.success(`Joined "${matchingInvite.workspaceName}" as ${matchingInvite.role}!`);
      } else {
        setSuccessModal({ title: 'Joining Workspace', message: `Looking for workspace with code: ${joinCode}...` });
      }
      setJoinCode('');
      setShowJoinInput(false);
    }
  };

  const handleAcceptInvite = (invId: string) => {
    const inv = receivedInvitations.find(i => i.id === invId);
    if (!inv) return;
    acceptInvitation(invId);
    const ws = addWorkspace(inv.workspaceName, inv.role as any);
    toast.success(`Joined "${inv.workspaceName}" as ${inv.role}!`);
  };

  const handleDeclineInvite = (invId: string) => {
    declineInvitation(invId);
    toast('Invitation declined');
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
            {currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'manager' || !currentWorkspace ? (
              <RoleToggle currentView={rolePreviewToggle} onToggle={setRolePreviewToggle} />
            ) : null}
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
            {(rolePreviewToggle === 'manager' && (!currentWorkspace || currentWorkspace.role === 'owner' || currentWorkspace.role === 'manager')) ? <ManagerDashboardWidgets /> : <EmployeeDashboardWidgets />}
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
          <Button
            variant={showInvitations ? 'secondary' : 'outline'}
            onClick={() => setShowInvitations(!showInvitations)}
            className="relative"
          >
            <Mail className="h-4 w-4 mr-2" />
            Invitations
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {pendingCount}
              </span>
            )}
          </Button>
        </div>

        {/* ── Invitations panel ─────────────────────────────────────────── */}
        {showInvitations && (
          <div className="mb-8 rounded-xl border border-border bg-card animate-scale-in overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setInvitationsTab('received')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${invitationsTab === 'received' ? 'bg-muted text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <MailOpen className="h-4 w-4" />
                Received
                {pendingCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{pendingCount}</span>
                )}
              </button>
              <button
                onClick={() => setInvitationsTab('sent')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${invitationsTab === 'sent' ? 'bg-muted text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                <Send className="h-4 w-4" />
                Sent ({sentInvitations.length})
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {invitationsTab === 'received' && (
                receivedInvitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MailOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No invitations yet</p>
                  </div>
                ) : (
                  receivedInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className={`p-4 rounded-xl border transition-all ${inv.status === 'pending' ? 'border-primary/30 bg-primary/5' : inv.status === 'accepted' ? 'border-status-completed/30 bg-status-completed/5' : 'border-border bg-muted/30'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {inv.invitedByAvatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{inv.invitedBy}</span>
                            <span className="text-xs text-muted-foreground">invited you to</span>
                            <span className="font-semibold text-foreground text-sm">{inv.workspaceName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[inv.role] || 'bg-muted text-muted-foreground'}`}>
                              {inv.role}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              #{inv.workspaceCode}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {formatTimeAgo(inv.createdAt)}
                            </span>
                          </div>
                          {inv.message && (
                            <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                              <div className="flex items-start gap-1.5">
                                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground italic leading-relaxed">{inv.message}</p>
                              </div>
                            </div>
                          )}
                          {inv.status === 'pending' && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleAcceptInvite(inv.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleDeclineInvite(inv.id)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                          {inv.status === 'accepted' && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-status-completed font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Accepted
                            </div>
                          )}
                          {inv.status === 'declined' && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                              <XCircle className="h-3.5 w-3.5" />
                              Declined
                              <button
                                onClick={() => dismissInvitation(inv.id)}
                                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {invitationsTab === 'sent' && (
                sentInvitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No invitations sent yet</p>
                    <p className="text-xs mt-1">Invite members from a workspace's Team page</p>
                  </div>
                ) : (
                  sentInvitations.map((inv) => (
                    <div key={inv.id} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {inv.inviteeName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {inv.inviteeName} <span className="text-muted-foreground font-normal">({inv.inviteeEmail})</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invited to <span className="font-medium">{inv.workspaceName}</span> as {inv.role} · {formatTimeAgo(inv.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${inv.status === 'pending' ? 'bg-status-amber/10 text-status-amber' : inv.status === 'accepted' ? 'bg-status-completed/10 text-status-completed' : 'bg-muted text-muted-foreground'}`}>
                        {inv.status}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

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
                <div
                  key={workspace.id}
                  className="w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleSelectWorkspace(workspace)}
                      className="flex items-center gap-4 flex-1 text-left min-w-0"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                        {workspace.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
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
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[workspace.role]}`}>
                        {workspace.role}
                      </span>
                      {workspace.role === 'owner' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => { e.stopPropagation(); archiveWorkspace(workspace.id); toast.success(`"${workspace.name}" archived`); }}
                            title="Archive workspace"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(workspace.id); }}
                            title="Delete workspace"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
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

      {/* Delete workspace confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{wsToDelete?.name}</strong> and all of its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmId && wsToDelete) {
                  deleteWorkspace(deleteConfirmId);
                  toast.success(`"${wsToDelete.name}" permanently deleted`);
                }
                setDeleteConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {successModal && (
        <SuccessModal isOpen onClose={() => setSuccessModal(null)} title={successModal.title} message={successModal.message} />
      )}
    </div>
  );
}
