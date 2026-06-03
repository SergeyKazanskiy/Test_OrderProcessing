'use client';

import { MethodBadge } from '../components/MethodBadge';
import { EndpointPath } from '../components/EndpointPath';
import { useSettingsStore } from '../stores/settings.store';

// ─── Заголовок панели: метод + название + описание + путь эндпоинта ──────────

interface Props {
  method:      'POST' | 'GET' | 'INFO';
  title:       string;
  description: string;
  endpoint:    string;
}

export function PanelHeaderView({ method, title, description, endpoint }: Props) {
  const { baseUrl } = useSettingsStore();
  // Оставляем только путь /api/v1 без хоста
  const apiBase = baseUrl.replace(/^https?:\/\/[^/]+/, '');

  return (
    <div className="flex items-start gap-3 pb-5 border-b border-[var(--color-border)]">
      <MethodBadge method={method} size="md" />
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-[var(--color-foreground)] leading-tight">{title}</h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{description}</p>
        {endpoint && <EndpointPath base={apiBase} endpoint={endpoint} />}
      </div>
    </div>
  );
}
