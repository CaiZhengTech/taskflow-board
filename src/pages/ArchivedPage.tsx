import { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
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
import { Archive, RotateCcw, Trash2, Users, Hash } from 'lucide-react';
import { toast } from 'sonner';

export function ArchivedPage() {
  const archivedWorkspaces = useWorkspaceStore((s) => s.archivedWorkspaces);
  const restoreWorkspace = useWorkspaceStore((s) => s.restoreWorkspace);
  const deleteArchivedWorkspace = useWorkspaceStore((s) => s.deleteArchivedWorkspace);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const wsToDelete = archivedWorkspaces.find((w) => w.id === deleteId);

  const handleRestore = (id: string) => {
    const ws = archivedWorkspaces.find((w) => w.id === id);
    restoreWorkspace(id);
    toast.success(`"${ws?.name}" has been restored`);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const ws = archivedWorkspaces.find((w) => w.id === deleteId);
    deleteArchivedWorkspace(deleteId);
    toast.success(`"${ws?.name}" permanently deleted`);
    setDeleteId(null);
  };

  return (
    <div className="flex-1 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Archive className="h-6 w-6" />
          Archived Workspaces
        </h1>
        <p className="text-muted-foreground mb-8">
          Workspaces you've previously archived. Restore them or delete permanently.
        </p>

        {archivedWorkspaces.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No archived workspaces"
            description="Workspaces you archive will appear here. You can restore them at any time."
          />
        ) : (
          <div className="space-y-3">
            {archivedWorkspaces.map((ws) => (
              <div key={ws.id} className="p-5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0">
                    {ws.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{ws.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />{ws.code}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />{ws.memberCount} members
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(ws.id)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(ws.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permanent delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete "{wsToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All workspace data, settings, and history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
