import { create } from 'zustand';
import { TabId } from '../models';

// ─── Стор активной вкладки навигации ────────────────────────────────────────

interface NavigationStore {
  activeTab: TabId;
  setTab: (tab: TabId) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeTab: 'create-customer',
  setTab: (tab) => set({ activeTab: tab }),
}));
