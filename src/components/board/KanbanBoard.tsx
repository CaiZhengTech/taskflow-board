import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { COLUMNS, Task, TaskStatus } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailPanel } from './TaskDetailPanel';

export function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>('backlog');
  
  const { tasks, moveTask, reorderTasks, selectedTaskId, setSelectedTaskId } = useTaskStore();
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping over a column
    const isOverColumn = COLUMNS.some(col => col.id === overId);
    if (isOverColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        const tasksInColumn = tasks.filter(t => t.status === newStatus);
        moveTask(activeId, newStatus, tasksInColumn.length);
      }
      return;
    }

    // Dropping over another task
    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      moveTask(activeId, overTask.status, overTask.order_index);
    }
  }, [tasks, moveTask]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);

    if (activeTask && overTask && activeTask.status === overTask.status) {
      reorderTasks(activeTask.status, activeId, overId);
    }
  }, [tasks, reorderTasks]);

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
              <TaskCard task={activeTask} />
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
