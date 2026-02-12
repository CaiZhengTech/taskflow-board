import { mockClient } from './mockClient';
import type { ApiClient } from './client';

const USE_MOCK = true;

export const api: ApiClient = USE_MOCK ? mockClient : mockClient; // swap with httpClient later

export type { ApiClient } from './client';
export type { TaskDto, WorkspaceDto, ColumnDto, UserDto, ContactForm } from './types';
