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
  // TODO: Add password hash when integrating with backend (never store plaintext passwords)
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
  theme: 'light' | 'dark' | 'system';
  recentActivities: UserActivity[];
  userStats: UserStats;
  
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addActivity: (action: string, taskName?: string) => void;
  
  // TODO: Implement with backend - these are placeholder functions
  // changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  // deleteAccount: (email: string) => Promise<boolean>;
}

// Demo user for testing
const demoUser: User = {
  id: 'user-1',
  username: 'demo',
  email: 'demo@taskboard.dev',
  name: 'Demo User',
  avatar: undefined,
};

// Mock stats for demo
const mockStats: UserStats = {
  tasksCreatedLast7Days: 12,
  tasksCreatedLast30Days: 47,
  tasksCompleted: 34,
  backlogCount: 8,
  readyCount: 5,
  inProgressCount: 3,
  assignedToMe: 6,
};

// Mock recent activities
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
  theme: 'light',
  recentActivities: [],
  userStats: mockStats,

  login: (username: string, password: string) => {
    if (username === 'demo' && password === 'demo123') {
      set({ 
        user: demoUser, 
        isAuthenticated: true,
        recentActivities: mockActivities,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false,
      recentActivities: [],
    });
  },

  setUser: (user: User) => {
    set({ user });
  },

  setIsAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
    if (value) {
      set({ recentActivities: mockActivities });
    }
  },

  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  addActivity: (action: string, taskName?: string) => {
    const newActivity: UserActivity = {
      id: Date.now().toString(),
      action,
      taskName,
      timestamp: new Date(),
    };
    set({ 
      recentActivities: [newActivity, ...get().recentActivities].slice(0, 20) 
    });
  },
}));
