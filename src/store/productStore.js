import { create } from 'zustand';
import { getActiveProducts } from '../service/productService';

export const useProductStore = create((set, get) => ({
  products: [],
  cart: {},
  isLoading: false,
  error: null,
  fetchActiveProducts: async () => {
    set({ isLoading: true, error: null });

    try {
      const products = await getActiveProducts();
      const availableProducts = products.filter((product) => Number(product?.amount) > 0);

      // Remove do carrinho itens que não existem mais na listagem atual.
      const currentCart = get().cart;
      const validProductIds = new Set(availableProducts.map((product) => product.id));
      const nextCart = Object.fromEntries(Object.entries(currentCart).filter(([productId]) => validProductIds.has(productId)));

      set({ products: availableProducts, cart: nextCart, isLoading: false });
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Erro ao buscar produtos ativos';
      set({ error: message, isLoading: false });
    }
  },
  incrementItem: (productId) => {
    const product = get().products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    set((state) => {
      const currentQuantity = state.cart[productId] || 0;
      const maxStock = Number(product.amount) || 0;
      const nextQuantity = Math.min(currentQuantity + 1, maxStock);

      return {
        cart: {
          ...state.cart,
          [productId]: nextQuantity,
        },
      };
    });
  },
  decrementItem: (productId) => {
    set((state) => {
      const currentQuantity = state.cart[productId] || 0;
      const nextQuantity = Math.max(currentQuantity - 1, 0);

      if (nextQuantity === 0) {
        const nextCart = { ...state.cart };
        delete nextCart[productId];
        return { cart: nextCart };
      }

      return {
        cart: {
          ...state.cart,
          [productId]: nextQuantity,
        },
      };
    });
  },
  clearCart: () => set({ cart: {} }),
}));
