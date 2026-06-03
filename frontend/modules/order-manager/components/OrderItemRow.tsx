'use client';

import { OrderItemCreate } from '../models';
import { TextInput } from './TextInput';
import { useTranslations } from '../hooks/useTranslations';

// ─── Строка позиции заказа: product_id + quantity + удалить ─────────────────

interface Props {
  item:      OrderItemCreate;
  index:     number;
  onUpdate:  (i: number, d: Partial<OrderItemCreate>) => void;
  onRemove:  (i: number) => void;
  canRemove: boolean;
}

export function OrderItemRow({ item, index, onUpdate, onRemove, canRemove }: Props) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/50">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--color-muted-foreground)]">
          {t.fields.product_id} <span className="text-red-500">*</span>
        </span>
        <TextInput
          type="number" min={1}
          placeholder={t.placeholders.product_id}
          value={item.product_id || ''}
          onChange={(e) => onUpdate(index, { product_id: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--color-muted-foreground)]">
          {t.fields.quantity} <span className="text-red-500">*</span>
        </span>
        <TextInput
          type="number" min={1}
          placeholder={t.placeholders.quantity}
          value={item.quantity || ''}
          onChange={(e) => onUpdate(index, { quantity: Number(e.target.value) })}
        />
      </div>

      {/* Кнопка удаления строки */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        title="Remove"
        className="ghost small w-9 h-9 rounded border border-[var(--color-border)]
          hover:border-red-400 hover:!text-red-500
          disabled:opacity-20 disabled:pointer-events-none"
      >
        {/* SVG крестик */}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
