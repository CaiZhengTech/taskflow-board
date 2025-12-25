import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (value: boolean) => void;
}

// Demo user for testing
const demoUser: User = {
  id: 'user-1',
  username: 'demo',
  email: 'demo@taskboard.dev',
  name: 'Demo User',
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (username: string, password: string) => {
    if (username === 'demo' && password === 'demo123') {
      set({ user: demoUser, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    set({ user });
  },

  setIsAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },
}));
