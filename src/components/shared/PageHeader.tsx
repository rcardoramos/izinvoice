'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app';
import { BillingApiClient } from '@/services/api-client';
import { Bell, Search, Command, Check, AlertCircle, Menu } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const { toggleCommandPalette, notifications, setNotifications, unreadCount, toggleMobileSidebar } = useAppStore();
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
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-8 select-none">
      {/* Title section */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Fake search button (Ctrl+K palette trigger) */}
        <button
          onClick={toggleCommandPalette}
          className="flex items-center justify-center sm:justify-start gap-3 p-2 sm:px-3.5 sm:py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all text-zinc-400 w-10 h-10 sm:w-64 text-left cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="text-xs flex-1 hidden sm:inline">Buscar comandos...</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-zinc-200/60 px-1.5 py-0.5 rounded-md font-mono font-bold text-zinc-600">
            <Command className="w-2.5 h-2.5" /> K
          </span>
        </button>

        {/* Notifications Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors relative cursor-pointer text-zinc-600"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4f46e5] text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-zinc-200 shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-zinc-150 flex items-center justify-between bg-zinc-50">
                <span className="text-xs font-bold text-zinc-900">Notificaciones</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-[#4f46e5] font-semibold hover:underline cursor-pointer"
                  >
                    Marcar todo leído
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400">No hay notificaciones recientes</div>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-[11px] transition-colors ${
                        notif.read ? 'bg-transparent' : 'bg-indigo-500/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'error' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-zinc-900">{notif.title}</p>
                          <p className="text-zinc-500 mt-0.5 leading-snug">{notif.message}</p>
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
