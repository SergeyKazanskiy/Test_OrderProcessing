import { create } from 'zustand';
import { Customer, CustomerCreate } from '../models';

// ─── Стор формы клиента ──────────────────────────────────────────────────────

interface CustomerStore {
  createForm:     CustomerCreate;
  setCreateForm:  (data: Partial<CustomerCreate>) => void;
  resetCreateForm: () => void;

  getById:    string;
  setGetById: (id: string) => void;

  customer:    Customer | null;
  setCustomer: (c: Customer | null) => void;
}

const empty: CustomerCreate = { name: '', email: '', phone: '' };

export const useCustomerStore = create<CustomerStore>((set) => ({
  createForm:     { ...empty },
  setCreateForm:  (data) => set((s) => ({ createForm: { ...s.createForm, ...data } })),
  resetCreateForm: ()   => set({ createForm: { ...empty } }),

  getById:    '',
  setGetById: (id) => set({ getById: id }),

  customer:    null,
  setCustomer: (c) => set({ customer: c }),
}));
