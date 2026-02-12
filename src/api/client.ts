import type { TaskDto, WorkspaceDto, ColumnDto, ContactForm } from './types';

export interface ApiClient {
  // Tasks
  getTasks(workspaceId: string): Promise<TaskDto[]>;
  createTask(task: Omit<TaskDto, 'id' | 'created_at' | 'updated_at'>): Promise<TaskDto>;
  updateTask(id: string, updates: Partial<TaskDto>): Promise<TaskDto>;
  deleteTask(id: string): Promise<void>;
  moveTask(id: string, status: string, orderIndex: number): Promise<TaskDto>;

  // Workspaces
  getWorkspaces(): Promise<WorkspaceDto[]>;
  createWorkspace(name: string): Promise<WorkspaceDto>;
  joinWorkspace(code: string): Promise<WorkspaceDto>;
  archiveWorkspace(id: string): Promise<void>;
  restoreWorkspace(id: string): Promise<void>;

  // Columns
  getColumns(workspaceId: string): Promise<ColumnDto[]>;
  createColumn(workspaceId: string, title: string): Promise<ColumnDto>;
  updateColumn(id: string, updates: Partial<ColumnDto>): Promise<ColumnDto>;
  deleteColumn(id: string): Promise<void>;
  applyPreset(workspaceId: string, presetId: string): Promise<ColumnDto[]>;

  // Contact
  submitContact(form: ContactForm): Promise<void>;
}
