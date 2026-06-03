'use client';

import { useState } from 'react';
import { useProductStore } from '../stores/product.store';
import { useApiStore } from '../stores/api.store';
import { useTranslations } from '../hooks/useTranslations';
import { getProductById } from '../api/product.api';
import { Field } from '../components/Field';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { SectionCard } from '../components/SectionCard';
import { ValidationAlert } from '../alerts/ValidationAlert';
import { PanelHeaderView } from './PanelHeaderView';

// ─── Панель «Получить товар по ID» ───────────────────────────────────────────

export function GetProductView() {
  const t = useTranslations();
  const { getById, setGetById } = useProductStore();
  const { isLoading } = useApiStore();
  const [error, setError] = useState<string | null>(null);
  const p = t.panels['get-product'];

  const handleSubmit = async () => {
    setError(null);
    if (!getById) { setError(t.errors.customer_id_required); return; }
    await getProductById(Number(getById));
  };

  return (
    <div className="flex flex-col gap-5">
      <PanelHeaderView method="GET" title={p.title} description={p.description} endpoint={p.endpoint} />
      <SectionCard title="Path Parameters" icon={<InfoIcon />}>
        <Field label={t.fields.id} required>
          <TextInput type="number" min={1} placeholder={t.placeholders.id}
            value={getById}
            onChange={(e) => setGetById(e.target.value)} />
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
