import { TaskStatus, TaskPriority, COLUMNS } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsProps {
  selectedIds: Set<string>;
  onClear: () => void;
}

export function BulkActions({ selectedIds, onClear }: BulkActionsProps) {
  const { moveTask, updateTask, deleteTask, tasks } = useTaskStore();

  if (selectedIds.size === 0) return null;

  const handleBulkMove = (status: TaskStatus) => {
    const tasksInTarget = tasks.filter((t) => t.status === status);
    let nextIndex = tasksInTarget.length;
    selectedIds.forEach((id) => {
      moveTask(id, status, nextIndex++);
    });
    onClear();
  };

  const handleBulkPriority = (priority: TaskPriority) => {
    selectedIds.forEach((id) => {
      updateTask(id, { priority });
    });
    onClear();
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteTask(id));
    onClear();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/20 animate-fade-in">
      <span className="text-sm font-medium text-primary">
        {selectedIds.size} selected
      </span>

      <div className="flex items-center gap-2 ml-auto">
        <Select onValueChange={(v) => handleBulkMove(v as TaskStatus)}>
          <SelectTrigger className="h-8 w-[140px]">
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5" />
              <SelectValue placeholder="Move to..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {COLUMNS.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', `bg-${col.color}`)} />
                  {col.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => handleBulkPriority(v as TaskPriority)}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue placeholder="Priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-priority-high" />
                High
              </span>
            </SelectItem>
            <SelectItem value="medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-priority-medium" />
                Medium
              </span>
            </SelectItem>
            <SelectItem value="low">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-priority-low" />
                Low
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>

        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
