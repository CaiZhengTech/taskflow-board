import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useUiStore } from '@/stores/uiStore';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { ActivitiesDropdown } from '@/components/dashboard/ActivitiesDropdown';
import { RoleToggle } from '@/components/board/RoleToggle';
import { LayoutDashboard, Search, ChevronDown } from 'lucide-react';
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
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left: Logo + workspace switcher */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app/dashboard')} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground hidden sm:inline">TaskBoard</span>
            </button>

            {/* Workspace switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground">
                {currentWorkspace?.name || 'Select Workspace'}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 h-8 bg-muted/50" />
            </div>
          </div>

          {/* Right: role toggle, activities, user */}
          <div className="flex items-center gap-2">
            {isOnBoard && (
              <RoleToggle currentView={rolePreviewToggle} onToggle={setRolePreviewToggle} />
            )}
            <ActivitiesDropdown />
            <UserDropdown onNavigate={handleSettingsNavigate} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
