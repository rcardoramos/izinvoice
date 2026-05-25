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
  theme: 'light', // default theme
  toggleTheme: () => {}, // disabled for exclusive light mode
  setTheme: () => {}, // disabled for exclusive light mode
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
