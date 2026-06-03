'use client';

import { useState } from 'react';
import { useOrderStore } from '../stores/order.store';
import { useApiStore } from '../stores/api.store';
import { useTranslations } from '../hooks/useTranslations';
import { getOrdersByCustomer } from '../api/order.api';
import { Field } from '../components/Field';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { SectionCard } from '../components/SectionCard';
import { ValidationAlert } from '../alerts/ValidationAlert';
import { PanelHeaderView } from './PanelHeaderView';

// ─── Панель «Заказы по клиенту» ──────────────────────────────────────────────

export function OrdersByCustomerView() {
  const t = useTranslations();
  const { getByCustomerId, setGetByCustomerId } = useOrderStore();
  const { isLoading } = useApiStore();
  const [error, setError] = useState<string | null>(null);
  const p = t.panels['orders-by-customer'];

  const handleSubmit = async () => {
    setError(null);
    if (!getByCustomerId) { setError(t.errors.customer_id_required); return; }
    await getOrdersByCustomer(Number(getByCustomerId));
  };

  return (
    <div className="flex flex-col gap-5">
      <PanelHeaderView method="GET" title={p.title} description={p.description} endpoint={p.endpoint} />
      <SectionCard title="Path Parameters" icon={<InfoIcon />}>
        <Field label={t.fields.customer_id} required>
          <TextInput type="number" min={1} placeholder={t.placeholders.customer_id}
            value={getByCustomerId}
            onChange={(e) => setGetByCustomerId(e.target.value)} />
        </Field>
      </SectionCard>
      <ValidationAlert message={error} />
      <Button onClick={handleSubmit} loading={isLoading}>{t.actions.send}</Button>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 5v4M6 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
