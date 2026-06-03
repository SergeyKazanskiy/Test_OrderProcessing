'use client';

import { useSettingsStore } from '../stores/settings.store';
import { useTranslations } from '../hooks/useTranslations';
import { Lang } from '../models';
import { ThemeToggle } from '@/core/ui/ThemeToggle';

// ─── Верхняя панель: лого + baseUrl + locale + lang + тема ──────────────────

export function TopbarView() {
  const t = useTranslations();
  const { baseUrl, locale, lang, dark, setBaseUrl, setLocale, setLang, toggleDark } = useSettingsStore();

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]
      flex items-center justify-between px-5 shrink-0 z-10">

      {/* Лого */}
      <div className="flex items-center gap-2.5 font-bold text-[15px] text-[var(--color-foreground)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
          ⬡
        </div>
        <span>Order Module</span>
        <span className="text-[var(--color-muted-foreground)] font-normal text-xs ml-1">/ API Tester</span>
      </div>

      {/* Правая часть: настройки */}
      <div className="flex items-center gap-3">

        {/* Base URL */}
        <div className="flex items-center gap-2 bg-[var(--color-muted)]
          border border-[var(--color-border)] rounded-lg px-3 py-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)] shrink-0">
            {t.settings.base_url}
          </span>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-mono
              text-[var(--color-primary)] w-52"
          />
        </div>

        {/* Locale для бэкенда (Accept-Language) */}
        <div className="flex items-center gap-1.5 bg-[var(--color-muted)]
          border border-[var(--color-border)] rounded-lg px-3 py-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)] shrink-0">
            {t.settings.locale}
          </span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-mono
              text-[var(--color-primary)] cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="uk">UK</option>
            <option value="ru">RU</option>
          </select>
        </div>

        {/* Язык UI */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="bg-[var(--color-muted)] border border-[var(--color-border)] rounded-lg
            px-3 py-2 text-xs font-mono text-[var(--color-foreground)] outline-none cursor-pointer"
        >
          <option value="en">🌐 EN</option>
          <option value="uk">🇺🇦 UK</option>
          <option value="ru">🇷🇺 RU</option>
        </select>

        {/* Кнопка переключения темы */}
        <ThemeToggle/>
        {/* <button
          onClick={toggleDark}
          title={t.settings.theme}
          className="ghost small w-9 h-9 rounded-lg border border-[var(--color-border)]
            text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button> */}
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.1 3.1l1 1M10.9 10.9l1 1M10.9 3.1l-1 1M3.1 10.9l1-1"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M12.5 9.5a6 6 0 01-7-7 6 6 0 107 7z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
