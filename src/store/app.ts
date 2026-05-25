import { create } from 'zustand';

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  notifications: any[];
  setNotifications: (list: any[]) => void;
  addNotification: (notification: any) => void;
  unreadCount: number;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark', // default theme
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(newTheme);
      }
      return { theme: newTheme };
    }),
  setTheme: (theme) =>
    set(() => {
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
      }
      return { theme };
    }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  notifications: [],
  setNotifications: (list) =>
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => {
      const newList = [notification, ...state.notifications];
      return {
        notifications: newList,
        unreadCount: newList.filter((n) => !n.read).length,
      };
    }),
  unreadCount: 0,
}));
