'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, Ban } from 'lucide-react';

interface CancelBoletaModalProps {
  doc: {
    id: string;
    serie: string;
    correlativo: number;
    status: string;
    docType: string;
    issueDate?: string;
    total?: string;
  };
  onCancel: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function CancelBoletaModal({ doc, onCancel, onClose }: CancelBoletaModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocName = () => {
    switch (doc.docType) {
      case '07':
        return 'Nota de Crédito';
      case '08':
        return 'Nota de Débito';
      default:
        return 'Boleta';
    }
  };

  const docLabel = `${doc.serie}-${String(doc.correlativo).padStart(8, '0')}`;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onCancel(reason.trim());
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      setError(errMsg || `Error al cancelar la ${getDocName().toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-xl w-full overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Ban className="w-4.5 h-4.5 text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Cancelar {getDocName()}</h2>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{docLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 transition-colors mt-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Warning banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-800">¿Qué significa cancelar esta {getDocName().toLowerCase()}?</p>
              <ul className="text-[11px] text-amber-700 space-y-1 list-disc list-inside">
                <li>La {getDocName().toLowerCase()} <strong>no se comunicará a SUNAT</strong> y quedará marcada como <em>cancelada</em>.</li>
                <li>Solo aplica a {getDocName().toLowerCase() === 'boleta' ? 'boletas' : 'notas'} <strong>firmadas localmente</strong> que aún no fueron incluidas en un Resumen Diario (RC).</li>
                <li>Esta acción <strong>es irreversible</strong>. {doc.docType === '03' && 'Si la boleta ya fue entregada al cliente, considera emitir una Nota de Crédito en su lugar.'}</li>
              </ul>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Documento</p>
              <p className="text-xs font-mono font-bold text-zinc-900 mt-0.5">{docLabel}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Total</p>
              <p className="text-xs font-mono font-bold text-zinc-900 mt-0.5">
                S/ {parseFloat(doc.total || '0').toFixed(2)}
              </p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide">Fecha</p>
              <p className="text-xs font-mono font-bold text-zinc-900 mt-0.5">{doc.issueDate || '—'}</p>
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 tracking-wide">
              Motivo de cancelación <span className="text-zinc-300 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Emitida por error, datos incorrectos..."
              maxLength={500}
              rows={2}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <p className="text-[10px] text-zinc-400 text-right mt-0.5">{reason.length}/500</p>
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
            className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            No cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm shadow-red-500/20"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelando...</>
            ) : (
              <><Ban className="w-3.5 h-3.5" /> Cancelar {getDocName()}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
