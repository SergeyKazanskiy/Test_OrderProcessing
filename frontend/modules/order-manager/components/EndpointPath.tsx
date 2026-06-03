'use client';

// ─── Отображение URL с подсветкой path-параметров: /orders/{id} ─────────────

interface Props {
  base:     string;
  endpoint: string;
}

export function EndpointPath({ base, endpoint }: Props) {
  // Разбиваем endpoint по {param}: /orders/{id} → ['', 'orders/', '{id}']
  const parts = endpoint.split(/(\{[^}]+\})/);
  return (
    <div className="inline-flex flex-wrap items-center font-mono text-xs
      bg-[var(--color-muted)] border border-[var(--color-border)]
      rounded px-3 py-1.5 mt-2 gap-0">
      <span className="text-[var(--color-muted-foreground)]">{base}</span>
      {parts.map((part, i) =>
        part.startsWith('{') ? (
          <span key={i} className="text-amber-500 dark:text-amber-400">{part}</span>
        ) : (
          <span key={i} className="text-[var(--color-primary)]">{part}</span>
        )
      )}
    </div>
  );
}
