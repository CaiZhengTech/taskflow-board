// DTO types for API boundary
import { z } from 'zod';

export const TaskDtoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['backlog', 'ready', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  order_index: z.number(),
  project_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WorkspaceDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  code: z.string(),
  role: z.enum(['owner', 'manager', 'contributor', 'viewer']),
  member_count: z.number(),
  is_archived: z.boolean().optional(),
});

export const ColumnDtoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  color: z.string(),
  order_index: z.number(),
});

export const UserDtoSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional(),
  message: z.string().optional(),
});

export type TaskDto = z.infer<typeof TaskDtoSchema>;
export type WorkspaceDto = z.infer<typeof WorkspaceDtoSchema>;
export type ColumnDto = z.infer<typeof ColumnDtoSchema>;
export type UserDto = z.infer<typeof UserDtoSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;
