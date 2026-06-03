'use client';

// ─── Обёртка поля ввода: label + hint + children ─────────────────────────────

interface Props {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, hint, required, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1.5 flex-wrap">
        {label}
        {required && <span className="text-red-500 text-[10px] leading-none">*</span>}
        {hint && (
          <span className="text-[var(--color-muted-foreground)] font-normal opacity-70">
            · {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
