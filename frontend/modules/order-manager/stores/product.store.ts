import { create } from 'zustand';
import { Product, ProductCreate } from '../models';

// ─── Стор формы товара ───────────────────────────────────────────────────────

interface ProductStore {
  createForm:     ProductCreate;
  setCreateForm:  (data: Partial<ProductCreate>) => void;
  resetCreateForm: () => void;

  getById:    string;
  setGetById: (id: string) => void;

  product:    Product | null;
  setProduct: (p: Product | null) => void;
}

const empty: ProductCreate = { name: '', sku: '', price: '', description: '' };

export const useProductStore = create<ProductStore>((set) => ({
  createForm:     { ...empty },
  setCreateForm:  (data) => set((s) => ({ createForm: { ...s.createForm, ...data } })),
  resetCreateForm: ()   => set({ createForm: { ...empty } }),

  getById:    '',
  setGetById: (id) => set({ getById: id }),

  product:    null,
  setProduct: (p) => set({ product: p }),
}));
