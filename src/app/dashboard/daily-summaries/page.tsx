'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BillingApiClient } from '@/services/api-client';
import { useAppStore } from '@/store/app';
import { SUMMARY_STATUS_LABELS } from '@/types/enums';
import { 
  Layers, 
  Send, 
  RefreshCw, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function DailySummariesPage() {
  const { addNotification } = useAppStore();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RC' | 'RA'>('RC');

  // Compilation dialog
  const [showDialog, setShowDialog] = useState(false);
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [compiling, setCompiling] = useState(false);

  // Status check loading states
  const [checkingIds, setCheckingIds] = useState<Record<string, boolean>>({});

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const res = await BillingApiClient.listDailySummaries(activeTab);
      // External API returns paginated { data: [], meta: {} } or plain array
      const data = Array.isArray(res) ? res : (res as any)?.data ?? [];
      setSummaries(data);
    } catch (e) {
      console.warn('Failed to load daily summaries from server:', e);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaries();
  }, [activeTab]);

  // Create daily summary (RC Altas)
  const handleCreateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCompiling(true);
      const res = await BillingApiClient.closeDailySummary({ referenceDate: referenceDate as any });
      
      addNotification({
        id: Math.random().toString(),
        title: 'Resumen Creado',
        message: `Resumen de boletas ${res.summaryCode} enviado. Ticket: ${res.ticket}.`,
        type: 'success',
        created_at: new Date().toISOString(),
      });
      
      setShowDialog(false);
      loadSummaries();
    } catch (err: any) {
      alert(err.message || 'No hay boletas firmadas para la fecha seleccionada.');
    } finally {
      setCompiling(false);
    }
  };

  // Poll ticket status
  const handleCheckStatus = async (summaryId: string, summaryCode: string) => {
    setCheckingIds((prev) => ({ ...prev, [summaryId]: true }));
    try {
      const res = await BillingApiClient.pollDailySummaryStatus(summaryId);
      
      if (res.status === 'accepted') {
        addNotification({
          id: Math.random().toString(),
          title: 'Resumen Aceptado',
          message: `SUNAT aprobó el envío del resumen ${summaryCode}. Comprobantes actualizados.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
      } else if (res.status === 'processing') {
        alert('SUNAT responde: El resumen sigue en procesamiento (Código 98). Reintente en un momento.');
      } else {
        alert(`SUNAT responde: El ticket ha sido procesado con resultado: ${res.status}`);
      }

      loadSummaries();
    } catch (err: any) {
      alert(err.message || 'Error al consultar ticket.');
    } finally {
      setCheckingIds((prev) => ({ ...prev, [summaryId]: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader 
        title="Resúmenes y Comunicaciones SUNAT" 
        subtitle="Monitoreo asíncrono de tickets de Boletas (RC) y Bajas de Facturas (RA)"
      />

      <div className="p-8 space-y-6 max-w-7xl w-full mx-auto pb-16">
        
        {/* Info Banner on SUNAT Async Flow */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Flujo Asíncrono de Boletas y Bajas</h4>
            <p className="text-zinc-500 leading-relaxed">
              A diferencia de las Facturas (que se validan en tiempo real vía síncrona), las <b>Boletas de Venta</b> y las <b>Comunicaciones de Baja (Anulaciones)</b> se informan a SUNAT agrupadas en resúmenes diarios. El sistema recibe un <b>Ticket de Operación</b> y se debe realizar una consulta posterior para verificar la aceptación y descargar el CDR.
            </p>
          </div>
        </div>

        {/* Tab switch and Actions control block */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 flex items-center gap-1 select-none">
            <button
              onClick={() => setActiveTab('RC')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'RC'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Resúmenes Diarios (RC)
            </button>
            <button
              onClick={() => setActiveTab('RA')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'RA'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Bajas de Facturas (RA)
            </button>
          </div>

          {activeTab === 'RC' && (
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <Send className="w-3.5 h-3.5" /> Cerrar Resumen Diario
            </button>
          )}
        </div>

        {/* Summaries list table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden select-none">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-400 font-mono">Cargando registros...</span>
            </div>
          ) : summaries.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400">
              No hay resúmenes ({activeTab}) registrados en la empresa.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 uppercase font-semibold">
                    <th className="p-4">Código Resumen</th>
                    <th className="p-4">Fecha Emisión Docs</th>
                    <th className="p-4">Fecha Envío</th>
                    <th className="p-4">Ticket</th>
                    <th className="p-4 text-center">Docs</th>
                    <th className="p-4">Estado SUNAT</th>
                    <th className="p-4 text-right">Consulta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 text-zinc-700 dark:text-zinc-300">
                  {summaries.map((sum) => {
                    const isChecking = checkingIds[sum.id];
                    const canPoll = ['processing', 'submitted', 'draft', 'failed'].includes(sum.status) && sum.ticket;

                    return (
                      <tr key={sum.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 font-mono font-bold">{sum.summaryCode ?? sum.summary_code}</td>
                        <td className="p-4">{sum.referenceDate ?? sum.reference_date}</td>
                        <td className="p-4">{sum.issueDate ?? sum.issue_date}</td>
                        <td className="p-4 font-mono text-zinc-500">{sum.ticket || 'N/A'}</td>
                        <td className="p-4 text-center font-semibold font-mono">{sum.documentCount ?? sum.document_count ?? '—'}</td>
                        <td className="p-4"><StatusBadge status={sum.status} /></td>
                        <td className="p-4 text-right">
                          {canPoll ? (
                            <button
                              onClick={() => handleCheckStatus(sum.id, sum.summaryCode ?? sum.summary_code)}
                              disabled={isChecking}
                              className="inline-flex items-center gap-1 py-1 px-2.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                              <span>Consultar ticket</span>
                            </button>
                          ) : sum.status === 'accepted' ? (
                            <span className="text-emerald-500 inline-flex items-center gap-1 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Procesado
                            </span>
                          ) : (
                            <span className="text-zinc-400 inline-flex items-center gap-1 text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5" /> No disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Close daily summary compilation Modal */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[420px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex gap-3 items-start border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Layers className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Cerrar Resumen Diario</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">Se agruparán todos los comprobantes 'firmados' (signed) para enviarlos a SUNAT en un solo bloque.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSummary} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1.5">Fecha de Emisión de Docs</label>
                <input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 font-mono"
                />
                <p className="text-[9px] text-zinc-500 mt-1 leading-snug">
                  Solo se incluirán Boletas, Notas de Crédito y Notas de Débito que tengan esta fecha de emisión y se encuentren pendientes.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  disabled={compiling}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-zinc-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={compiling}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {compiling ? 'Enviando...' : 'Compilar y Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
