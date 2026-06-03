'use client';

import { useNavigationStore } from '../stores/navigation.store';
import { useTranslations } from '../hooks/useTranslations';
import { MethodBadge } from '../components/MethodBadge';
import { TabId } from '../models';

// ─── Левая навигационная панель ──────────────────────────────────────────────

type Method = 'POST' | 'GET' | 'INFO';

interface NavTab {
  id:     TabId;
  method: Method;
  group:  'customers' | 'products' | 'orders' | 'rules';
}

const TABS: NavTab[] = [
  { id: 'create-customer',    method: 'POST', group: 'customers' },
  { id: 'get-customer',       method: 'GET',  group: 'customers' },
  { id: 'create-product',     method: 'POST', group: 'products'  },
  { id: 'get-product',        method: 'GET',  group: 'products'  },
  { id: 'create-order',       method: 'POST', group: 'orders'    },
  { id: 'get-order',          method: 'GET',  group: 'orders'    },
  { id: 'orders-by-customer', method: 'GET',  group: 'orders'    },
  { id: 'business-rules',     method: 'INFO', group: 'rules'     },
];

const GROUPS: Array<{ key: NavTab['group']; icon: React.ReactNode }> = [
  { key: 'customers', icon: <UserIcon /> },
  { key: 'products',  icon: <BoxIcon />  },
  { key: 'orders',    icon: <ListIcon /> },
  { key: 'rules',     icon: <ShieldIcon /> },
];

export function SidebarView() {
  const t = useTranslations();
  const { activeTab, setTab } = useNavigationStore();

  return (
    <aside className="w-[215px] border-r border-[var(--color-border)] bg-[var(--color-surface)] overflow-y-auto py-3 shrink-0">
      {GROUPS.map(({ key, icon }) => (
        <div key={key} className="mb-1">
          {/* Заголовок группы */}
          <div className="flex items-center gap-1.5 px-4 py-1.5
            text-[10px] uppercase tracking-widest font-bold
            text-[var(--color-muted-foreground)] opacity-60">
            {icon}
            {t.nav.groups[key]}
          </div>

          {/* Пункты группы */}
          {TABS.filter((tab) => tab.group === key).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`
                ghost w-full text-left flex items-center gap-2 px-4 py-2 text-sm
                border-l-2 rounded-none transition-all duration-150
                ${activeTab === tab.id
                  ? 'active !border-[var(--color-primary)] !bg-[var(--color-accent)] !text-[var(--color-primary)] !opacity-100'
                  : 'border-transparent'}
              `}
            >
              <MethodBadge method={tab.method} />
              <span className="truncate">
                {t.nav.tabs[tab.id as keyof typeof t.nav.tabs]}
              </span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ─── SVG-иконки групп ────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <circle cx="5.5" cy="3.5" r="2.2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 10c0-2.485 2.015-4.5 4.5-4.5S10 7.515 10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <rect x="1" y="1" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3.5 5.5h4M5.5 3.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <rect x="1" y="1" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3 4h5M3 5.5h5M3 7h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1L2 2.5v3C2 8 3.8 9.5 5.5 10 7.2 9.5 9 8 9 5.5v-3L5.5 1z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M3.5 5.5l1.5 1.5L7.5 4" stroke="currentColor" strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
