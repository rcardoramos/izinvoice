'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function AlertModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Aceptar',
  onClose,
  onConfirm,
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const typeConfig = {
    success: {
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5" />,
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 focus:ring-emerald-500/30',
    },
    error: {
      iconBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      icon: <AlertCircle className="w-5 h-5" />,
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10 focus:ring-rose-500/30',
    },
    warning: {
      iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5" />,
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10 focus:ring-amber-500/30',
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      icon: <Info className="w-5 h-5" />,
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 focus:ring-blue-500/30',
    },
  };

  const activeConfig = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs select-none">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* Card Dialog */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 relative z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 cursor-pointer rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          {/* Icon wrapper */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activeConfig.iconBg}`}>
            {activeConfig.icon}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px]">
              {message}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleConfirm}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeConfig.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
