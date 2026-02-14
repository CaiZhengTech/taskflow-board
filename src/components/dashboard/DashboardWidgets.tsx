import { useTaskStore } from '@/stores/taskStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  User,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getColumnColorStyle } from '@/types/task';

/* ─── helpers ─── */

/** Resolve a color token like "status-backlog" → "hsl(var(--status-backlog))" for recharts fills */
function tokenToHsl(token: string) {
  return `hsl(var(--${token}))`;
}

/* ─── shared sub-components ─── */

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
      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">{count}</span>
    </div>
  );
}

/* Custom recharts tooltip */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.payload.fill || d.color }} />
        <span className="text-muted-foreground">{d.name}</span>
        <span className="font-mono font-medium text-foreground ml-auto">{d.value}</span>
      </div>
    </div>
  );
}

/* ─── Pie chart label that shows % ─── */
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-medium">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Manager Dashboard
   ════════════════════════════════════════════════════════════════════ */

export function ManagerDashboardWidgets() {
  const tasks = useTaskStore((s) => s.tasks);
  const columns = useWorkspaceStore((s) => s.columns);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < now && !isTerminalColumn(t.status));
    const unassigned = tasks.filter((t) => !t.assignee);
    const createdThisWeek = tasks.filter((t) => new Date(t.created_at) >= weekAgo);
    const dueSoon = tasks.filter((t) => {
      if (!t.due_date) return false;
      if (isTerminalColumn(t.status)) return false;
      const due = new Date(t.due_date);
      return due >= now && due <= new Date(now.getTime() + 7 * 86400000);
    });

    return { overdue, unassigned, dueSoon, createdThisWeek, total: tasks.length };
  }, [tasks]);

  // Distribution data for Pie chart — one slice per column
  const distributionData = useMemo(() => {
    return columns.map((col) => ({
      name: col.title,
      value: tasks.filter((t) => t.status === col.id).length,
      fill: tokenToHsl(col.color),
      colorToken: col.color,
    })).filter((d) => d.value > 0);
  }, [tasks, columns]);

  // Priority breakdown for Bar chart
  const priorityData = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'high').length;
    const medium = tasks.filter((t) => t.priority === 'medium').length;
    const low = tasks.filter((t) => t.priority === 'low').length;
    return [
      { name: 'High', value: high, fill: 'hsl(var(--priority-high))' },
      { name: 'Medium', value: medium, fill: 'hsl(var(--priority-medium))' },
      { name: 'Low', value: low, fill: 'hsl(var(--priority-low))' },
    ];
  }, [tasks]);

  // Last column is considered "terminal" for overdue/due-soon filtering
  function isTerminalColumn(status: string) {
    if (columns.length === 0) return status === 'completed';
    return status === columns[columns.length - 1].id;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Manager Overview</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WidgetCard icon={AlertTriangle} title="Overdue" value={stats.overdue.length} color="text-destructive" />
        <WidgetCard icon={ListTodo} title="Unassigned" value={stats.unassigned.length} />
        <WidgetCard icon={TrendingUp} title="Created this week" value={stats.createdThisWeek.length} />
        <WidgetCard icon={CheckCircle2} title="Total Tasks" value={stats.total} color="text-primary" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribution Donut */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Task Distribution</h4>
          </div>
          {distributionData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {distributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                    iconSize={8}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No tasks yet</p>
          )}
        </div>

        {/* Priority Bar Chart */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Priority Breakdown</h4>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Workload distribution (dynamic columns) */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Column Workload</h4>
        </div>
        <div className="space-y-3">
          {columns.map((col) => {
            const style = getColumnColorStyle(col.color);
            return (
              <MiniBar
                key={col.id}
                label={col.title}
                count={tasks.filter((t) => t.status === col.id).length}
                total={stats.total}
                colorClass={style.dot}
              />
            );
          })}
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

/* ════════════════════════════════════════════════════════════════════
   Employee Dashboard
   ════════════════════════════════════════════════════════════════════ */

export function EmployeeDashboardWidgets() {
  const tasks = useTaskStore((s) => s.tasks);
  const columns = useWorkspaceStore((s) => s.columns);

  const stats = useMemo(() => {
    const now = new Date();
    const myTasks = tasks.filter((t) => t.assignee?.id === 'user-1');
    const lastColId = columns.length > 0 ? columns[columns.length - 1].id : 'completed';
    const myCompleted = myTasks.filter((t) => t.status === lastColId);
    const myOverdue = myTasks.filter((t) =>
      t.due_date && new Date(t.due_date) < now && t.status !== lastColId,
    );
    const myDueSoon = myTasks.filter((t) => {
      if (!t.due_date || t.status === lastColId) return false;
      const due = new Date(t.due_date);
      return due >= now && due <= new Date(now.getTime() + 7 * 86400000);
    });
    const myActive = myTasks.filter((t) => t.status !== lastColId);

    return { myTasks, myCompleted, myOverdue, myDueSoon, myActive, lastColId };
  }, [tasks, columns]);

  // My task distribution across columns
  const myDistribution = useMemo(() => {
    const myTasks = tasks.filter((t) => t.assignee?.id === 'user-1');
    return columns.map((col) => ({
      name: col.title,
      value: myTasks.filter((t) => t.status === col.id).length,
      fill: tokenToHsl(col.color),
    })).filter((d) => d.value > 0);
  }, [tasks, columns]);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">My Work</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WidgetCard icon={User} title="Assigned to me" value={stats.myTasks.length} />
        <WidgetCard icon={TrendingUp} title="Active" value={stats.myActive.length} color="text-status-progress" />
        <WidgetCard icon={AlertTriangle} title="Overdue" value={stats.myOverdue.length} color="text-destructive" />
        <WidgetCard icon={CheckCircle2} title="Completed" value={stats.myCompleted.length} color="text-status-completed" />
      </div>

      {/* My task distribution chart */}
      {myDistribution.length > 0 && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">My Tasks by Column</h4>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={myDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {myDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  iconSize={8}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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

      {/* Active tasks */}
      {stats.myActive.length > 0 && (
        <div className="p-5 rounded-xl border border-border bg-card">
          <h4 className="text-sm font-semibold text-foreground mb-3">Currently Active</h4>
          <div className="space-y-2">
            {stats.myActive.slice(0, 6).map((task) => {
              const col = columns.find((c) => c.id === task.status);
              const dotClass = col ? getColumnColorStyle(col.color).dot : 'bg-muted-foreground';
              return (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                  <span className="text-foreground truncate">{task.title}</span>
                  {col && <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{col.title}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
