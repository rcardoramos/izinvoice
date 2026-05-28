import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession, CompanySession } from '@/types/auth.types';

interface AuthState {
  accessToken: string | null;
  user: UserSession | null;
  company: CompanySession | null;
  isAuthenticated: boolean;
  setSession: (accessToken: string, user: UserSession, company: CompanySession) => void;
  clearSession: () => void;
  updateCompanyEnv: (env: 'beta' | 'homologacion' | 'production') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      company: null,
      isAuthenticated: false,
      setSession: (accessToken, user, company) => {
        if (typeof window !== 'undefined') {
          const d = new Date();
          d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
          const expires = `;expires=${d.toUTCString()};path=/`;
          document.cookie = `token=${encodeURIComponent(accessToken)}${expires}`;
        }
        set({ accessToken, user, company, isAuthenticated: true });
      },
      clearSession: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
        }
        set({ accessToken: null, user: null, company: null, isAuthenticated: false });
      },
      updateCompanyEnv: (env) =>
        set((state) => {
          if (!state.company) return state;
          return {
            company: {
              ...state.company,
              sunatEnvironment: env,
            },
          };
        }),
    }),
    {
      name: 'invoiceflow-auth',
    }
  )
);
