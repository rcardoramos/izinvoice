'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PdfViewer } from '@/components/shared/PdfViewer';
import { BillingApiClient } from '@/services/api-client';
import { DOC_TYPE_LABELS } from '@/types/enums';
import { useAuthStore } from '@/store/auth';
import { 
  FileText, 
  Download, 
  FileCode, 
  PlusCircle, 
  Trash2, 
  X, 
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function InvoicesHistoryPage() {
  const { company } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  
  // Credit Note dialog state
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteForm, setNoteForm] = useState({
    serie: '',
    motivoCodigo: '01',
    motivoDescripcion: 'ANULACION DE LA VENTA',
  });
  const [noteEmitting, setNoteEmitting] = useState(false);

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await BillingApiClient.listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Error loading documents list', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Fetch document details for the drawer
  useEffect(() => {
    if (!selectedDocId) {
      setSelectedDoc(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setDrawerLoading(true);
        const detail = await BillingApiClient.getDocument(selectedDocId);
        setSelectedDoc(detail);
        
        // Preset default NC series based on affected document type
        const prefix = detail.docType === '01' ? 'FC01' : 'BC01';
        setNoteForm((prev) => ({
          ...prev,
          serie: prefix,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setDrawerLoading(false);
      }
    };
    fetchDetail();
  }, [selectedDocId]);

  // Action: emit credit note
  const handleEmitCreditNote = async () => {
    if (!selectedDoc) return;
    try {
      setNoteEmitting(true);
      
      const payload = {
        serie: noteForm.serie,
        moneda: selectedDoc.payload.moneda || 'PEN',
        documentoAfectadoId: selectedDoc.id,
        cliente: selectedDoc.payload.cliente,
        items: selectedDoc.payload.items,
        motivoCodigo: noteForm.motivoCodigo,
        motivoDescripcion: noteForm.motivoDescripcion,
      };

      const result = await BillingApiClient.createCreditNote(payload);
      
      alert(`Nota de Crédito ${result.serie}-${result.correlativo} emitida con éxito.`);
      setShowNoteDialog(false);
      setSelectedDocId(null);
      
      // Reload list
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Error al emitir la Nota de Crédito.');
    } finally {
      setNoteEmitting(false);
    }
  };

  // Action: void facturas (RA)
  const handleVoidFactura = async () => {
    if (!selectedDoc) return;
    if (!confirm(`¿Está seguro de que desea dar de baja la Factura ${selectedDoc.serie}-${selectedDoc.correlativo}?`)) return;

    try {
      setDrawerLoading(true);
      await BillingApiClient.voidedDocuments({
        documentIds: [selectedDoc.id],
        motivoBaja: 'ERROR EN FACTURACION',
      });
      alert('Comunicación de baja (RA) enviada a SUNAT. Consulte su estado en el menú de resúmenes.');
      setSelectedDocId(null);
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Error al procesar la baja.');
    } finally {
      setDrawerLoading(false);
    }
  };

  // Table columns definition
  const columns = [
    {
      key: 'serie_correlativo',
      label: 'Documento',
      render: (_: any, row: any) => (
        <button
          onClick={() => setSelectedDocId(row.id)}
          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer"
        >
          {row.serie}-{String(row.correlativo).padStart(8, '0')}
        </button>
      ),
    },
    {
      key: 'doc_type',
      label: 'Tipo',
      render: (val: any) => DOC_TYPE_LABELS[val as '01'] || val,
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (_: any, row: any) => (
        <div className="max-w-[200px] truncate">
          <p className="font-semibold truncate">{row.payload?.cliente?.razonSocial}</p>
          <p className="text-[9px] text-zinc-400 font-mono">{row.payload?.cliente?.numDoc}</p>
        </div>
      ),
    },
    {
      key: 'issue_date',
      label: 'Fecha',
      render: (val: any) => val,
    },
    {
      key: 'total',
      label: 'Total',
      render: (val: any) => (
        <span className="font-mono font-bold">
          S/ {parseFloat(val).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado SUNAT',
      render: (val: any) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* List layout */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PageHeader 
          title="Historial de Documentos" 
          subtitle="Catálogo histórico de comprobantes y resúmenes SUNAT"
        />

        <div className="p-8 max-w-7xl w-full mx-auto pb-16">
          <DataTable
            columns={columns}
            data={documents}
            searchPlaceholder="Buscar por nro, cliente..."
            searchKey="serie"
            loading={loading}
            emptyMessage="No se encontraron comprobantes registrados en esta empresa."
          />
        </div>
      </div>

      {/* Flyout detailed Drawer Panel */}
      {selectedDocId && (
        <div className="w-[500px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen shrink-0 relative z-30 shadow-2xl select-none">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Detalles de Comprobante</h3>
            <button
              onClick={() => setSelectedDocId(null)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer text-zinc-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {drawerLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-400 font-mono">Cargando detalles...</span>
              </div>
            ) : selectedDoc ? (
              <div className="space-y-6">
                
                {/* Status and download buttons card */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{selectedDoc.serie}-{selectedDoc.correlativo}</span>
                    <StatusBadge status={selectedDoc.status} />
                  </div>

                  {/* Actions buttons grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <a
                      href={BillingApiClient.getXmlUrl(selectedDoc.id)}
                      download
                      className="flex items-center justify-center gap-1 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all text-center"
                    >
                      <FileCode className="w-4 h-4 text-blue-500" /> XML UBL
                    </a>
                    {selectedDoc.status === 'accepted' ? (
                      <a
                        href={BillingApiClient.getCdrUrl(selectedDoc.id)}
                        download
                        className="flex items-center justify-center gap-1 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all text-center"
                      >
                        <Download className="w-4 h-4 text-emerald-500" /> CDR SUNAT
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed text-center">
                        <Download className="w-4 h-4" /> CDR (N/A)
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific actions based on status */}
                {selectedDoc.status === 'accepted' && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800/80 rounded-xl space-y-3">
                    <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Acciones SUNAT</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setShowNoteDialog(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-blue-500" /> Emitir Nota de Crédito
                      </button>
                      
                      {selectedDoc.docType === '01' && (
                        <button
                          onClick={handleVoidFactura}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Comunicar de Baja (Anular)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {selectedDoc.status === 'signed' && selectedDoc.docType === '03' && (
                  <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-500/90 leading-snug">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Esta boleta está firmada localmente pero no ha sido enviada a SUNAT. Inclúyala en un <b>Resumen Diario</b> para procesarla.</p>
                  </div>
                )}

                {/* PDF receipt print format wrapper */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-100 dark:bg-zinc-900/40">
                  <PdfViewer
                    document={selectedDoc}
                    companyName={company?.businessName || ''}
                    companyRuc={company?.ruc || ''}
                    companyAddress={company?.address || ''}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Credit Note prompt Dialog */}
      {showNoteDialog && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Emitir Nota de Crédito
            </h3>
            <p className="text-xs text-zinc-400 leading-snug">
              Se emitirá una Nota de Crédito electrónica afectando el documento original <b>{selectedDoc.serie}-{selectedDoc.correlativo}</b>.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Serie Nota</label>
                <select
                  value={noteForm.serie}
                  onChange={(e) => setNoteForm({ ...noteForm, serie: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                >
                  {selectedDoc.docType === '01' ? (
                    <option value="FC01">FC01 (Nota Crédito Factura)</option>
                  ) : (
                    <option value="BC01">BC01 (Nota Crédito Boleta)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Motivo de Emisión</label>
                <select
                  value={noteForm.motivoCodigo}
                  onChange={(e) => setNoteForm({ ...noteForm, motivoCodigo: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                >
                  <option value="01">Anulación de la operación</option>
                  <option value="02">Anulación por error en el RUC</option>
                  <option value="06">Devolución total</option>
                  <option value="07">Devolución parcial</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Sustento / Descripción</label>
                <input
                  type="text"
                  value={noteForm.motivoDescripcion}
                  onChange={(e) => setNoteForm({ ...noteForm, motivoDescripcion: e.target.value.toUpperCase() })}
                  required
                  placeholder="ANULACION DE OPERACION POR ERROR"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNoteDialog(false)}
                  disabled={noteEmitting}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-zinc-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEmitCreditNote}
                  disabled={noteEmitting || !noteForm.motivoDescripcion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {noteEmitting ? 'Emitiendo...' : 'Emitir Nota'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
