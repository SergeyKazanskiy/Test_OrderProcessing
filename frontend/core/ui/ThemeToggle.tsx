'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';

const LIGHT_THEMES = {
  ocean: { name: '🌊 Ocean', hue: 220, lightness: 0.55, chroma: 0.15 },
  sunset: { name: '🌇 Sunset', hue: 20, lightness: 0.60, chroma: 0.18 },
  forest: { name: '🌲 Forest', hue: 145, lightness: 0.50, chroma: 0.12 },
  berry: { name: '🍒 Berry', hue: 340, lightness: 0.55, chroma: 0.16 },
  lavender: { name: '🪻 Lavender', hue: 270, lightness: 0.58, chroma: 0.14 }
};

type ThemeKey = keyof typeof LIGHT_THEMES;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSubTheme, setCurrentSubTheme] = useState<ThemeKey>('ocean');
  const popupRef = useRef<HTMLDivElement>(null);

  // 1. Применяем переменные только на клиенте
  const applyLightVariables = (key: ThemeKey) => {
    if (typeof window === 'undefined') return;
    const { hue, lightness, chroma } = LIGHT_THEMES[key];
    const root = document.documentElement;
    root.style.setProperty('--theme-hue', `${hue}`);
    root.style.setProperty('--theme-lightness', `${lightness}`);
    root.style.setProperty('--theme-chroma', `${chroma}`);
  };

  useEffect(() => {
    setMounted(true);
    const savedSubTheme = localStorage.getItem('light-sub-theme') as ThemeKey;
    if (savedSubTheme && LIGHT_THEMES[savedSubTheme]) {
      setCurrentSubTheme(savedSubTheme);
      applyLightVariables(savedSubTheme);
    }
  }, []);

  // Закрытие попапа при клике вне его области
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = () => {
    if (theme === 'dark') {
      setTheme('light');
      setShowPopup(true);
      applyLightVariables(currentSubTheme);
    } else {
      setTheme('dark');
      setShowPopup(false);
    }
  };

  const selectSubTheme = (key: ThemeKey) => {
    setCurrentSubTheme(key);
    applyLightVariables(key);
    localStorage.setItem('light-sub-theme', key);
    setShowPopup(false);
  };

  // ВАЖНО: До монтирования рендерим пустую заглушку-кнопку того же размера,
  // чтобы серверный HTML был стабильным и не содержал динамических данных
  if (!mounted) {
    return (
      <button className="p-2 rounded-md border border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed">
        ⏳ Загрузка...
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleThemeChange}
        className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-500 dark:bg-gray-800 transition-all"
      >
        {theme === 'dark' ? '🌙' : `☀️`}
      </button>

      {/* Изменено позиционирование: заменено `right-0` на `left-0` */}
      {showPopup && theme === 'light' && (
        <div 
          ref={popupRef}
          className="absolute right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-56 transform translate-x-0"
        >
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Выберите световую тему:</h4>
          <div className="flex flex-col gap-1">
            {(Object.keys(LIGHT_THEMES) as ThemeKey[]).map((key) => (
              <button
                key={key}
                onClick={() => selectSubTheme(key)}
                className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentSubTheme === key 
                    ? 'bg-gray-200 font-medium text-black' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {LIGHT_THEMES[key].name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
