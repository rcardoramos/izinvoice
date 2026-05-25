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
      setSession: (accessToken, user, company) => 
        set({ accessToken, user, company, isAuthenticated: true }),
      clearSession: () => 
        set({ accessToken: null, user: null, company: null, isAuthenticated: false }),
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
