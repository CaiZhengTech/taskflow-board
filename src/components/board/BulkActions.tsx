import { TaskStatus, TaskPriority, getColumnColorStyle } from '@/types/task';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHasPermission } from '@/components/guards/withRole';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ArrowRight, Trash2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedIds: Set<string>;
  onClear: () => void;
}

export function BulkActions({ selectedIds, onClear }: BulkActionsProps) {
  const { moveTask, updateTask, deleteTask, tasks } = useTaskStore();
  const columns = useWorkspaceStore(state => state.columns);
  const canMove = useHasPermission('move_task');
  const canDelete = useHasPermission('delete_task');

  if (selectedIds.size === 0) return null;

  const handleBulkMove = (status: TaskStatus) => {
    const snapshot = Array.from(selectedIds).map(id => {
      const t = tasks.find(tk => tk.id === id);
      return t ? { id: t.id, status: t.status, order_index: t.order_index } : null;
    }).filter(Boolean) as { id: string; status: TaskStatus; order_index: number }[];

    let nextIndex = tasks.filter(t => t.status === status).length;
    selectedIds.forEach((id) => moveTask(id, status, nextIndex++));
    onClear();

    toast('Tasks moved', {
      action: {
        label: 'Undo',
        onClick: () => {
          snapshot.forEach(s => moveTask(s.id, s.status, s.order_index));
        },
      },
      duration: 5000,
    });
  };

  const handleBulkPriority = (priority: TaskPriority) => {
    selectedIds.forEach((id) => updateTask(id, { priority }));
    onClear();
  };

  const handleBulkDelete = () => {
    const snapshot = Array.from(selectedIds).map(id => tasks.find(t => t.id === id)).filter(Boolean);
    selectedIds.forEach((id) => deleteTask(id));
    onClear();

    toast('Tasks deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          const { addTask } = useTaskStore.getState();
          snapshot.forEach(t => {
            if (t) addTask({ title: t.title, description: t.description, status: t.status, priority: t.priority, assignee: t.assignee, due_date: t.due_date, project_id: t.project_id });
          });
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-primary/5 border-b border-primary/20 animate-fade-in">
      <span className="text-sm font-medium text-primary shrink-0">{selectedIds.size} selected</span>

      <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
        <Select onValueChange={(v) => handleBulkMove(v as TaskStatus)} disabled={!canMove}>
          <SelectTrigger className="h-8 w-[140px]" disabled={!canMove}>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5" />
              <SelectValue placeholder="Move to..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => {
              const cs = getColumnColorStyle(col.color);
              return (
                <SelectItem key={col.id} value={col.id}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', cs.dot)} />
                    {col.title}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => handleBulkPriority(v as TaskPriority)}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-priority-high" />High</span></SelectItem>
            <SelectItem value="medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-priority-medium" />Medium</span></SelectItem>
            <SelectItem value="low"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-priority-low" />Low</span></SelectItem>
          </SelectContent>
        </Select>

        <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={!canDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
        </Button>

        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
