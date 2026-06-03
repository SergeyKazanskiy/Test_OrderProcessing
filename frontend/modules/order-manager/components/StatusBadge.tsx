'use client';

// ─── Индикатор HTTP-статуса с цветовой точкой ────────────────────────────────

function getStyle(status: number | null) {
  if (!status)              return { dot: 'bg-[var(--color-muted-foreground)]/40', text: 'text-[var(--color-muted-foreground)]', label: '—' };
  if (status >= 200 && status < 300) return { dot: 'bg-emerald-400 shadow-[0_0_5px_theme(colors.emerald.400)]', text: 'text-emerald-500', label: String(status) };
  if (status >= 400 && status < 500) return { dot: 'bg-red-400 shadow-[0_0_5px_theme(colors.red.400)]',     text: 'text-red-500',     label: String(status) };
  return { dot: 'bg-yellow-400', text: 'text-yellow-500', label: String(status) };
}

export function StatusBadge({ status }: { status: number | null }) {
  const s = getStyle(status);
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
      <span className={`font-mono text-sm font-bold ${s.text}`}>{s.label}</span>
    </div>
  );
}
