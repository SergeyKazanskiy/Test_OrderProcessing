'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useResponseStore } from '../stores/response.store';
import { useTranslations } from '../hooks/useTranslations';
import { StatusBadge } from '../components/StatusBadge';
import { JsonViewer } from '../components/JsonViewer';
import { MethodBadge } from '../components/MethodBadge';
import { HistoryEntry } from '../models';

// ─── Правая панель: ответ сервера + история запросов ─────────────────────────

export function ResponsePanelView() {
  const t = useTranslations();
  const { status, data, elapsed, history, clearHistory, loadFromHistory } = useResponseStore();
  const [tab, setTab] = useState<'body' | 'history'>('body');

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success(t.response.copied);
  };

  return (
    <div className="flex flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] w-[400px] shrink-0 overflow-hidden">

      {/* ── Шапка ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-muted)] shrink-0">
        <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)]">
          {t.response.title}
        </span>
        <div className="flex items-center gap-3">
          {elapsed !== null && (
            <span className="text-[10px] text-[var(--color-muted-foreground)] font-mono">{elapsed}ms</span>
          )}
          <StatusBadge status={status} />
          <button onClick={handleCopy} disabled={!data} className="secondary tiny rounded font-mono">
            {t.actions.copy}
          </button>
        </div>
      </div>

      {/* ── Вкладки Body / History ── */}
      <div className="flex border-b border-[var(--color-border)] shrink-0">
        {(['body', 'history'] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={`ghost px-4 py-2.5 text-[11px] uppercase tracking-wide font-bold rounded-none border-b-2 flex items-center gap-1.5 ${
              tab === t_
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] !opacity-100'
                : 'border-transparent'
            }`}
          >
            {t_ === 'body' ? t.response.body : t.response.history}
            {t_ === 'history' && history.length > 0 && (
              <span className="text-[9px] text-[var(--color-muted-foreground)]">({history.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Тело ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'body' ? (
          data
            ? <JsonViewer data={data} />
            : <EmptyState message={t.response.empty} icon="doc" />
        ) : (
          <HistoryTab
            history={history}
            emptyLabel={t.response.no_history}
            clearLabel={t.actions.clear_history}
            onClear={clearHistory}
            onSelect={(entry) => { loadFromHistory(entry); setTab('body'); }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Пустое состояние ────────────────────────────────────────────────────────

function EmptyState({ message, icon }: { message: string; icon: 'doc' | 'clock' }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-3 text-[var(--color-muted-foreground)] opacity-50">
      {icon === 'doc' ? (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect x="6" y="6" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 18h12M12 13h8M12 23h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M18 12v7l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Список истории ───────────────────────────────────────────────────────────

function HistoryTab({
  history, emptyLabel, clearLabel, onClear, onSelect,
}: {
  history:    HistoryEntry[];
  emptyLabel: string;
  clearLabel: string;
  onClear:    () => void;
  onSelect:   (e: HistoryEntry) => void;
}) {
  if (!history.length) return <EmptyState message={emptyLabel} icon="clock" />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button onClick={onClear} className="ghost tiny text-[var(--color-muted-foreground)]">
          {clearLabel}
        </button>
      </div>
      {history.map((entry) => {
        const ok = entry.status >= 200 && entry.status < 300;
        return (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="secondary small w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg"
          >
            <MethodBadge method={entry.method} />
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate text-[var(--color-foreground)] font-mono">{entry.path}</p>
              <p className="text-[10px] text-[var(--color-muted-foreground)]">
                {entry.timestamp.toLocaleTimeString()} · {entry.elapsed}ms
              </p>
            </div>
            <span className={`text-xs font-bold font-mono shrink-0 ${ok ? 'text-emerald-500' : 'text-red-500'}`}>
              {entry.status}
            </span>
          </button>
        );
      })}
    </div>
  );
}
