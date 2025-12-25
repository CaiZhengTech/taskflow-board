import { useState } from 'react';
import { BoardHeader } from '@/components/board/BoardHeader';
import { BoardFilters } from '@/components/board/BoardFilters';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CreateTaskModal } from '@/components/board/CreateTaskModal';

export function BoardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BoardHeader onNewTask={() => setIsCreateModalOpen(true)} />
      <BoardFilters />
      <KanbanBoard />
      
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus="backlog"
      />
    </div>
  );
}
