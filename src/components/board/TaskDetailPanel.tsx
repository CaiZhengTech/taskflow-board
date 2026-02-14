import { useState, useEffect, useRef, useCallback } from 'react';
import { Task, TaskStatus, TaskPriority, getColumnColorStyle } from '@/types/task';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHasPermission } from '@/components/guards/withRole';
import { X, Calendar, Trash2, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
}

/**
 * Get all focusable elements inside a container.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const { updateTask, deleteTask } = useTaskStore();
  const columns = useWorkspaceStore(state => state.columns);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const canEdit = useHasPermission('edit_task');
  const canDelete = useHasPermission('delete_task');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus trap: keep Tab / Shift+Tab within the panel
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = getFocusableElements(panelRef.current);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [handleFocusTrap]);

  // Auto-focus the close button on mount
  useEffect(() => {
    if (panelRef.current) {
      const firstBtn = panelRef.current.querySelector<HTMLElement>('button');
      firstBtn?.focus();
    }
  }, []);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    } else {
      setTitle(task.title);
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task.description || '')) {
      updateTask(task.id, { description: description || undefined });
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border shadow-lg z-50 animate-slide-in-right overflow-y-auto"
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            {task.id}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close task details">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle && canEdit ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                autoFocus
                className="text-lg font-semibold"
              />
            ) : (
              <h2
                id="task-detail-title"
                className={cn(
                  'text-lg font-semibold rounded px-2 py-1 -mx-2',
                  canEdit && 'cursor-pointer hover:bg-muted/50',
                )}
                onClick={() => canEdit && setIsEditingTitle(true)}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={task.status}
                onValueChange={(value: TaskStatus) => updateTask(task.id, { status: value })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => {
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
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(value: TaskPriority) => updateTask(task.id, { priority: value })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due Date
            </Label>
            <Input
              type="date"
              value={task.due_date || ''}
              onChange={(e) => updateTask(task.id, { due_date: e.target.value || undefined })}
              disabled={!canEdit}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Assignee
            </Label>
            <div className="flex items-center gap-2 text-sm">
              {task.assignee ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span>{task.assignee.username}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder={canEdit ? 'Add a description...' : 'No description'}
              className="min-h-[120px] resize-none"
              disabled={!canEdit}
            />
            {canEdit && <p className="text-[10px] text-muted-foreground">Markdown supported</p>}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
            <p>Created: {formatDate(task.created_at)}</p>
            <p>Updated: {formatDate(task.updated_at)}</p>
          </div>

          {/* Delete */}
          {canDelete ? (
            <div className="pt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            </div>
          ) : !canEdit ? (
            <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              View only — you don't have edit permissions
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
