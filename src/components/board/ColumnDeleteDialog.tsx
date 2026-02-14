import { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { getColumnColorStyle } from '@/types/task';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ColumnDeleteDialogProps {
  columnId: string | null;
  onClose: () => void;
}

export function ColumnDeleteDialog({ columnId, onClose }: ColumnDeleteDialogProps) {
  const columns = useWorkspaceStore((s) => s.columns);
  const removeColumn = useWorkspaceStore((s) => s.removeColumn);
  const tasks = useTaskStore((s) => s.tasks);
  const migrateTasksToColumn = useTaskStore((s) => s.migrateTasksToColumn);

  const column = columns.find((c) => c.id === columnId);
  const taskCount = column ? tasks.filter((t) => t.status === column.id).length : 0;
  const otherColumns = columns.filter((c) => c.id !== columnId);

  const [migrateTo, setMigrateTo] = useState<string>('');

  // Reset migrateTo when dialog opens with a new column
  const defaultTarget = otherColumns[0]?.id ?? '';

  const handleConfirm = () => {
    if (!columnId) return;
    const target = migrateTo || defaultTarget;
    if (taskCount > 0 && target) {
      migrateTasksToColumn(columnId, target);
    }
    removeColumn(columnId);
    toast.success(`Column "${column?.title}" removed`);
    setMigrateTo('');
    onClose();
  };

  return (
    <AlertDialog open={!!columnId} onOpenChange={(open) => { if (!open) { setMigrateTo(''); onClose(); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{column?.title}" column?</AlertDialogTitle>
          <AlertDialogDescription>
            {taskCount > 0
              ? `This column has ${taskCount} task${taskCount > 1 ? 's' : ''}. Choose where to move them before deleting.`
              : 'This column is empty and will be removed immediately.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {taskCount > 0 && (
          <div className="py-2">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Move tasks to:
            </label>
            <Select value={migrateTo || defaultTarget} onValueChange={setMigrateTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select column…" />
              </SelectTrigger>
              <SelectContent>
                {otherColumns.map((c) => {
                  const cs = getColumnColorStyle(c.color);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', cs.dot)} />
                        {c.title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Column
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
