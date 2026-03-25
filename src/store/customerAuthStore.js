import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCustomerAuthStore = create(
  persist(
    (set) => ({
      customer: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: ({ customer, accessToken }) =>
        set({
          customer: customer || null,
          accessToken: accessToken || null,
          isAuthenticated: Boolean(accessToken),
        }),
      clearSession: () =>
        set({
          customer: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'customer-auth',
    },
  ),
);
