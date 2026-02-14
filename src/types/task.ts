export type TaskStatus = string;
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
  id: string;
  title: string;
  color: string;
}

/** Default columns — used as fallback; dynamic columns come from workspaceStore */
export const DEFAULT_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'status-backlog' },
  { id: 'ready', title: 'Ready', color: 'status-ready' },
  { id: 'in_progress', title: 'In Progress', color: 'status-progress' },
  { id: 'completed', title: 'Completed', color: 'status-completed' },
];

/**
 * Static color style map for Tailwind JIT compatibility.
 * Maps a color token (e.g. "status-backlog") to its dot, bg, and ring classes.
 * All class names are written statically so Tailwind can detect them at build time.
 */
export const COLUMN_COLOR_STYLES: Record<string, { dot: string; bg: string; ring: string }> = {
  'status-backlog':    { dot: 'bg-status-backlog',    bg: 'bg-status-backlog/5 border-status-backlog/20',    ring: 'ring-status-backlog/30' },
  'status-ready':      { dot: 'bg-status-ready',      bg: 'bg-status-ready/5 border-status-ready/20',        ring: 'ring-status-ready/30' },
  'status-progress':   { dot: 'bg-status-progress',   bg: 'bg-status-progress/5 border-status-progress/20',  ring: 'ring-status-progress/30' },
  'status-completed':  { dot: 'bg-status-completed',  bg: 'bg-status-completed/5 border-status-completed/20', ring: 'ring-status-completed/30' },
  'status-rose':       { dot: 'bg-status-rose',       bg: 'bg-status-rose/5 border-status-rose/20',           ring: 'ring-status-rose/30' },
  'status-orange':     { dot: 'bg-status-orange',     bg: 'bg-status-orange/5 border-status-orange/20',       ring: 'ring-status-orange/30' },
  'status-amber':      { dot: 'bg-status-amber',      bg: 'bg-status-amber/5 border-status-amber/20',         ring: 'ring-status-amber/30' },
  'status-teal':       { dot: 'bg-status-teal',       bg: 'bg-status-teal/5 border-status-teal/20',           ring: 'ring-status-teal/30' },
  'status-indigo':     { dot: 'bg-status-indigo',     bg: 'bg-status-indigo/5 border-status-indigo/20',       ring: 'ring-status-indigo/30' },
};

/** Palette of available column colors for the color picker */
export const AVAILABLE_COLUMN_COLORS = [
  { token: 'status-backlog',   label: 'Slate' },
  { token: 'status-ready',     label: 'Blue' },
  { token: 'status-progress',  label: 'Purple' },
  { token: 'status-completed', label: 'Green' },
  { token: 'status-rose',      label: 'Rose' },
  { token: 'status-orange',    label: 'Orange' },
  { token: 'status-amber',     label: 'Amber' },
  { token: 'status-teal',      label: 'Teal' },
  { token: 'status-indigo',    label: 'Indigo' },
] as const;

const DEFAULT_COLOR_STYLE = { dot: 'bg-muted-foreground', bg: 'bg-muted/5 border-border', ring: 'ring-primary/30' };

export function getColumnColorStyle(color: string) {
  return COLUMN_COLOR_STYLES[color] ?? DEFAULT_COLOR_STYLE;
}
