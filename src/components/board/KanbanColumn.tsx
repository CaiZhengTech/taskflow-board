import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus } from '@/types/task';
import { useTaskStore, getTasksByStatus } from '@/stores/taskStore';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  colorClass: string;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({ id, title, colorClass, onAddTask }: KanbanColumnProps) {
  const allTasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  
  const tasks = useMemo(() => 
    getTasksByStatus(allTasks, filters, id),
    [allTasks, filters, id]
  );
  
  const { setNodeRef, isOver } = useDroppable({ id });

  const columnBgColors: Record<TaskStatus, string> = {
    backlog: 'bg-status-backlog/5 border-status-backlog/20',
    ready: 'bg-status-ready/5 border-status-ready/20',
    in_progress: 'bg-status-progress/5 border-status-progress/20',
    completed: 'bg-status-completed/5 border-status-completed/20',
  };

  const dotColors: Record<TaskStatus, string> = {
    backlog: 'bg-status-backlog',
    ready: 'bg-status-ready',
    in_progress: 'bg-status-progress',
    completed: 'bg-status-completed',
  };

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] md:w-[300px] lg:flex-1 lg:min-w-0 lg:max-w-[320px]">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div className={cn('w-3 h-3 rounded-full', dotColors[id])} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 flex flex-col gap-2 p-3 rounded-xl border min-h-[400px] transition-all',
          columnBgColors[id],
          isOver && 'ring-2 ring-primary/30 bg-primary/5'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8 opacity-60">
            No tasks yet
          </div>
        )}
        
        <button
          onClick={() => onAddTask(id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card/80 rounded-lg border border-dashed border-border/50 hover:border-border transition-all mt-auto"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>
    </div>
  );
}
