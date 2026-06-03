'use client';

// ─── Секция с заголовком (иконка + title) и телом формы ─────────────────────

interface Props {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, icon, children }: Props) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Шапка секции */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]">
        {icon && <span className="text-[var(--color-muted-foreground)] opacity-70">{icon}</span>}
        <span className="text-[11px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">
          {title}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}
