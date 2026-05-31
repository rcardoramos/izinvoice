'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, Ban } from 'lucide-react';

interface VoidFacturaModalProps {
  doc: {
    id: string;
    serie: string;
    correlativo: number;
    status: string;
    docType: string;
    issueDate?: string;
    total?: string;
  };
  onVoid: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function VoidFacturaModal({ doc, onVoid, onClose }: VoidFacturaModalProps) {
  const [reason, setReason] = useState('ERROR EN DATOS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocName = () => {
    switch (doc.docType) {
      case '07':
        return 'Nota de Crédito';
      case '08':
        return 'Nota de Débito';
      default:
        return 'Factura';
    }
  };

  const docLabel = `${doc.serie}-${String(doc.correlativo).padStart(8, '0')}`;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Debe especificar un motivo de baja.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onVoid(reason.trim());
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      setError(errMsg || 'Error al procesar la comunicación de baja.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
              <Ban className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Anulación de {getDocName()} (Baja)</h2>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{docLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mt-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Warning banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">¿Qué significa dar de baja esta {getDocName().toLowerCase()}?</p>
              <ul className="text-[11px] text-amber-700 dark:text-amber-555 space-y-1 list-disc list-inside">
                <li>Se enviará una <strong>comunicación de baja (RA)</strong> a SUNAT.</li>
                <li>Solo aplica a {getDocName().toLowerCase() === 'factura' ? 'facturas' : 'notas'} en estado <strong>Aceptado</strong>.</li>
                <li>La fecha de referencia de la baja coincidirá con la de emisión de la {getDocName().toLowerCase()}.</li>
                <li>Esta acción <strong>es irreversible</strong> ante la SUNAT.</li>
              </ul>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Documento</p>
              <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{docLabel}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Total</p>
              <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-0.5">
                S/ {parseFloat(doc.total || '0').toFixed(2)}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Fecha</p>
              <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{doc.issueDate || '—'}</p>
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 tracking-wide">
              Motivo de la baja <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: ERROR EN DATOS, ERROR EN RUC..."
              maxLength={100}
              rows={2}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 resize-none font-mono"
            />
            <p className="text-[10px] text-zinc-400 text-right mt-0.5">{reason.length}/100</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Regresar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm shadow-red-500/20 cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
            ) : (
              <><Ban className="w-3.5 h-3.5" /> Confirmar Baja</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
