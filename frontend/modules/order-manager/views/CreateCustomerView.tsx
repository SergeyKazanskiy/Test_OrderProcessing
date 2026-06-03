'use client';

import { useState } from 'react';
import { useCustomerStore } from '../stores/customer.store';
import { useApiStore } from '../stores/api.store';
import { useTranslations } from '../hooks/useTranslations';
import { createCustomer } from '../api/customer.api';
import { Field } from '../components/Field';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { SectionCard } from '../components/SectionCard';
import { ValidationAlert } from '../alerts/ValidationAlert';
import { PanelHeaderView } from './PanelHeaderView';

// ─── Панель «Создать клиента» ────────────────────────────────────────────────

export function CreateCustomerView() {
  const t = useTranslations();
  const { createForm, setCreateForm } = useCustomerStore();
  const { isLoading } = useApiStore();
  const [error, setError] = useState<string | null>(null);

  const p = t.panels['create-customer'];

  const handleSubmit = async () => {
    setError(null);
    if (!createForm.name.trim())  { setError(t.errors.name_required);  return; }
    if (!createForm.email.trim()) { setError(t.errors.email_required); return; }

    await createCustomer({
      name:  createForm.name.trim(),
      email: createForm.email.trim(),
      ...(createForm.phone?.trim() ? { phone: createForm.phone.trim() } : {}),
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
          <Field label={t.fields.email} required hint={t.hints.email}>
            <TextInput type="email" placeholder={t.placeholders.email}
              value={createForm.email}
              onChange={(e) => setCreateForm({ email: e.target.value })} />
          </Field>
        </div>
        <Field label={t.fields.phone} hint={t.hints.phone}>
          <TextInput placeholder={t.placeholders.phone}
            value={createForm.phone ?? ''}
            onChange={(e) => setCreateForm({ phone: e.target.value })} />
        </Field>
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
