import { type ComponentType } from 'react';
import { useWorkspaceStore, type WorkspaceRole } from '@/stores/workspaceStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

type RoleAction = 'create_task' | 'edit_task' | 'delete_task' | 'move_task' | 'manage_columns' | 'manage_members' | 'change_roles' | 'archive_workspace' | 'apply_preset';

const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<RoleAction>> = {
  owner: new Set(['create_task', 'edit_task', 'delete_task', 'move_task', 'manage_columns', 'manage_members', 'change_roles', 'archive_workspace', 'apply_preset']),
  manager: new Set(['create_task', 'edit_task', 'delete_task', 'move_task', 'manage_columns', 'manage_members', 'apply_preset']),
  contributor: new Set(['create_task', 'edit_task', 'move_task']),
  viewer: new Set([]),
};

export function hasPermission(role: WorkspaceRole, action: RoleAction): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function useCurrentRole(): WorkspaceRole {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  return currentWorkspace?.role ?? 'viewer';
}

export function useHasPermission(action: RoleAction): boolean {
  const role = useCurrentRole();
  return hasPermission(role, action);
}

interface WithRoleProps {
  action: RoleAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  disableOnly?: boolean; // if true, render children disabled instead of hiding
}

export function WithRole({ action, children, fallback, disableOnly }: WithRoleProps) {
  const allowed = useHasPermission(action);

  if (allowed) return <>{children}</>;

  if (disableOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="opacity-50 pointer-events-none" aria-disabled="true">
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="flex items-center gap-1.5 text-xs">
              <Lock className="h-3 w-3" />
              You don't have permission for this action
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return fallback ? <>{fallback}</> : null;
}

// HOC version
export function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  action: RoleAction,
) {
  return function RoleGatedComponent(props: P) {
    const allowed = useHasPermission(action);
    if (!allowed) return null;
    return <WrappedComponent {...props} />;
  };
}
