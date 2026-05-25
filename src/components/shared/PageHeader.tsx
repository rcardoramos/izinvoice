'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';
import { BillingApiClient } from '@/services/api-client';
import { Bell, Search, Command, Check, AlertCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const { toggleCommandPalette, notifications, setNotifications, unreadCount } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications periodically
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const list = await BillingApiClient.listNotifications();
        setNotifications(list);
      } catch (e) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // 10s polling for realtime feel
    return () => clearInterval(interval);
  }, [setNotifications]);

  const markAllRead = async () => {
    try {
      await BillingApiClient.markNotificationRead();
      const list = await BillingApiClient.listNotifications();
      setNotifications(list);
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full glassmorphism border-b h-16 flex items-center justify-between px-8 select-none">
      {/* Title section */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-[10px] text-zinc-500 font-medium">{subtitle}</p>}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Fake search button (Ctrl+K palette trigger) */}
        <button
          onClick={toggleCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-zinc-400 dark:text-zinc-500 w-64 text-left cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs flex-1">Buscar comandos...</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono font-medium text-zinc-500 dark:text-zinc-400">
            <Command className="w-2.5 h-2.5" /> K
          </span>
        </button>

        {/* Notifications Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors relative cursor-pointer text-zinc-600 dark:text-zinc-300"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white">Notificaciones</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                  >
                    Marcar todo leido
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">No hay notificaciones recientes</div>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-[11px] transition-colors ${
                        notif.read ? 'bg-transparent' : 'bg-blue-500/[0.02] dark:bg-blue-500/[0.03]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'error' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-white">{notif.title}</p>
                          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">{notif.message}</p>
                          <p className="text-[9px] text-zinc-400 font-mono mt-1">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Children layout insertion */}
        {children}
      </div>
    </header>
  );
}
