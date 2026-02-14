import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { useHasPermission } from '@/components/guards/withRole';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  high: 'bg-priority-high/10 text-priority-high border-priority-high/20',
  medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
  low: 'bg-priority-low/10 text-priority-low border-priority-low/20',
} as const;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function TaskCardBody({ task }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className="p-3">
      <h4 className="text-sm font-medium text-foreground leading-snug mb-2">{task.title}</h4>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border', priorityColors[task.priority])}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className={cn('inline-flex items-center gap-1 text-[11px]', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </span>
        )}
        {task.assignee && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
            <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-2.5 w-2.5 text-primary" />
            </div>
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskCard({ task }: TaskCardProps) {
  const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId);
  const toggleSelection = useTaskStore((state) => state.toggleSelection);
  const selection = useTaskStore((state) => state.selection);
  const isSelected = selection.has(task.id);
  const hasSelection = selection.size > 0;

  const canMove = useHasPermission('move_task');
  const canEdit = useHasPermission('edit_task');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canMove,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.metaKey || e.ctrlKey) && canEdit) {
      e.preventDefault();
      toggleSelection(task.id);
    } else {
      // Always allow opening the detail panel (view); read-only gating is done there
      setSelectedTaskId(task.id);
    }
  };

  // Only spread drag listeners when the user has move permission
  const dragProps = canMove ? { ...attributes, ...listeners } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className={cn(
        'group relative bg-card rounded-md border shadow-card transition-all duration-150',
        !canMove && 'cursor-pointer',
        'hover:shadow-card-hover hover:border-primary/30',
        isDragging && 'shadow-lg scale-[1.02] ring-2 ring-primary/20',
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border',
      )}
      onClick={handleClick}
      role="button"
      aria-roledescription={canMove ? 'sortable task' : 'task'}
      aria-label={task.title}
    >
      {/* Selection checkbox – only show when edit permission exists */}
      {canEdit && (hasSelection || isSelected) && (
        <div className="absolute top-2 right-2 z-10">
          <div className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
            isSelected ? 'bg-primary border-primary' : 'border-border bg-card',
          )}>
            {isSelected && <span className="text-primary-foreground text-[10px] font-bold">✓</span>}
          </div>
        </div>
      )}
      <TaskCardBody task={task} />
    </div>
  );
}

export function TaskCardOverlay({ task }: TaskCardProps) {
  return (
    <div className={cn('relative bg-card rounded-md border border-border shadow-lg', 'hover:border-primary/30 transition-all duration-150')}>
      <TaskCardBody task={task} />
    </div>
  );
}
