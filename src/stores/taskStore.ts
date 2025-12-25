import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, User } from '@/types/task';

interface TaskFilters {
  search: string;
  priority: TaskPriority | null;
  assignee: string | null;
  dueDate: 'overdue' | 'this_week' | null;
}

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  selectedTaskId: string | null;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order_index'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
  reorderTasks: (status: TaskStatus, activeId: string, overId: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setSelectedTaskId: (id: string | null) => void;
}

// Demo data
const demoUser: User = {
  id: 'user-1',
  username: 'demo',
  email: 'demo@taskboard.dev',
};

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design system implementation',
    description: 'Create a comprehensive design system with tokens, components, and documentation.',
    status: 'completed',
    priority: 'high',
    assignee: demoUser,
    due_date: '2025-12-20',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2025-12-20T15:30:00Z',
    order_index: 0,
    project_id: 'project-1',
  },
  {
    id: 'task-2',
    title: 'User authentication flow',
    description: 'Implement JWT-based authentication with login, register, and password reset.',
    status: 'in_progress',
    priority: 'high',
    assignee: demoUser,
    due_date: '2025-12-28',
    created_at: '2025-12-05T09:00:00Z',
    updated_at: '2025-12-22T11:00:00Z',
    order_index: 0,
    project_id: 'project-1',
  },
  {
    id: 'task-3',
    title: 'Drag and drop functionality',
    description: 'Add smooth drag and drop for task cards between columns using @dnd-kit.',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2025-12-30',
    created_at: '2025-12-10T14:00:00Z',
    updated_at: '2025-12-23T09:00:00Z',
    order_index: 1,
    project_id: 'project-1',
  },
  {
    id: 'task-4',
    title: 'API integration',
    description: 'Connect frontend to Django REST backend for persistent data.',
    status: 'ready',
    priority: 'high',
    due_date: '2025-12-29',
    created_at: '2025-12-12T08:00:00Z',
    updated_at: '2025-12-20T10:00:00Z',
    order_index: 0,
    project_id: 'project-1',
  },
  {
    id: 'task-5',
    title: 'Mobile responsive design',
    description: 'Ensure the board works well on mobile devices with horizontal scrolling.',
    status: 'ready',
    priority: 'medium',
    created_at: '2025-12-15T11:00:00Z',
    updated_at: '2025-12-18T14:00:00Z',
    order_index: 1,
    project_id: 'project-1',
  },
  {
    id: 'task-6',
    title: 'Project settings page',
    description: 'Add ability to manage project members and roles.',
    status: 'backlog',
    priority: 'low',
    created_at: '2025-12-16T10:00:00Z',
    updated_at: '2025-12-16T10:00:00Z',
    order_index: 0,
    project_id: 'project-1',
  },
  {
    id: 'task-7',
    title: 'Dark mode support',
    description: 'Implement dark mode toggle with system preference detection.',
    status: 'backlog',
    priority: 'low',
    created_at: '2025-12-17T09:00:00Z',
    updated_at: '2025-12-17T09:00:00Z',
    order_index: 1,
    project_id: 'project-1',
  },
  {
    id: 'task-8',
    title: 'Keyboard shortcuts',
    description: 'Add keyboard shortcuts for common actions (new task, navigation).',
    status: 'backlog',
    priority: 'medium',
    created_at: '2025-12-18T08:00:00Z',
    updated_at: '2025-12-18T08:00:00Z',
    order_index: 2,
    project_id: 'project-1',
  },
];

const initialFilters: TaskFilters = {
  search: '',
  priority: null,
  assignee: null,
  dueDate: null,
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: initialTasks,
  filters: initialFilters,
  selectedTaskId: null,

  addTask: (taskData) => {
    set((state) => {
      const tasksInStatus = state.tasks.filter(t => t.status === taskData.status);
      const maxIndex = tasksInStatus.length > 0 
        ? Math.max(...tasksInStatus.map(t => t.order_index))
        : -1;

      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_index: maxIndex + 1,
      };

      return { tasks: [...state.tasks, newTask] };
    });
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({ 
      tasks: state.tasks.filter(task => task.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    }));
  },

  moveTask: (taskId, newStatus, newIndex) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      const oldStatus = task.status;
      
      const updatedTasks = state.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus, order_index: newIndex, updated_at: new Date().toISOString() };
        }
        
        if (t.status === newStatus && t.id !== taskId && t.order_index >= newIndex) {
          return { ...t, order_index: t.order_index + 1 };
        }
        
        if (oldStatus !== newStatus && t.status === oldStatus && t.order_index > task.order_index) {
          return { ...t, order_index: t.order_index - 1 };
        }
        
        return t;
      });

      return { tasks: updatedTasks };
    });
  },

  reorderTasks: (status, activeId, overId) => {
    set((state) => {
      const columnTasks = state.tasks
        .filter(t => t.status === status)
        .sort((a, b) => a.order_index - b.order_index);
      
      const activeIndex = columnTasks.findIndex(t => t.id === activeId);
      const overIndex = columnTasks.findIndex(t => t.id === overId);
      
      if (activeIndex === -1 || overIndex === -1) return state;

      const reordered = [...columnTasks];
      const [removed] = reordered.splice(activeIndex, 1);
      reordered.splice(overIndex, 0, removed);

      const updatedTasks = state.tasks.map(t => {
        if (t.status === status) {
          const newIndex = reordered.findIndex(ct => ct.id === t.id);
          return { ...t, order_index: newIndex };
        }
        return t;
      });

      return { tasks: updatedTasks };
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  setSelectedTaskId: (id) => {
    set({ selectedTaskId: id });
  },
}));

// Selector functions - use these outside the store
export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter(task => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription) return false;
    }

    if (filters.priority && task.priority !== filters.priority) return false;

    if (filters.assignee && task.assignee?.id !== filters.assignee) return false;

    if (filters.dueDate) {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.dueDate === 'overdue') {
        if (dueDate >= today) return false;
      } else if (filters.dueDate === 'this_week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (dueDate < today || dueDate > weekEnd) return false;
      }
    }

    return true;
  });
};

export const getTasksByStatus = (tasks: Task[], filters: TaskFilters, status: TaskStatus): Task[] => {
  return filterTasks(tasks, filters)
    .filter(task => task.status === status)
    .sort((a, b) => a.order_index - b.order_index);
};
