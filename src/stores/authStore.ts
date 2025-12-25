import { create } from 'zustand';
import { User } from '@/types/task';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
}

// Demo user for testing
const demoUser: User = {
  id: 'user-1',
  username: 'demo',
  email: 'demo@taskboard.dev',
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo auth - accept demo/demo123
    if (username === 'demo' && password === 'demo123') {
      set({ user: demoUser, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  register: async (username: string, email: string, _password: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      email,
    };
    
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    return true;
  },
}));
