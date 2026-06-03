import { create } from 'zustand';
import { HistoryEntry } from '../models';

// ─── Стор ответа сервера и истории запросов ──────────────────────────────────

interface ResponseStore {
  status:  number | null;
  data:    unknown | null;
  elapsed: number | null;
  history: HistoryEntry[];

  setResponse:     (status: number, data: unknown, elapsed: number) => void;
  addHistory:      (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory:    () => void;
  loadFromHistory: (entry: HistoryEntry) => void;
}

export const useResponseStore = create<ResponseStore>((set) => ({
  status:  null,
  data:    null,
  elapsed: null,
  history: [],

  setResponse: (status, data, elapsed) =>
    set({ status, data, elapsed }),

  addHistory: (entry) =>
    set((s) => ({
      history: [
        { ...entry, id: crypto.randomUUID(), timestamp: new Date() },
        ...s.history.slice(0, 49), // не более 50 записей
      ],
    })),

  clearHistory: () => set({ history: [] }),

  loadFromHistory: (entry) =>
    set({ status: entry.status, data: entry.data, elapsed: entry.elapsed }),
}));
