'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { Sidebar } from '@/components/shared/Sidebar';
import { SearchCommand } from '@/components/shared/SearchCommand';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, company } = useAuthStore();
  const { theme } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force light mode on load
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');

    if (!isAuthenticated) {
      router.push('/');
    } else {
      // Operator routing restrictions
      if (user?.role === 'operator') {
        const forbiddenPaths = [
          '/dashboard',
          '/dashboard/products',
          '/dashboard/daily-summaries',
          '/dashboard/settings'
        ];
        if (forbiddenPaths.includes(pathname)) {
          router.push('/dashboard/invoices/new');
          return;
        }
      }

      // Super Admin routing restrictions (no tenant company context)
      if (user?.role === 'super_admin') {
        const allowedPaths = [
          '/dashboard',
          '/dashboard/companies',
        ];
        if (!allowedPaths.includes(pathname)) {
          router.push('/dashboard');
          return;
        }
      }
      
      setLoading(false);
    }
  }, [isAuthenticated, router, theme, user, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-zinc-500 font-mono">Iniciando InvoiceFlow...</span>
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
