import { useMemo, useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus, getColumnColorStyle, AVAILABLE_COLUMN_COLORS } from '@/types/task';
import { useTaskStore, getTasksByStatus } from '@/stores/taskStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useHasPermission } from '@/components/guards/withRole';
import { TaskCard } from './TaskCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Palette, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  colorToken: string;
  onAddTask: (status: TaskStatus) => void;
  onRequestDelete?: (id: string) => void;
}

export function KanbanColumn({ id, title, colorToken, onAddTask, onRequestDelete }: KanbanColumnProps) {
  const allTasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const canCreate = useHasPermission('create_task');
  const canManageCols = useHasPermission('manage_columns');
  const renameColumn = useWorkspaceStore(state => state.renameColumn);
  const updateColumnColor = useWorkspaceStore(state => state.updateColumnColor);
  const columns = useWorkspaceStore(state => state.columns);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);
  
  const tasks = useMemo(() => 
    getTasksByStatus(allTasks, filters, id),
    [allTasks, filters, id]
  );
  
  const { setNodeRef, isOver } = useDroppable({ id });

  const colorStyle = getColumnColorStyle(colorToken);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== title) {
      renameColumn(id, trimmed);
    } else {
      setRenameValue(title);
    }
    setIsRenaming(false);
  };

  return (
    <div className="flex flex-col min-w-[270px] w-[270px] sm:min-w-[280px] sm:w-[280px] md:w-auto md:flex-1">
      <div className="flex items-center gap-2 px-3 py-2 mb-2 group/header">
        <div className={cn('w-3 h-3 rounded-full shrink-0', colorStyle.dot)} />

        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setRenameValue(title); setIsRenaming(false); }
            }}
            className="text-sm font-semibold text-foreground bg-transparent border-b border-primary outline-none flex-1 min-w-0 py-0"
          />
        ) : (
          <h3
            className={cn(
              'text-sm font-semibold text-foreground truncate',
              canManageCols && 'cursor-pointer hover:underline decoration-dashed underline-offset-2',
            )}
            onDoubleClick={() => {
              if (!canManageCols) return;
              setRenameValue(title);
              setIsRenaming(true);
            }}
            title={canManageCols ? 'Double-click to rename' : title}
          >
            {title}
          </h3>
        )}

        <span className="ml-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
          {tasks.length}
        </span>

        {/* Column menu — visible on hover or when manage_columns permission exists */}
        {canManageCols && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-0.5 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover/header:opacity-100 focus:opacity-100 transition-opacity ml-auto shrink-0"
                aria-label={`Column options for ${title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setRenameValue(title); setIsRenaming(true); }}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Rename
              </DropdownMenuItem>

              {/* Color sub-menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="h-3.5 w-3.5 mr-2" />
                  Color
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-1.5">
                  <div className="grid grid-cols-3 gap-1">
                    {AVAILABLE_COLUMN_COLORS.map((c) => {
                      const s = getColumnColorStyle(c.token);
                      const isActive = c.token === colorToken;
                      return (
                        <button
                          key={c.token}
                          onClick={() => updateColumnColor(id, c.token)}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors',
                            isActive ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted',
                          )}
                        >
                          <div className={cn('w-2.5 h-2.5 rounded-full', s.dot)} />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onRequestDelete?.(id)}
                disabled={columns.length <= 1}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 flex flex-col gap-2 p-3 rounded-xl border min-h-[300px] sm:min-h-[400px] transition-all',
          colorStyle.bg,
          isOver && `ring-2 ${colorStyle.ring} bg-primary/5`
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
        
        {canCreate && (
          <button
            onClick={() => onAddTask(id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card/80 rounded-lg border border-dashed border-border/50 hover:border-border transition-all mt-auto"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
