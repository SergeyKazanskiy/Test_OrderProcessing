import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/*
* Состояние для управления темой приложения.
* Позволяет изменять цветовую палитру и сохранять настройки в localStorage.
*/

export const PRESETS = {
  ocean: { name: 'Ocean', hue: 220, lightness: 0.55, chroma: 0.15 },
  sunset: { name: 'Sunset', hue: 20, lightness: 0.60, chroma: 0.18 },
  forest: { name: 'Forest', hue: 145, lightness: 0.50, chroma: 0.12 },
  berry: { name: 'Berry', hue: 340, lightness: 0.55, chroma: 0.16 },
  lavender: { name: 'Lavender', hue: 270, lightness: 0.58, chroma: 0.14 }
} as const;

type PresetKey = keyof typeof PRESETS;


interface ThemeState {
  hue: number;          // 0-360
  lightness: number;    // 0.3 - 0.9
  chroma: number;       // 0 - 0.37

  setHue: (val: number) => void;
  setLightness: (val: number) => void;
  setChroma: (val: number) => void;
  applyPreset: (key: PresetKey) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      hue: 250,
      lightness: 0.6,
      chroma: 0.18,

      setHue: (hue) => set({ hue }),
      setLightness: (lightness) => set({ lightness }),
      setChroma: (chroma) => set({ chroma }),
      applyPreset: (key) => set(PRESETS[key]),
    }),
    { name: 'app-theme-hue' }
  )
);
