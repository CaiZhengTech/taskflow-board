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

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] md:w-[300px] lg:flex-1 lg:min-w-0 lg:max-w-[320px]">
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div className={cn('w-3 h-3 rounded-full', `bg-${colorClass}`)} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="ml-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 flex flex-col gap-2 p-2 rounded-lg bg-muted/30 min-h-[200px] transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/20'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground py-8">
            No tasks
          </div>
        )}
        
        <button
          onClick={() => onAddTask(id)}
          className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors mt-auto"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>
    </div>
  );
}
