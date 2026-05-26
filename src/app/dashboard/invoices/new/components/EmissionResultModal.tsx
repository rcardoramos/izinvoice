'use client';

import React from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  Check, 
  FileCode, 
  Download, 
  Printer 
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PdfViewer } from '@/components/shared/PdfViewer';
import { BillingApiClient } from '@/services/api-client';

interface EmissionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  emissionLoading: boolean;
  apiError: string | null;
  emittedDoc: any;
  docType: string;
  serie: string;
  selectedClient: any;
  lines: any[];
  subtotal: number;
  igvTotal: number;
  total: number;
  company: any;
}

export function EmissionResultModal({
  isOpen,
  onClose,
  emissionLoading,
  apiError,
  emittedDoc,
  docType,
  serie,
  selectedClient,
  lines,
  subtotal,
  igvTotal,
  total,
  company,
}: EmissionResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto select-none print:bg-white print:p-0 print:block print:static print:z-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:border-none print:shadow-none print:my-0 print:max-w-none print:bg-white animate-in fade-in zoom-in-95 duration-150">
        
        {/* Outcome banner */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            {emissionLoading ? (
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            ) : apiError ? (
              <AlertCircle className="w-6 h-6 text-rose-500" />
            ) : (
              <Check className="w-6 h-6 text-emerald-500" />
            )}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                {emissionLoading ? 'Procesando Firma y Emisión...' : apiError ? 'Error de Emisión' : 'Comprobante Emitido'}
              </h3>
              <p className="text-[10px] text-zinc-550 dark:text-zinc-500 font-mono">
                {emissionLoading ? 'Negociando con servidores SUNAT...' : apiError ? 'Error devuelto por la API SUNAT' : `Documento registrado con éxito.`}
              </p>
            </div>
          </div>
          
          {!emissionLoading && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-355 cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Content box */}
        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 flex-1 max-h-[90vh] overflow-y-auto space-y-6 print:p-0 print:bg-white print:max-h-none print:overflow-visible">
          {emissionLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Generando UBL XML, firmando digitalmente y enviando...</p>
            </div>
          ) : apiError ? (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs space-y-2">
              <div className="flex gap-2 items-center text-rose-500 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Error al enviar a SUNAT</span>
              </div>
              <p className="text-rose-600 dark:text-rose-400 leading-snug">{apiError}</p>
              <p className="text-[10px] text-zinc-500 pt-2 font-mono">Verifique el ambiente SUNAT o consulte en los registros de bajas.</p>
            </div>
          ) : emittedDoc ? (
            <div className="space-y-6">
              {/* Status Badges & Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-2 text-xs">
                  <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Resultado Transacción</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-white">{emittedDoc.serie}-{emittedDoc.correlativo}</span>
                    <StatusBadge status={emittedDoc.status} />
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-snug">
                    {emittedDoc.sunat?.description || emittedDoc.message || 'El comprobante ha sido registrado.'}
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Archivos Digitales</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <a
                      href={BillingApiClient.getXmlUrl(emittedDoc.id)}
                      download
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <FileCode className="w-4 h-4 text-blue-500" /> XML UBL
                    </a>
                    {emittedDoc.status === 'accepted' ? (
                      <a
                        href={BillingApiClient.getCdrUrl(emittedDoc.id)}
                        download
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <Download className="w-4 h-4 text-emerald-500" /> CDR SUNAT
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/55 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-650 cursor-not-allowed">
                        <Download className="w-4 h-4" /> CDR (N/A)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PDF Receipt Print preview */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 print:border-none print:p-0">
                <p className="font-semibold text-zinc-450 dark:text-zinc-400 uppercase text-[9px] tracking-wider flex items-center justify-between print:hidden">
                  <span>Vista Previa del Formato Impreso</span>
                  <button
                    onClick={() => window.print()}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
                  </button>
                </p>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white overflow-hidden p-2 print-invoice-container print:border-none print:p-0">
                  <PdfViewer
                    document={{
                      id: emittedDoc.id,
                      docType: docType as any,
                      serie,
                      correlativo: emittedDoc.correlativo,
                      status: emittedDoc.status,
                      total: emittedDoc.total,
                      issueDate: emittedDoc.issueDate || new Date().toISOString().split('T')[0] as any,
                      dailySummaryId: null,
                      payload: {
                        cliente: {
                          tipoDoc: selectedClient?.doc_type,
                          numDoc: selectedClient?.doc_number,
                          razonSocial: selectedClient?.razon_social,
                          direccion: selectedClient?.direccion,
                        },
                        items: lines,
                        totals: {
                          subtotal,
                          igvTotal,
                          total,
                        },
                      },
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      sunat: null,
                    }}
                    companyName={company?.businessName || ''}
                    companyRuc={company?.ruc || ''}
                    companyAddress={company?.address || ''}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
