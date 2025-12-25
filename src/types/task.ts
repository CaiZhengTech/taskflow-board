export type TaskStatus = 'backlog' | 'ready' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  due_date?: string;
  created_at: string;
  updated_at: string;
  order_index: number;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'status-backlog' },
  { id: 'ready', title: 'Ready', color: 'status-ready' },
  { id: 'in_progress', title: 'In Progress', color: 'status-progress' },
  { id: 'completed', title: 'Completed', color: 'status-completed' },
];
