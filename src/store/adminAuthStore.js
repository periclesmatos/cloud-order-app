import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: ({ user, accessToken }) =>
        set({
          user: user || null,
          accessToken: accessToken || null,
          isAuthenticated: Boolean(accessToken),
        }),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'admin-auth',
    },
  ),
);
