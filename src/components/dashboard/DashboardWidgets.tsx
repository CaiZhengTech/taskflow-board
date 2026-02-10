import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  User,
  BarChart3,
} from 'lucide-react';

interface WidgetCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof CheckCircle2;
  color?: string;
}

function WidgetCard({ title, value, subtitle, icon: Icon, color = 'text-primary' }: WidgetCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

function MiniBar({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">{count}</span>
    </div>
  );
}

export function ManagerDashboardWidgets() {
  const tasks = useTaskStore((s) => s.tasks);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed');
    const unassigned = tasks.filter((t) => !t.assignee);
    const completed = tasks.filter((t) => t.status === 'completed');
    const inProgress = tasks.filter((t) => t.status === 'in_progress');
    const dueSoon = tasks.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false;
      const due = new Date(t.due_date);
      return due >= now && due <= new Date(now.getTime() + 7 * 86400000);
    });
    const createdThisWeek = tasks.filter((t) => new Date(t.created_at) >= weekAgo);

    return { overdue, unassigned, completed, inProgress, dueSoon, createdThisWeek, total: tasks.length };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Manager Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WidgetCard icon={AlertTriangle} title="Overdue" value={stats.overdue.length} color="text-destructive" />
        <WidgetCard icon={ListTodo} title="Unassigned" value={stats.unassigned.length} />
        <WidgetCard icon={TrendingUp} title="Created this week" value={stats.createdThisWeek.length} />
        <WidgetCard icon={CheckCircle2} title="Completed" value={stats.completed.length} color="text-status-completed" />
      </div>

      {/* Workload distribution */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Workload Distribution</h4>
        </div>
        <div className="space-y-3">
          <MiniBar label="Backlog" count={tasks.filter((t) => t.status === 'backlog').length} total={stats.total} colorClass="bg-status-backlog" />
          <MiniBar label="Ready" count={tasks.filter((t) => t.status === 'ready').length} total={stats.total} colorClass="bg-status-ready" />
          <MiniBar label="In Progress" count={stats.inProgress.length} total={stats.total} colorClass="bg-status-progress" />
          <MiniBar label="Completed" count={stats.completed.length} total={stats.total} colorClass="bg-status-completed" />
        </div>
      </div>

      {/* Due soon list */}
      {stats.dueSoon.length > 0 && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-priority-medium" />
            Due This Week ({stats.dueSoon.length})
          </h4>
          <div className="space-y-2">
            {stats.dueSoon.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{task.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {new Date(task.due_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EmployeeDashboardWidgets() {
  const tasks = useTaskStore((s) => s.tasks);

  const stats = useMemo(() => {
    const now = new Date();
    const myTasks = tasks.filter((t) => t.assignee?.id === 'user-1');
    const myInProgress = myTasks.filter((t) => t.status === 'in_progress');
    const myCompleted = myTasks.filter((t) => t.status === 'completed');
    const myDueSoon = myTasks.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false;
      const due = new Date(t.due_date);
      return due >= now && due <= new Date(now.getTime() + 7 * 86400000);
    });
    const myOverdue = myTasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed');

    return { myTasks, myInProgress, myCompleted, myDueSoon, myOverdue };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Work</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WidgetCard icon={User} title="Assigned to me" value={stats.myTasks.length} />
        <WidgetCard icon={Clock} title="In Progress" value={stats.myInProgress.length} color="text-status-progress" />
        <WidgetCard icon={AlertTriangle} title="Overdue" value={stats.myOverdue.length} color="text-destructive" />
        <WidgetCard icon={CheckCircle2} title="Completed" value={stats.myCompleted.length} color="text-status-completed" />
      </div>

      {/* Due this week */}
      {stats.myDueSoon.length > 0 && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-priority-medium" />
            Due This Week
          </h4>
          <div className="space-y-2">
            {stats.myDueSoon.map((task) => (
              <div key={task.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{task.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {new Date(task.due_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent in progress */}
      {stats.myInProgress.length > 0 && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="text-sm font-semibold text-foreground mb-3">Currently Working On</h4>
          <div className="space-y-2">
            {stats.myInProgress.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-status-progress" />
                <span className="text-foreground">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
