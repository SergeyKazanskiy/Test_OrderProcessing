'use client';

import { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { useResponseStore } from '../stores/response.store';
import { api } from '../hooks/useRequest';
import { RuleResultAlert } from '../alerts/RuleResultAlert';
import { PanelHeaderView } from './PanelHeaderView';
import { TextInput } from '../components/TextInput';
import { RuleResult } from '../models';

// ─── Панель проверки бизнес-правил ───────────────────────────────────────────
// Каждый тест отправляет намеренно некорректный запрос.
// Если сервер вернул 4xx — правило работает (pass).
// Если 2xx — правило нарушено (fail).

export function BusinessRulesView() {
  const t = useTranslations();
  const p = t.panels['business-rules'];

  return (
    <div className="flex flex-col gap-6">
      <PanelHeaderView method="INFO" title={p.title} description={p.description} endpoint="" />

      {/* Описание методики */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl
        bg-amber-500 dark:bg-amber-900/20
        border border-amber-200 dark:border-amber-800
        text-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <div>
          <p className="font-semibold mb-0.5">{t.rules.title}</p>
          <p className="opacity-80">{t.rules.subtitle}</p>
        </div>
      </div>

      {/* ── Правила клиента ── */}
      <RuleGroup title={t.rules.customer.title} icon={<UserIcon />}>
        <RuleCard
          label={t.rules.customer.r1.label}
          description={t.rules.customer.r1.description}
          hint={t.rules.customer.r1.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          inputPlaceholder="existing@example.com"
          inputLabel="email"
          onRun={async (value) => {
            // Дубликат email — должен вернуть 422
            const res = await safePost('/customers', { name: 'Test', email: value });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
        <RuleCard
          label={t.rules.customer.r2.label}
          description={t.rules.customer.r2.description}
          hint={t.rules.customer.r2.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          inputPlaceholder="not-an-email"
          inputLabel="email"
          onRun={async (value) => {
            // Невалидный email — должен вернуть 422
            const res = await safePost('/customers', { name: 'Test', email: value });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
      </RuleGroup>

      {/* ── Правила товара ── */}
      <RuleGroup title={t.rules.product.title} icon={<BoxIcon />}>
        <RuleCard
          label={t.rules.product.r1.label}
          description={t.rules.product.r1.description}
          hint={t.rules.product.r1.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          inputPlaceholder="EXISTING-SKU"
          inputLabel="SKU"
          onRun={async (value) => {
            // Дублирующий SKU — должен вернуть 422
            const res = await safePost('/products', { name: 'Test', sku: value, price: '1.00' });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
        <RuleCard
          label={t.rules.product.r2.label}
          description={t.rules.product.r2.description}
          hint={t.rules.product.r2.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          defaultValue="0"
          inputLabel="price"
          onRun={async (value) => {
            // Нулевая цена — должна вернуть 422
            const res = await safePost('/products', { name: 'Test', sku: `TEST-${Date.now()}`, price: value });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
      </RuleGroup>

      {/* ── Правила заказа ── */}
      <RuleGroup title={t.rules.order.title} icon={<ListIcon />}>
        <RuleCard
          label={t.rules.order.r1.label}
          description={t.rules.order.r1.description}
          hint={t.rules.order.r1.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          defaultValue="99999"
          inputLabel="customer_id"
          onRun={async (value) => {
            // Несуществующий клиент — должен вернуть 422
            const res = await safePost('/orders', {
              customer_id: Number(value),
              items: [{ product_id: 1, quantity: 1 }],
            });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
        <RuleCard
          label={t.rules.order.r2.label}
          description={t.rules.order.r2.description}
          hint={t.rules.order.r2.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          defaultValue="1"
          inputLabel="customer_id"
          onRun={async (value) => {
            // Пустой список items — должен вернуть 422
            const res = await safePost('/orders', {
              customer_id: Number(value),
              items: [],
            });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
        <RuleCard
          label={t.rules.order.r3.label}
          description={t.rules.order.r3.description}
          hint={t.rules.order.r3.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          defaultValue="99999"
          inputLabel="product_id"
          onRun={async (value) => {
            // Несуществующий product_id — должен вернуть 422
            const res = await safePost('/orders', {
              customer_id: 1,
              items: [{ product_id: Number(value), quantity: 1 }],
            });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
        <RuleCard
          label={t.rules.order.r4.label}
          description={t.rules.order.r4.description}
          hint={t.rules.order.r4.hint}
          expectedBadge={t.rules.expected}
          runLabel={t.rules.run}
          passLabel={t.rules.pass}
          failLabel={t.rules.fail}
          defaultValue="0"
          inputLabel="quantity"
          onRun={async (value) => {
            // Нулевое quantity — должно вернуть 422
            const res = await safePost('/orders', {
              customer_id: 1,
              items: [{ product_id: 1, quantity: Number(value) }],
            });
            return res.status >= 400 ? 'pass' : 'fail';
          }}
        />
      </RuleGroup>
    </div>
  );
}

// ─── Безопасный POST: перехватывает ошибки axios и возвращает { status } ─────

async function safePost(path: string, data: unknown): Promise<{ status: number }> {
  const { setResponse, addHistory } = useResponseStore.getState();
  const t0 = performance.now();
  try {
    const res = await api.post(path, data);
    const elapsed = Math.round(performance.now() - t0);
    setResponse(res.status, res.data, elapsed);
    addHistory({ method: 'POST', path, status: res.status, elapsed, data: res.data });
    return { status: res.status };
  } catch (err: unknown) {
    const elapsed = Math.round(performance.now() - t0);
    const e = err as { response?: { status?: number; data?: unknown } };
    const status = e.response?.status ?? 0;
    setResponse(status, e.response?.data, elapsed);
    addHistory({ method: 'POST', path, status, elapsed, data: e.response?.data });
    return { status };
  }
}

// ─── Группа правил ────────────────────────────────────────────────────────────

function RuleGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Заголовок группы */}
      <div className="flex items-center gap-2 px-4 py-3
        border-b border-[var(--color-border)] bg-[var(--color-muted)]">
        <span className="text-[var(--color-muted-foreground)] opacity-70">{icon}</span>
        <span className="text-[11px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)]">
          {title}
        </span>
      </div>
      <div className="divide-y divide-[var(--color-border)]">{children}</div>
    </div>
  );
}

// ─── Карточка одного правила ──────────────────────────────────────────────────

interface RuleCardProps {
  label: string;
  description: string;
  hint: string;
  expectedBadge: string;
  runLabel: string;
  passLabel: string;
  failLabel: string;
  inputLabel: string;
  inputPlaceholder?: string;
  defaultValue?: string;
  onRun: (value: string) => Promise<RuleResult>;
}

function RuleCard({
  label, description, hint, expectedBadge, runLabel, passLabel, failLabel,
  inputLabel, inputPlaceholder, defaultValue = '', onRun,
}: RuleCardProps) {
  const [value,   setValue]   = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<RuleResult>('idle');

  const handleRun = async () => {
    setLoading(true);
    setResult('idle');
    const r = await onRun(value);
    setResult(r);
    setLoading(false);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Шапка карточки */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{label}</p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{description}</p>
        </div>
        <span className="text-[10px] font-mono font-bold shrink-0
          bg-amber-100 dark:bg-amber-900/30
          px-2 py-0.5 rounded">
          {expectedBadge}
        </span>
      </div>

      {/* Поле ввода + кнопка */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[11px] text-[var(--color-muted-foreground)]">
            {inputLabel}
            <span className="ml-1.5 opacity-60">— {hint}</span>
          </span>
          <TextInput
            placeholder={inputPlaceholder ?? defaultValue}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="primary middle shrink-0 flex items-center gap-1.5"
        >
          {loading && (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
          {runLabel}
        </button>
      </div>

      {/* Результат теста */}
      <RuleResultAlert result={result} passLabel={passLabel} failLabel={failLabel} />
    </div>
  );
}

// ─── SVG-иконки ──────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="3.5" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 10c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3 4.5h6M3 6h6M3 7.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
