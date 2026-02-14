import { useState, useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
  type CollisionDetection,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Task, TaskStatus, getColumnColorStyle } from '@/types/task';
import { useTaskStore, filterTasks } from '@/stores/taskStore';
import { useWorkspaceStore, type WorkspaceColumn } from '@/stores/workspaceStore';
import { useHasPermission } from '@/components/guards/withRole';
import { KanbanColumn } from './KanbanColumn';
import { TaskCardOverlay } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailPanel } from './TaskDetailPanel';
import { ColumnDeleteDialog } from './ColumnDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Custom collision detection: for task drags, try pointerWithin first (precise)
 * then fall back to rectIntersection (generous). For column drags, use
 * closestCenter which avoids jitter by picking the nearest center consistently.
 */
function createKanbanCollision(activeTypeRef: React.RefObject<DragItemType | null>): CollisionDetection {
  return (args) => {
    if (activeTypeRef.current === 'column') {
      return closestCenter(args);
    }
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  };
}

const measuring = {
  droppable: { strategy: MeasuringStrategy.WhileDragging },
};

type DragItemType = 'task' | 'column';

export function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<WorkspaceColumn | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('backlog');
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const dndAnnouncement = useRef<HTMLDivElement>(null);
  const activeTypeRef = useRef<DragItemType | null>(null);
  const collisionDetection = useMemo(() => createKanbanCollision(activeTypeRef), []);

  /** Announce drag events for screen readers */
  const announce = useCallback((msg: string) => {
    if (dndAnnouncement.current) dndAnnouncement.current.textContent = msg;
  }, []);

  const allTasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const moveTask = useTaskStore(state => state.moveTask);
  const reorderTasks = useTaskStore(state => state.reorderTasks);
  const selectedTaskId = useTaskStore(state => state.selectedTaskId);
  const setSelectedTaskId = useTaskStore(state => state.setSelectedTaskId);
  const columns = useWorkspaceStore(state => state.columns);
  const addColumn = useWorkspaceStore(state => state.addColumn);
  const reorderColumns = useWorkspaceStore(state => state.reorderColumns);
  const canManageCols = useHasPermission('manage_columns');
  const columnIds = useMemo(() => columns.map(c => c.id), [columns]);

  const filteredTasks = useMemo(() => filterTasks(allTasks, filters), [allTasks, filters]);
  const selectedTask = allTasks.find(t => t.id === selectedTaskId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    const type = event.active.data.current?.type as DragItemType | undefined;
    activeTypeRef.current = type ?? 'task';

    if (type === 'column') {
      const col = useWorkspaceStore.getState().columns.find(c => c.id === id);
      if (col) {
        setActiveColumn(col);
        announce(`Picked up column: ${col.title}`);
      }
    } else {
      const tasks = useTaskStore.getState().tasks;
      const task = tasks.find(t => t.id === id);
      if (task) {
        setActiveTask(task);
        announce(`Picked up task: ${task.title}`);
      }
    }
  }, [announce]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // If we're dragging a column, don't do task-level logic
    if (active.data.current?.type === 'column') return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const tasks = useTaskStore.getState().tasks;
    const colIds = useWorkspaceStore.getState().columns.map(c => c.id);
    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    const isOverColumn = colIds.includes(overId);
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTaskItem.status !== newStatus) {
        moveTask(activeId, newStatus, tasks.filter(t => t.status === newStatus).length);
      }
      return;
    }

    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTaskItem.status !== overTask.status) {
      moveTask(activeId, overTask.status, overTask.order_index);
    }
  }, [moveTask]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    activeTypeRef.current = null;

    // ─── Column drag end ──────────────────────────────────────────
    if (active.data.current?.type === 'column') {
      setActiveColumn(null);
      if (!over || active.id === over.id) {
        announce('Drop cancelled');
        return;
      }
      const cols = useWorkspaceStore.getState().columns;
      const fromIndex = cols.findIndex(c => c.id === active.id);
      const toIndex = cols.findIndex(c => c.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderColumns(fromIndex, toIndex);
        announce(`Moved column ${cols[fromIndex].title}`);
      }
      return;
    }

    // ─── Task drag end ────────────────────────────────────────────
    setActiveTask(null);
    if (!over) {
      announce('Drop cancelled');
      return;
    }
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const tasks = useTaskStore.getState().tasks;
    const colIds = useWorkspaceStore.getState().columns.map(c => c.id);
    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    const isOverColumn = colIds.includes(overId);
    if (isOverColumn) {
      const targetStatus = overId as TaskStatus;
      const targetCount = tasks.filter(t => t.status === targetStatus && t.id !== activeId).length;
      moveTask(activeId, targetStatus, targetCount);
      const colName = useWorkspaceStore.getState().columns.find(c => c.id === targetStatus)?.title ?? targetStatus;
      announce(`Dropped ${activeTaskItem.title} into ${colName}`);
      return;
    }

    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTaskItem.status === overTask.status) {
      reorderTasks(activeTaskItem.status, activeId, overId);
      announce(`Reordered ${activeTaskItem.title}`);
    }
  }, [moveTask, reorderTasks, reorderColumns, announce]);

  const handleAddTask = (status: TaskStatus) => {
    setCreateStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Screen-reader-only live region for DnD announcements */}
      <div ref={dndAnnouncement} role="status" aria-live="assertive" aria-atomic="true" className="sr-only" />

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-3 sm:gap-4 p-3 sm:p-4 overflow-x-auto scrollbar-thin">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                colorToken={column.color}
                onAddTask={handleAddTask}
                onRequestDelete={setDeleteColumnId}
              />
            ))}
          </SortableContext>

          {/* Add Column card — appears at end of board for managers+ */}
          {canManageCols && (
            <div className="flex flex-col min-w-[220px] w-[220px] shrink-0">
              <div className="h-[38px]" /> {/* spacer to align with column headers */}
              {addingColumn ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = newColName.trim();
                    if (name) {
                      addColumn(name);
                      toast.success(`Column "${name}" added`);
                    }
                    setNewColName('');
                    setAddingColumn(false);
                  }}
                  className="p-3 rounded-xl border border-dashed border-border bg-muted/30 space-y-2"
                >
                  <Input
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="Column name…"
                    autoFocus
                    className="h-8 text-sm"
                    onKeyDown={(e) => { if (e.key === 'Escape') { setAddingColumn(false); setNewColName(''); } }}
                  />
                  <div className="flex gap-1.5">
                    <Button type="submit" size="sm" className="flex-1 h-7 text-xs" disabled={!newColName.trim()}>
                      Add
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setAddingColumn(false); setNewColName(''); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 hover:border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all text-sm font-medium min-h-[300px] sm:min-h-[400px]"
                >
                  <Plus className="h-4 w-4" />
                  Add Column
                </button>
              )}
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask && (
            <div className="rotate-3 scale-105 opacity-90">
              <TaskCardOverlay task={activeTask} />
            </div>
          )}
          {activeColumn && (
            <div className="opacity-80 rotate-1 scale-[1.02]">
              <div className={cn(
                'min-w-[270px] w-[280px] rounded-xl border-2 border-primary/40 bg-card shadow-xl p-4'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-3 h-3 rounded-full', getColumnColorStyle(activeColumn.color).dot)} />
                  <h3 className="text-sm font-semibold text-foreground">{activeColumn.title}</h3>
                </div>
                <div className="h-32 rounded-lg bg-muted/30 border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                  Column contents
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus={createStatus}
      />

      <ColumnDeleteDialog
        columnId={deleteColumnId}
        onClose={() => setDeleteColumnId(null)}
      />

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
