import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  lastOrder: null,
  setLastOrder: (order) => set({ lastOrder: order || null }),
  clearLastOrder: () => set({ lastOrder: null }),
}));
