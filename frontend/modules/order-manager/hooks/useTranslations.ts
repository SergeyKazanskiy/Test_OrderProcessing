import { useSettingsStore } from '../stores/settings.store';
import en from '../translations/en.json';
import uk from '../translations/uk.json';
import ru from '../translations/ru.json';
import { Lang } from '../models';

// ─── Хук переводов для модуля order-tester ───────────────────────────────────
// Адаптирован из шаблона проекта: берёт lang из settingsStore вместо i18nStore

const translations: Record<Lang, typeof en> = { en, uk, ru };

/** Используй в React-компонентах */
export const useTranslations = () => {
  const { lang } = useSettingsStore();
  return translations[lang] ?? en;
};

/** Используй вне React (в api-функциях, сторах) */
export const getT = () => {
  const lang = useSettingsStore.getState().lang ?? 'en';
  return translations[lang] ?? en;
};
