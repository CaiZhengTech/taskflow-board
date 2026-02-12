import { useWorkspaceStore } from '@/stores/workspaceStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw } from 'lucide-react';

export function ArchivedPage() {
  const archivedWorkspaces = useWorkspaceStore((s) => s.archivedWorkspaces);
  const restoreWorkspace = useWorkspaceStore((s) => s.restoreWorkspace);

  return (
    <div className="flex-1 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Archive className="h-6 w-6" />
          Archived Workspaces
        </h1>
        <p className="text-muted-foreground mb-8">Workspaces you've previously archived.</p>

        {archivedWorkspaces.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No archived workspaces"
            description="Workspaces you archive will appear here. You can restore them at any time."
          />
        ) : (
          <div className="space-y-3">
            {archivedWorkspaces.map((ws) => (
              <div key={ws.id} className="p-5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {ws.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{ws.name}</h3>
                    <p className="text-sm text-muted-foreground">{ws.memberCount} members · {ws.code}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreWorkspace(ws.id)}
                  aria-disabled={false}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
