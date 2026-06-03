'use client';

// ─── Алерт ошибки валидации формы ────────────────────────────────────────────

export function ValidationAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg
      bg-red-50 dark:bg-red-900/20
      border border-red-200 dark:border-red-800
      text-red-600 dark:text-red-400 text-sm">
      {/* SVG: восклицательный знак в кружке */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 4v3.5M7 9.2v.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {message}
    </div>
  );
}
