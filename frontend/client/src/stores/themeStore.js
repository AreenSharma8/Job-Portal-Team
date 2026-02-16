import { create } from 'zustand';

export const useThemeStore = create(
  (set, get) => ({
    theme: typeof window !== 'undefined'
      ? localStorage.getItem('theme') || 'light'
      : 'light',

    toggleTheme: () => {
      const newTheme = get().theme === 'light' ? 'dark' : 'light';
      set({ theme: newTheme });
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    },

    initTheme: () => {
      const theme = localStorage.getItem('theme') || 'light';
      set({ theme });
      document.documentElement.classList.toggle('dark', theme === 'dark');
    },
  })
);
