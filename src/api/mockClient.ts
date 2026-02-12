import type { ApiClient } from './client';
import type { TaskDto, WorkspaceDto, ColumnDto, ContactForm } from './types';

// Mock client that simulates API calls with delays
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const mockClient: ApiClient = {
  async getTasks() { await delay(); return []; },
  async createTask(task) { await delay(); return { ...task, id: `task-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as TaskDto; },
  async updateTask(id, updates) { await delay(); return { id, ...updates } as TaskDto; },
  async deleteTask() { await delay(); },
  async moveTask(id, status, orderIndex) { await delay(); return { id, status, order_index: orderIndex } as TaskDto; },

  async getWorkspaces() { await delay(); return []; },
  async createWorkspace(name) { await delay(); return { id: Date.now().toString(), name, code: `WS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`, role: 'owner', member_count: 1 } as WorkspaceDto; },
  async joinWorkspace() { await delay(); return {} as WorkspaceDto; },
  async archiveWorkspace() { await delay(); },
  async restoreWorkspace() { await delay(); },

  async getColumns() { await delay(); return []; },
  async createColumn(_, title) { await delay(); return { id: Date.now().toString(), title, color: 'gray', order_index: 0 } as ColumnDto; },
  async updateColumn(id, updates) { await delay(); return { id, ...updates } as ColumnDto; },
  async deleteColumn() { await delay(); },
  async applyPreset() { await delay(); return []; },

  async submitContact() { await delay(500); },
};
