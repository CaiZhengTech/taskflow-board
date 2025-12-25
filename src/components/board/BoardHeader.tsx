import { useAuthStore } from '@/stores/authStore';
import { LayoutGrid, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardHeaderProps {
  onNewTask: () => void;
}

export function BoardHeader({ onNewTask }: BoardHeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-primary">
          <LayoutGrid className="h-5 w-5" />
          <span className="font-semibold text-lg text-foreground">TaskBoard</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Demo Project
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={onNewTask} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Task
        </Button>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-foreground hidden sm:inline">{user?.username}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
