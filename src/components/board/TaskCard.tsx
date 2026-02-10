import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
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
        <span
          className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border',
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px]',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
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

/**
 * Sortable card used inside columns.
 */
export function TaskCard({ task }: TaskCardProps) {
  const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-card rounded-md border border-border shadow-card cursor-grab active:cursor-grabbing',
        'hover:shadow-card-hover hover:border-primary/30 transition-all duration-150',
        isDragging && 'opacity-50 shadow-lg rotate-2 scale-105'
      )}
      onClick={() => setSelectedTaskId(task.id)}
    >
      <TaskCardBody task={task} />
    </div>
  );
}

/**
 * Non-sortable visual used for DragOverlay.
 * IMPORTANT: DragOverlay should not render a sortable item (avoids measure loop / max depth).
 */
export function TaskCardOverlay({ task }: TaskCardProps) {
  return (
    <div
      className={cn(
        'relative bg-card rounded-md border border-border shadow-lg',
        'hover:border-primary/30 transition-all duration-150'
      )}
    >
      <TaskCardBody task={task} />
    </div>
  );
}
