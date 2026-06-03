'use client';

// ─── Кнопка — использует классы из semantics.scss (primary / secondary / outline)

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'middle' | 'large';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'middle',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      // Классы variant / size берутся из semantics.scss (button.primary, button.middle и т.д.)
      className={`${variant} ${size} ${className}`}
    >
      {loading && (
        // SVG спиннер
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
