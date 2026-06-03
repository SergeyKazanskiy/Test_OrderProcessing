import { create } from 'zustand';
import { Order, OrderItemCreate } from '../models';

// ─── Стор формы заказа ──────────────────────────────────────────────────────

interface OrderStore {
  customerId:       string;
  notes:            string;
  items:            OrderItemCreate[];

  setCustomerId:    (id: string) => void;
  setNotes:         (n: string) => void;
  addItem:          () => void;
  updateItem:       (i: number, d: Partial<OrderItemCreate>) => void;
  removeItem:       (i: number) => void;
  resetForm:        () => void;

  getById:          string;
  setGetById:       (id: string) => void;

  getByCustomerId:  string;
  setGetByCustomerId: (id: string) => void;

  order:    Order | null;
  orders:   Order[];
  setOrder:   (o: Order | null) => void;
  setOrders:  (list: Order[]) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  customerId: '',
  notes:      '',
  items:      [{ product_id: 0, quantity: 1 }],

  setCustomerId: (id) => set({ customerId: id }),
  setNotes:      (n)  => set({ notes: n }),

  addItem: () =>
    set((s) => ({ items: [...s.items, { product_id: 0, quantity: 1 }] })),

  updateItem: (i, d) =>
    set((s) => ({ items: s.items.map((item, idx) => idx === i ? { ...item, ...d } : item) })),

  removeItem: (i) =>
    set((s) => ({ items: s.items.filter((_, idx) => idx !== i) })),

  resetForm: () =>
    set({ customerId: '', notes: '', items: [{ product_id: 0, quantity: 1 }] }),

  getById:    '',
  setGetById: (id) => set({ getById: id }),

  getByCustomerId:    '',
  setGetByCustomerId: (id) => set({ getByCustomerId: id }),

  order:    null,
  orders:   [],
  setOrder:  (o)    => set({ order: o }),
  setOrders: (list) => set({ orders: list }),
}));
