'use client';

// ─── Бейдж HTTP-метода: POST / GET / INFO ────────────────────────────────────

type Method = 'POST' | 'GET' | 'INFO';

interface Props {
  method: Method;
  size?: 'sm' | 'md';
}

const STYLES: Record<Method, string> = {
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  GET:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  INFO: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

export function MethodBadge({ method, size = 'sm' }: Props) {
  const pad = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-xs';

  return (
    <span className={`${STYLES[method]} ${pad} font-bold rounded font-mono tracking-wide shrink-0 leading-none`}>
      {method}
    </span>
  );
}
