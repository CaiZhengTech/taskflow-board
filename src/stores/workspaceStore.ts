import { create } from 'zustand';

// =============================================================================
// WORKSPACE STORE
// TODO: Replace mock data with PostgreSQL API calls
// API endpoints:
//   GET    /api/workspaces          - List user's workspaces
//   POST   /api/workspaces          - Create workspace
//   POST   /api/workspaces/join     - Join via code
//   GET    /api/workspaces/:id/members - List members
//   POST   /api/workspaces/:id/invite  - Invite member
//   PATCH  /api/workspaces/:id/members/:userId - Update role
//   DELETE /api/workspaces/:id/members/:userId - Remove member
// =============================================================================

export type WorkspaceRole = 'owner' | 'manager' | 'contributor' | 'viewer';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatarInitial: string;
}

export interface Workspace {
  id: string;
  name: string;
  code: string;
  role: WorkspaceRole;
  memberCount: number;
  isArchived?: boolean;
}

// Board presets
export interface BoardPreset {
  id: string;
  name: string;
  description: string;
  columns: string[];
  labels: string[];
  colorScheme: string;
}

export const BOARD_PRESETS: BoardPreset[] = [
  {
    id: 'sdlc',
    name: 'Software Development',
    description: 'Standard SDLC workflow with backlog, sprint planning, and deployment stages',
    columns: ['Backlog', 'Ready', 'In Progress', 'Code Review', 'Testing', 'Done'],
    labels: ['Bug', 'Feature', 'Refactor', 'Docs', 'DevOps'],
    colorScheme: 'blue',
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Plan and track marketing campaigns from ideation to launch',
    columns: ['Ideas', 'Planning', 'In Production', 'Review', 'Published'],
    labels: ['Social', 'Email', 'Blog', 'Ad', 'Event'],
    colorScheme: 'purple',
  },
  {
    id: 'content',
    name: 'Content Pipeline',
    description: 'Manage content creation from drafts to publication',
    columns: ['Topic Ideas', 'Writing', 'Editing', 'Design', 'Published'],
    labels: ['Article', 'Video', 'Podcast', 'Infographic', 'Tutorial'],
    colorScheme: 'green',
  },
  {
    id: 'kanban',
    name: 'Simple Kanban',
    description: 'Classic three-column Kanban board',
    columns: ['To Do', 'Doing', 'Done'],
    labels: ['Urgent', 'Normal', 'Low'],
    colorScheme: 'neutral',
  },
];

interface WorkspaceStore {
  workspaces: Workspace[];
  archivedWorkspaces: Workspace[];
  currentWorkspace: Workspace | null;
  members: WorkspaceMember[];
  activePreset: string | null;

  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (name: string) => Workspace;
  archiveWorkspace: (id: string) => void;
  restoreWorkspace: (id: string) => void;
  setActivePreset: (presetId: string | null) => void;
}

const mockMembers: WorkspaceMember[] = [
  { id: '1', name: 'You', email: 'demo@taskboard.io', role: 'owner', avatarInitial: 'Y' },
  { id: '2', name: 'Alex Chen', email: 'alex@company.com', role: 'manager', avatarInitial: 'A' },
  { id: '3', name: 'Sarah Miller', email: 'sarah@company.com', role: 'contributor', avatarInitial: 'S' },
  { id: '4', name: 'John Doe', email: 'john@company.com', role: 'viewer', avatarInitial: 'J' },
];

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [
    { id: '1', name: 'Engineering Team', code: 'ENG-2024', role: 'owner', memberCount: 8 },
    { id: '2', name: 'Design Sprint', code: 'DSN-001', role: 'contributor', memberCount: 4 },
  ],
  archivedWorkspaces: [
    { id: '3', name: 'Q3 Marketing Campaign', code: 'MKT-Q3', role: 'owner', memberCount: 6, isArchived: true },
    { id: '4', name: 'Website Redesign 2023', code: 'WEB-23', role: 'manager', memberCount: 5, isArchived: true },
  ],
  currentWorkspace: null,
  members: mockMembers,
  activePreset: null,

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  addWorkspace: (name) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name,
      code: `WS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      role: 'owner',
      memberCount: 1,
    };
    set((state) => ({ workspaces: [...state.workspaces, newWorkspace] }));
    return newWorkspace;
  },

  archiveWorkspace: (id) => {
    set((state) => {
      const ws = state.workspaces.find((w) => w.id === id);
      if (!ws) return state;
      return {
        workspaces: state.workspaces.filter((w) => w.id !== id),
        archivedWorkspaces: [...state.archivedWorkspaces, { ...ws, isArchived: true }],
      };
    });
  },

  restoreWorkspace: (id) => {
    set((state) => {
      const ws = state.archivedWorkspaces.find((w) => w.id === id);
      if (!ws) return state;
      return {
        archivedWorkspaces: state.archivedWorkspaces.filter((w) => w.id !== id),
        workspaces: [...state.workspaces, { ...ws, isArchived: false }],
      };
    });
  },

  setActivePreset: (presetId) => set({ activePreset: presetId }),
}));
