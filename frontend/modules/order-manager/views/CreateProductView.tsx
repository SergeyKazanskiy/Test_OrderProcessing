'use client';

import { useState } from 'react';
import { useProductStore } from '../stores/product.store';
import { useApiStore } from '../stores/api.store';
import { useTranslations } from '../hooks/useTranslations';
import { createProduct } from '../api/product.api';
import { Field } from '../components/Field';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { SectionCard } from '../components/SectionCard';
import { ValidationAlert } from '../alerts/ValidationAlert';
import { PanelHeaderView } from './PanelHeaderView';

// ─── Панель «Создать товар» ───────────────────────────────────────────────────

export function CreateProductView() {
  const t = useTranslations();
  const { createForm, setCreateForm } = useProductStore();
  const { isLoading } = useApiStore();
  const [error, setError] = useState<string | null>(null);
  const p = t.panels['create-product'];

  const handleSubmit = async () => {
    setError(null);
    if (!createForm.name.trim()) { setError(t.errors.name_required);  return; }
    if (!createForm.sku.trim())  { setError(t.errors.sku_required);   return; }
    if (!createForm.price)       { setError(t.errors.price_required); return; }

    await createProduct({
      name:  createForm.name.trim(),
      sku:   createForm.sku.trim(),
      price: createForm.price,
      ...(createForm.description?.trim() ? { description: createForm.description.trim() } : {}),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PanelHeaderView method="POST" title={p.title} description={p.description} endpoint={p.endpoint} />
      <SectionCard title="Request Body" icon={<PlusIcon />}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.fields.name} required>
            <TextInput placeholder={t.placeholders.name}
              value={createForm.name}
              onChange={(e) => setCreateForm({ name: e.target.value })} />
          </Field>
          <Field label={t.fields.sku} required hint={t.hints.sku}>
            <TextInput placeholder={t.placeholders.sku}
              value={createForm.sku}
              onChange={(e) => setCreateForm({ sku: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.fields.price} required hint={t.hints.price}>
            <TextInput placeholder={t.placeholders.price}
              value={createForm.price}
              onChange={(e) => setCreateForm({ price: e.target.value })} />
          </Field>
          <Field label={t.fields.description} hint={t.hints.description}>
            <TextInput placeholder={t.placeholders.description}
              value={createForm.description ?? ''}
              onChange={(e) => setCreateForm({ description: e.target.value })} />
          </Field>
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
