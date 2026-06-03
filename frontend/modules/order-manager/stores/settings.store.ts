import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lang } from '../models';

// ─── Стор глобальных настроек приложения ────────────────────────────────────
// Хранит baseUrl, locale (для бэкенда), lang (для UI), тему
// persist сохраняет в localStorage между сессиями

interface SettingsStore {
  baseUrl: string;    // URL Python-сервера
  locale: string;     // Accept-Language header (en / uk / ru)
  lang: Lang;         // Язык интерфейса
  dark: boolean;      // Тёмная тема

  setBaseUrl: (url: string) => void;
  setLocale:  (locale: string) => void;
  setLang:    (lang: Lang) => void;
  toggleDark: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      baseUrl: 'http://127.0.0.1:8000/api/v1',
      locale:  'en',
      lang:    'en',
      dark:    false,

      setBaseUrl:  (url)    => set({ baseUrl: url }),
      setLocale:   (locale) => set({ locale }),
      setLang:     (lang)   => set({ lang }),
      toggleDark:  ()       => set((s) => ({ dark: !s.dark })),
    }),
    { name: 'order-tester-settings' }
  )
);
