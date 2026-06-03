import { create } from 'zustand';

// ─── Глобальный стор состояния HTTP-запроса ──────────────────────────────────
// Используется внутри httpRequest: управляет isLoading / errorMessage

interface ApiStore {
  isLoading:    boolean;
  errorMessage: string | null;

  startRequest: () => void;
  setSuccess:   () => void;
  setError:     (msg: string) => void;
  reset:        () => void;
}

export const useApiStore = create<ApiStore>((set) => ({
  isLoading:    false,
  errorMessage: null,

  startRequest: () => set({ isLoading: true, errorMessage: null }),
  setSuccess:   () => set({ isLoading: false, errorMessage: null }),
  setError: (msg) => set({ isLoading: false, errorMessage: msg }),
  reset:         () => set({ isLoading: false, errorMessage: null }),
}));
