'use client';

// ─── Стилизованный input, следует %input-base из semantics.scss ──────────────

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export function TextInput({ className = '', ...props }: Props) {
  return (
    <input
      {...props}
      className={`
        w-full bg-transparent
        border border-[var(--color-input)] rounded
        px-3 py-2 text-sm text-[var(--color-foreground)] font-mono
        placeholder:text-[var(--color-muted-foreground)]/50
        focus:outline-none focus:border-[var(--color-primary)]
        focus:ring-1 focus:ring-[var(--color-primary)]/20
        disabled:opacity-60 disabled:cursor-not-allowed
        transition-all duration-150
        ${className}
      `}
    />
  );
}
