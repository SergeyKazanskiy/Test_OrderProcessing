'use client';

import { RuleResult } from '../models';

// ─── Алерт результата теста бизнес-правила ───────────────────────────────────
// pass  = правило сработало (сервер вернул 422 — ожидаемо)
// fail  = правило не сработало (сервер принял запрос — нарушение)
// idle  = ещё не запускали

interface Props {
  result:    RuleResult;
  passLabel: string;
  failLabel: string;
}

export function RuleResultAlert({ result, passLabel, failLabel }: Props) {
  if (result === 'idle') return null;

  const ok = result === 'pass';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
      ok
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
    }`}>
      {ok ? (
        // SVG: галочка
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        // SVG: крестик
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
      {ok ? passLabel : failLabel}
    </div>
  );
}
