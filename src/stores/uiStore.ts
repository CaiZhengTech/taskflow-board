import { create } from 'zustand';

interface UiStore {
  theme: 'light' | 'dark' | 'system';
  activeModal: string | null;
  activeSidePanel: string | null;
  rolePreviewToggle: 'manager' | 'employee';
  density: 'compact' | 'cozy';

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setActiveModal: (modal: string | null) => void;
  setActiveSidePanel: (panel: string | null) => void;
  setRolePreviewToggle: (role: 'manager' | 'employee') => void;
  setDensity: (density: 'compact' | 'cozy') => void;
}

export const useUiStore = create<UiStore>((set) => ({
  theme: 'light',
  activeModal: null,
  activeSidePanel: null,
  rolePreviewToggle: 'manager',
  density: 'cozy',

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  setActiveModal: (modal) => set({ activeModal: modal }),
  setActiveSidePanel: (panel) => set({ activeSidePanel: panel }),
  setRolePreviewToggle: (role) => set({ rolePreviewToggle: role }),
  setDensity: (density) => set({ density }),
}));
