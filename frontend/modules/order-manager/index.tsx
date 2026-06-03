'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';

// ─── Сторы ───────────────────────────────────────────────────────────────────
import { useNavigationStore } from './stores/navigation.store';
import { useSettingsStore } from './stores/settings.store';

// ─── Views ───────────────────────────────────────────────────────────────────
import { TopbarView } from './views/TopbarView';
import { SidebarView } from './views/SidebarView';
import { ResponsePanelView } from './views/ResponsePanelView';
import { CreateCustomerView } from './views/CreateCustomerView';
import { GetCustomerView } from './views/GetCustomerView';
import { CreateProductView } from './views/CreateProductView';
import { GetProductView } from './views/GetProductView';
import { CreateOrderView } from './views/CreateOrderView';
import { GetOrderView } from './views/GetOrderView';
import { OrdersByCustomerView } from './views/OrdersByCustomerView';
import { BusinessRulesView } from './views/BusinessRulesView';

// ─── Стили ───────────────────────────────────────────────────────────────────
//import './styles.scss';

// ─── Маппинг вкладок → компоненты ────────────────────────────────────────────
const PANELS: Record<string, React.ReactNode> = {
  'create-customer': <CreateCustomerView />,
  'get-customer': <GetCustomerView />,
  'create-product': <CreateProductView />,
  'get-product': <GetProductView />,
  'create-order': <CreateOrderView />,
  'get-order': <GetOrderView />,
  'orders-by-customer': <OrdersByCustomerView />,
  'business-rules': <BusinessRulesView />,
};

// ─── Корневой компонент Order Tester ─────────────────────────────────────────

export default function OrderTester() {
  const { activeTab } = useNavigationStore();
  const { dark } = useSettingsStore();

  // Переключение тёмной темы через класс .dark на <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    // Корневой контейнер занимает весь экран
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-background)]">

      {/* ── Топбар ── */}
      <TopbarView />

      {/* ── Трёхколоночный лейаут ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Левая колонка: навигация */}
        <SidebarView />

        {/* Центр: активная форма */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--color-background)]">
          <div key={activeTab} className="panel-enter max-w-2xl">
            {PANELS[activeTab]}
          </div>
        </main>

        {/* Правая колонка: ответ сервера */}
        <ResponsePanelView />
      </div>

      {/* Глобальный toast-провайдер (Sonner) */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize:   '13px',
            background: 'var(--color-surface)',
            color:      'var(--color-foreground)',
            border:     '1px solid var(--color-border)',
          },
        }}
      />
    </div>
  );
}
