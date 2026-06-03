import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/*
* Состояние для управления языком приложения (i18n).
* Позволяет сохранять выбранный язык в localStorage для сохранения при перезагрузке страницы.
*/

interface I18nState {
  lang: 'ru' | 'en' | 'uk';
  setLang: (lang: 'ru' | 'en' | 'uk') => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'app-lang-state' }
  )
);