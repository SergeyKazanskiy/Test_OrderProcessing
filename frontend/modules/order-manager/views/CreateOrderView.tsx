'use client';

import { useState } from 'react';
import { useOrderStore } from '../stores/order.store';
import { useApiStore } from '../stores/api.store';
import { useTranslations } from '../hooks/useTranslations';
import { createOrder } from '../api/order.api';
import { Field } from '../components/Field';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { SectionCard } from '../components/SectionCard';
import { OrderItemRow } from '../components/OrderItemRow';
import { ValidationAlert } from '../alerts/ValidationAlert';
import { PanelHeaderView } from './PanelHeaderView';

// ─── Панель «Создать заказ» ───────────────────────────────────────────────────

export function CreateOrderView() {
  const t = useTranslations();
  const { customerId, notes, items, setCustomerId, setNotes, addItem, updateItem, removeItem } = useOrderStore();
  const { isLoading } = useApiStore();
  const [error, setError] = useState<string | null>(null);
  const p = t.panels['create-order'];

  const handleSubmit = async () => {
    setError(null);
    if (!customerId)   { setError(t.errors.customer_id_required); return; }
    if (!items.length) { setError(t.errors.items_required);       return; }

    // Все позиции должны иметь корректные product_id и quantity
    const allValid = items.every((i) => i.product_id > 0 && i.quantity > 0);
    if (!allValid) { setError(t.errors.item_fields_required); return; }

    await createOrder({
      customer_id: Number(customerId),
      items,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PanelHeaderView method="POST" title={p.title} description={p.description} endpoint={p.endpoint} />

      <SectionCard title="Request Body" icon={<PlusIcon />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.fields.customer_id} required>
            <TextInput type="number" min={1} placeholder={t.placeholders.customer_id}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)} />
          </Field>
          <Field label={t.fields.notes} hint={t.hints.notes}>
            <TextInput placeholder={t.placeholders.notes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>

        {/* Позиции заказа */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-primary)]">
              Items <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] text-[var(--color-muted-foreground)] opacity-70 max-w-[240px] text-right leading-tight">
              {t.hints.items}
            </span>
          </div>

          {items.map((item, i) => (
            <OrderItemRow
              key={i}
              item={item}
              index={i}
              onUpdate={updateItem}
              onRemove={removeItem}
              canRemove={items.length > 1}
            />
          ))}

          {/* Кнопка добавить позицию */}
          <button
            type="button"
            onClick={addItem}
            className="outline small w-full justify-center !border-dashed"
          >
            {t.actions.add_item}
          </button>
        </div>
      </SectionCard>

      <ValidationAlert message={error} />
      <Button onClick={handleSubmit} loading={isLoading}>{t.actions.send}</Button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
