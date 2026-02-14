import { type ComponentType } from 'react';
import { useWorkspaceStore, type WorkspaceRole } from '@/stores/workspaceStore';
import { useUiStore } from '@/stores/uiStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

export type RoleAction = 'create_task' | 'edit_task' | 'delete_task' | 'move_task' | 'manage_columns' | 'manage_members' | 'change_roles' | 'archive_workspace' | 'apply_preset';

const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<RoleAction>> = {
  owner: new Set(['create_task', 'edit_task', 'delete_task', 'move_task', 'manage_columns', 'manage_members', 'change_roles', 'archive_workspace', 'apply_preset']),
  manager: new Set(['create_task', 'edit_task', 'delete_task', 'move_task', 'manage_columns', 'manage_members', 'apply_preset']),
  contributor: new Set(['create_task', 'edit_task', 'move_task']),
  viewer: new Set([]),
};

export function hasPermission(role: WorkspaceRole, action: RoleAction): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

/**
 * Returns the effective role for the current user.
 * When the role-preview toggle is set to 'employee', the effective role
 * is downgraded to 'contributor' so managers/owners can preview the
 * restricted experience. Otherwise the actual workspace role is used.
 */
export function useCurrentRole(): WorkspaceRole {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const rolePreview = useUiStore((s) => s.rolePreviewToggle);
  const actualRole = currentWorkspace?.role ?? 'viewer';

  // When previewing as employee, cap to contributor — but never ABOVE actualRole
  if (rolePreview === 'employee') {
    const hierarchy: WorkspaceRole[] = ['viewer', 'contributor', 'manager', 'owner'];
    const actualIdx = hierarchy.indexOf(actualRole);
    const contributorIdx = hierarchy.indexOf('contributor');
    return hierarchy[Math.min(actualIdx, contributorIdx)];
  }
  return actualRole;
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
