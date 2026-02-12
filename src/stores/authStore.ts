import { create } from 'zustand';

interface UserActivity {
  id: string;
  action: string;
  taskName?: string;
  timestamp: Date;
}

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface UserStats {
  tasksCreatedLast7Days: number;
  tasksCreatedLast30Days: number;
  tasksCompleted: number;
  backlogCount: number;
  readyCount: number;
  inProgressCount: number;
  assignedToMe: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  recentActivities: UserActivity[];
  userStats: UserStats;
  featureFlags: Record<string, boolean>;

  login: (username: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (value: boolean) => void;
  addActivity: (action: string, taskName?: string) => void;
}

const demoUser: User = { id: 'user-1', username: 'demo', email: 'demo@taskboard.dev', name: 'Demo User', avatar: undefined };

const mockStats: UserStats = {
  tasksCreatedLast7Days: 12, tasksCreatedLast30Days: 47, tasksCompleted: 34,
  backlogCount: 8, readyCount: 5, inProgressCount: 3, assignedToMe: 6,
};

const mockActivities: UserActivity[] = [
  { id: '1', action: 'completed', taskName: 'API auth setup', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', action: 'created', taskName: 'Design task cards', timestamp: new Date(Date.now() - 7200000) },
  { id: '3', action: 'moved to In Progress', taskName: 'Fix login bug', timestamp: new Date(Date.now() - 10800000) },
  { id: '4', action: 'created', taskName: 'Update documentation', timestamp: new Date(Date.now() - 86400000) },
  { id: '5', action: 'completed', taskName: 'Database migration', timestamp: new Date(Date.now() - 172800000) },
];

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  recentActivities: [],
  userStats: mockStats,
  featureFlags: { bulkOps: true, boardPresets: true },

  login: (username, password) => {
    if (username === 'demo' && password === 'demo123') {
      set({ user: demoUser, isAuthenticated: true, recentActivities: mockActivities });
      return true;
    }
    return false;
  },

  logout: () => set({ user: null, isAuthenticated: false, recentActivities: [] }),

  setUser: (user) => set({ user }),

  setIsAuthenticated: (value) => {
    set({ isAuthenticated: value });
    if (value) set({ recentActivities: mockActivities });
  },

  addActivity: (action, taskName) => {
    const newActivity: UserActivity = { id: Date.now().toString(), action, taskName, timestamp: new Date() };
    set({ recentActivities: [newActivity, ...get().recentActivities].slice(0, 20) });
  },
}));
