'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { BillingApiClient } from '@/services/api-client';
import { Sidebar } from '@/components/shared/Sidebar';
import { SearchCommand } from '@/components/shared/SearchCommand';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, company, setSession, accessToken } = useAuthStore();
  const { theme } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force light mode on load
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');

    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Refresh user/company data from the real API on every dashboard load
    const refreshSession = async () => {
      try {
        const me = await BillingApiClient.me();
        if (me?.user) {
          const normalizedUser = {
            id: me.user?.id || user?.id || '',
            username: me.user?.username || user?.username || '',
            fullName: me.user?.fullName || me.user?.username || user?.fullName || '',
            email: me.user?.email || user?.email || null,
            role: (me.user?.role as 'super_admin' | 'admin') || user?.role || 'admin',
          };
          // Only update if something actually changed
          setSession(accessToken!, normalizedUser, me.company ?? company!);
        }
      } catch {
        // Silently ignore — keep existing cached session
      }

      // Super Admin routing restrictions (no tenant company context)
      if (user?.role === 'super_admin') {
        const allowedPaths = ['/dashboard', '/dashboard/companies'];
        if (!allowedPaths.includes(pathname)) {
          router.push('/dashboard');
          return;
        }
      }

      setLoading(false);
    };

    refreshSession();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-zinc-800">
        <div className="w-8 h-8 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-zinc-500 font-sans font-semibold">Iniciando Izinvoce...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}

        {/* Global Ctrl+K Command Palette overlay */}
        <SearchCommand />
      </div>
    </div>
  );
}
