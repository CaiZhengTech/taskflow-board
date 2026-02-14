import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useUiStore } from '@/stores/uiStore';
import { useInvitationStore } from '@/stores/invitationStore';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { ActivitiesDropdown } from '@/components/dashboard/ActivitiesDropdown';
import { RoleToggle } from '@/components/board/RoleToggle';
import { LayoutDashboard, Search, ChevronDown, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const rolePreviewToggle = useUiStore((s) => s.rolePreviewToggle);
  const setRolePreviewToggle = useUiStore((s) => s.setRolePreviewToggle);
  const pendingInvitations = useInvitationStore((s) => s.receivedInvitations.filter(i => i.status === 'pending').length);

  const isOnBoard = location.pathname.includes('/board');

  const handleSettingsNavigate = (section: 'profile' | 'security' | 'theme') => {
    navigate('/app/settings', { state: { section } });
  };

  const handleSelectWorkspace = (ws: typeof workspaces[0]) => {
    setCurrentWorkspace(ws);
    navigate(`/app/workspaces/${ws.id}/board`);
  };

  return (
    <div className="min-h-svh flex flex-col bg-background">
      {/* Skip to main content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <header className="border-b border-border bg-card sticky top-0 z-40" role="banner">
        <nav aria-label="Main navigation" className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 gap-2">
          {/* Left: Logo + workspace switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <button onClick={() => navigate('/app/dashboard')} className="flex items-center gap-2 shrink-0" aria-label="TaskBoard — go to dashboard">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground hidden md:inline">TaskBoard</span>
            </button>

            {/* Workspace switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground min-w-0">
                <span className="truncate max-w-[100px] sm:max-w-[160px] md:max-w-[200px]">
                  {currentWorkspace?.name || 'Select Workspace'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaces.map((ws) => (
                  <DropdownMenuItem key={ws.id} onClick={() => handleSelectWorkspace(ws)}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {ws.name.charAt(0)}
                      </div>
                      <span>{ws.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/app/dashboard')}>
                  All Workspaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: search placeholder */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Search..." className="pl-9 h-8 bg-muted/50" aria-label="Search tasks" />
            </div>
          </div>

          {/* Right: role toggle, activities, user */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isOnBoard && (currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'manager') && (
              <div className="hidden sm:block">
                <RoleToggle currentView={rolePreviewToggle} onToggle={setRolePreviewToggle} />
              </div>
            )}
            <ActivitiesDropdown />
            <button
              onClick={() => navigate('/app/dashboard', { state: { openInvitations: true } })}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              title="Invitations"
            >
              <Mail className="h-5 w-5 text-muted-foreground" />
              {pendingInvitations > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                  {pendingInvitations}
                </span>
              )}
            </button>
            <UserDropdown onNavigate={handleSettingsNavigate} />
          </div>
        </nav>
      </header>

      <main id="main-content" className="flex-1 flex flex-col" role="main">
        <Outlet />
      </main>
    </div>
  );
}
