import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { COLUMNS, Task, TaskStatus } from '@/types/task';
import { useTaskStore, filterTasks } from '@/stores/taskStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCardOverlay } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailPanel } from './TaskDetailPanel';

export function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('backlog');

  const allTasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const moveTask = useTaskStore(state => state.moveTask);
  const reorderTasks = useTaskStore(state => state.reorderTasks);
  const selectedTaskId = useTaskStore(state => state.selectedTaskId);
  const setSelectedTaskId = useTaskStore(state => state.setSelectedTaskId);

  const filteredTasks = useMemo(() => filterTasks(allTasks, filters), [allTasks, filters]);
  const selectedTask = allTasks.find(t => t.id === selectedTaskId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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

    const isOverColumn = COLUMNS.some(col => col.id === overId);
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
  }, [allTasks, moveTask]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    const activeTaskItem = allTasks.find(t => t.id === activeId);
    const overTask = allTasks.find(t => t.id === overId);
    if (activeTaskItem && overTask && activeTaskItem.status === overTask.status) {
      reorderTasks(activeTaskItem.status, activeId, overId);
    }
  }, [allTasks, reorderTasks]);

  const handleAddTask = (status: TaskStatus) => {
    setCreateStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 p-4 overflow-x-auto scrollbar-thin">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              colorClass={column.color}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 scale-105">
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

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
