import { useState, useCallback, useMemo } from 'react';
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
  type CollisionDetection,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus, getColumnColorStyle } from '@/types/task';
import { useTaskStore, filterTasks } from '@/stores/taskStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
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

/**
 * Custom collision detection: try pointerWithin first (precise), fall back to
 * rectIntersection (generous). This makes dropping into columns feel natural —
 * you don't need to hover exactly over a card, just anywhere inside the column.
 */
const kanbanCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

const measuring = {
  droppable: { strategy: MeasuringStrategy.Always },
};

export function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('backlog');
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');

  const allTasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const moveTask = useTaskStore(state => state.moveTask);
  const reorderTasks = useTaskStore(state => state.reorderTasks);
  const selectedTaskId = useTaskStore(state => state.selectedTaskId);
  const setSelectedTaskId = useTaskStore(state => state.setSelectedTaskId);
  const columns = useWorkspaceStore(state => state.columns);
  const addColumn = useWorkspaceStore(state => state.addColumn);
  const canManageCols = useHasPermission('manage_columns');
  const columnIds = useMemo(() => new Set(columns.map(c => c.id)), [columns]);

  const filteredTasks = useMemo(() => filterTasks(allTasks, filters), [allTasks, filters]);
  const selectedTask = allTasks.find(t => t.id === selectedTaskId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = allTasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [allTasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeTaskItem = allTasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    const isOverColumn = columnIds.has(overId);
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTaskItem.status !== newStatus) {
        moveTask(activeId, newStatus, allTasks.filter(t => t.status === newStatus).length);
      }
      return;
    }

    const overTask = allTasks.find(t => t.id === overId);
    if (overTask && activeTaskItem.status !== overTask.status) {
      moveTask(activeId, overTask.status, overTask.order_index);
    }
  }, [allTasks, moveTask, columnIds]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeTaskItem = allTasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    // Dropped over a column droppable (empty space or bottom of column)
    const isOverColumn = columnIds.has(overId);
    if (isOverColumn) {
      const targetStatus = overId as TaskStatus;
      // Move to end of target column
      const targetCount = allTasks.filter(t => t.status === targetStatus && t.id !== activeId).length;
      moveTask(activeId, targetStatus, targetCount);
      return;
    }

    // Dropped over a task card — reorder within same column
    const overTask = allTasks.find(t => t.id === overId);
    if (overTask && activeTaskItem.status === overTask.status) {
      reorderTasks(activeTaskItem.status, activeId, overId);
    }
  }, [allTasks, reorderTasks, moveTask, columnIds]);

  const handleAddTask = (status: TaskStatus) => {
    setCreateStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={kanbanCollision}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-3 sm:gap-4 p-3 sm:p-4 overflow-x-auto scrollbar-thin">
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
