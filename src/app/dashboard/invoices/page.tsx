'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PdfViewer } from '@/components/shared/PdfViewer';
import { CancelBoletaModal } from '@/components/shared/CancelBoletaModal';
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
  DollarSign,
  Mail,
  MessageSquare,
  Printer,
  Filter,
  RefreshCw,
  Search,
  Ban
} from 'lucide-react';

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.436 0 9.86-4.426 9.864-9.864.002-2.63-1.023-5.102-2.887-6.968C16.48 1.908 14.021.879 12.002.879c-5.45 0-9.878 4.432-9.882 9.886-.001 1.626.436 3.21 1.266 4.616l-.971 3.548 3.642-.955zm11.378-5.918c-.31-.154-1.834-.905-2.119-1.01-.285-.104-.493-.154-.7.154-.207.31-.801.983-.983 1.189-.181.208-.362.231-.672.077-.31-.154-1.31-.483-2.497-1.542-.924-.824-1.548-1.841-1.73-2.149-.181-.31-.02-.477.135-.631.14-.139.31-.362.466-.543.156-.181.208-.31.31-.517.104-.208.052-.389-.026-.543-.078-.154-.7-1.687-.959-2.31-.252-.61-.51-.527-.7-.537-.181-.01-.389-.01-.596-.01-.207 0-.544.078-.83.389-.285.31-1.088 1.062-1.088 2.589 0 1.528 1.11 3.003 1.266 3.21.156.208 2.186 3.338 5.295 4.68.74.32 1.317.51 1.768.653.743.236 1.419.203 1.953.123.595-.089 1.834-.75 2.093-1.47.259-.721.259-1.34.181-1.47-.078-.13-.285-.208-.595-.363z" />
  </svg>
);

export default function InvoicesHistoryPage() {
  const { company } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced filters & pagination states
  const [filters, setFilters] = useState({
    docType: '',
    status: '',
    search: '',
    serie: '',
    from: '',
    to: '',
    pendingRc: false,
  });
  
  const [page, setPage] = useState(1);
  const [limit] = useState(8); // match DataTable itemsPerPage default
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
  });

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

  // Cancel boleta modal state
  const [cancelModal, setCancelModal] = useState(false);
  const [docToCancel, setDocToCancel] = useState<any>(null);

  // Cache customers mapping for telephone/email fallback
  const [customersMap, setCustomersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await BillingApiClient.listCustomers({ limit: 100 });
        const customersData = Array.isArray(res) ? res : (res?.data ?? []);
        const map: Record<string, any> = {};
        customersData.forEach((c: any) => {
          const num = String(c.docNumber ?? c.doc_number ?? '').trim();
          if (num) {
            map[num] = c;
          }
        });
        setCustomersMap(map);
      } catch (err) {
        console.warn('Failed to load customers map', err);
      }
    };
    loadCustomers();
  }, []);

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page,
        limit,
        docType: filters.docType || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
        serie: filters.serie || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        pendingRc: filters.pendingRc ? true : undefined,
      };

      const res = await BillingApiClient.listDocuments(queryParams);
      if (res && Array.isArray(res.data)) {
        setDocuments(res.data);
        if (res.meta) {
          setMeta({
            total: res.meta.total || 0,
            totalPages: res.meta.totalPages || 1,
          });
        }
      } else if (Array.isArray(res)) {
        setDocuments(res);
        setMeta({
          total: res.length,
          totalPages: 1,
        });
      }
    } catch (e) {
      console.error('Error loading documents list', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, limit, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      docType: '',
      status: '',
      search: '',
      serie: '',
      from: '',
      to: '',
      pendingRc: false,
    });
    setPage(1);
  };

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

  // Action: cancel signed boleta (pre-RC, local only)
  const handleCancelBoleta = async (reason: string) => {
    if (!docToCancel) return;
    await BillingApiClient.cancelDocuments([docToCancel.id], reason || undefined);
    setCancelModal(false);
    setDocToCancel(null);
    if (selectedDocId === docToCancel.id) {
      setSelectedDocId(null);
    }
    loadDocuments();
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
      key: 'docType',
      label: 'Tipo',
      render: (val: any) => {
        const label = DOC_TYPE_LABELS[val as '01'] || val;
        if (val === '01') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-150 dark:border-blue-900/50 uppercase tracking-wider">
              {label}
            </span>
          );
        }
        if (val === '03') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/50 uppercase tracking-wider">
              {label}
            </span>
          );
        }
        if (val === '07') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-150 dark:border-amber-900/50 uppercase tracking-wider">
              {label}
            </span>
          );
        }
        if (val === '08') {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-150 dark:border-rose-900/50 uppercase tracking-wider">
              {label}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-800 uppercase tracking-wider">
            {label}
          </span>
        );
      },
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (_: any, row: any) => {
        // External API returns cliente at root level in list, or nested in payload for detail
        const cliente = row.cliente ?? row.payload?.cliente;
        return (
          <div className="max-w-[200px] truncate">
            <p className="font-semibold truncate">{cliente?.razonSocial ?? '-'}</p>
            <p className="text-[9px] text-zinc-400 font-mono">{cliente?.numDoc ?? ''}</p>
          </div>
        );
      },
    },
    {
      key: 'issueDate',
      label: 'Fecha',
      render: (val: any) => val,
    },
    {
      key: 'total',
      label: 'Total',
      render: (val: any) => (
        <span className="font-mono font-bold">
          S/ {parseFloat(val || '0').toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado SUNAT',
      render: (val: any) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => {
        const cliente = row.cliente ?? row.payload?.cliente;
        const clientDocNum = String(cliente?.numDoc ?? cliente?.num_doc ?? cliente?.docNumber ?? cliente?.doc_number ?? '').trim();
        const matchingCustomer = clientDocNum ? customersMap[clientDocNum] : null;
        
        const phone = (
          cliente?.telefono || 
          cliente?.phone || 
          matchingCustomer?.phone || 
          matchingCustomer?.telefono || 
          ''
        ).replace(/\D/g, '');

        const email = cliente?.correo || cliente?.email || matchingCustomer?.email || matchingCustomer?.correo || '';

        const whatsappUrl = phone 
          ? `https://wa.me/${phone.startsWith('51') ? phone : '51' + phone}?text=${encodeURIComponent(
              `Estimado cliente, le adjuntamos su comprobante electrónico ${row.serie}-${row.correlativo} por un monto de S/ ${parseFloat(row.total || '0').toFixed(2)}. ¡Muchas gracias!`
            )}`
          : null;
        
        const mailUrl = `mailto:${email}?subject=${encodeURIComponent(
          `Comprobante de Pago Electrónico ${row.serie}-${row.correlativo}`
        )}&body=${encodeURIComponent(
          `Estimado cliente,\n\nLe hacemos llegar su comprobante electrónico ${row.serie}-${row.correlativo} por un monto de S/ ${parseFloat(row.total || '0').toFixed(2)}.\n\nAtentamente,\n${company?.businessName || ''}`
        )}`;

        const handlePrint = (e: React.MouseEvent) => {
          e.stopPropagation();
          setSelectedDocId(row.id);
          setTimeout(() => {
            window.print();
          }, 300);
        };

        const handleCancelIconClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          setDocToCancel(row);
          setCancelModal(true);
        };

        const handleVoidIconClick = async (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!confirm(`¿Está seguro de que desea dar de baja la Factura ${row.serie}-${row.correlativo}?`)) return;
          try {
            setLoading(true);
            await BillingApiClient.voidedDocuments({
              documentIds: [row.id],
              motivoBaja: 'ERROR EN FACTURACION',
            });
            alert('Comunicación de baja (RA) enviada a SUNAT. Consulte su estado en el menú de resúmenes.');
            loadDocuments();
          } catch (err: any) {
            alert(err.message || 'Error al procesar la baja.');
          } finally {
            setLoading(false);
          }
        };

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* WhatsApp */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded hover:bg-emerald-500/10 text-emerald-500 cursor-pointer"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="p-1 text-zinc-300 dark:text-zinc-700 cursor-not-allowed text-zinc-400" title="Sin teléfono">
                <WhatsAppIcon className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Email */}
            <a
              href={mailUrl}
              className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer"
              title="Correo"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              title="Imprimir / PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Cancel (Signed Boleta) */}
            {row.status === 'signed' && (row.docType === '03' || row.doc_type === '03') && (
              <button
                onClick={handleCancelIconClick}
                className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                title="Cancelar Boleta"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Void (Accepted Factura) */}
            {row.status === 'accepted' && (row.docType === '01' || row.doc_type === '01') && (
              <button
                onClick={handleVoidIconClick}
                className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                title="Anular Factura"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* List layout */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PageHeader 
          title="Historial de Documentos" 
          subtitle="Catálogo histórico de comprobantes y resúmenes SUNAT"
        />

        <div className="p-8 max-w-7xl w-full mx-auto pb-16 space-y-6">
          
          {/* Filters Panel Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-500" />
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Filtros de Búsqueda</h4>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Limpiar Filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Tipo Documento</label>
                <select
                  value={filters.docType}
                  onChange={(e) => handleFilterChange('docType', e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="01">Factura</option>
                  <option value="03">Boleta</option>
                  <option value="07">Nota de Crédito</option>
                  <option value="08">Nota de Débito</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Estado SUNAT</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="signed">Firmado (Local)</option>
                  <option value="accepted">Aceptado</option>
                  <option value="rejected">Rechazado</option>
                  <option value="voided">De Baja</option>
                </select>
              </div>

              {/* Serie Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Serie</label>
                <input
                  type="text"
                  value={filters.serie}
                  onChange={(e) => handleFilterChange('serie', e.target.value.toUpperCase())}
                  placeholder="F001 o B001"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-305 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.pendingRc}
                  onChange={(e) => handleFilterChange('pendingRc', e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                Boletas pendientes de Resumen Diario
              </label>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={documents}
            searchPlaceholder="Buscar por cliente..."
            loading={loading}
            emptyMessage="No se encontraron comprobantes con los filtros seleccionados."
            serverSide={true}
            totalItems={meta.total}
            totalPages={meta.totalPages}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            searchValue={filters.search}
            onSearchChange={(q) => handleFilterChange('search', q)}
          />
        </div>
      </div>

      {/* Flyout detailed Drawer Panel */}
      {selectedDocId && (
        <div className="w-full md:w-[750px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen shrink-0 relative z-30 shadow-2xl select-none">
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
                      {/* Compact Status and download header bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800/80 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">{selectedDoc.serie}-{selectedDoc.correlativo}</span>
                    <StatusBadge status={selectedDoc.status} />
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <a
                      href={BillingApiClient.getXmlUrl(selectedDoc.id)}
                      download
                      className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5 text-blue-500" /> XML UBL
                    </a>
                    {selectedDoc.status === 'accepted' ? (
                      <a
                        href={BillingApiClient.getCdrUrl(selectedDoc.id)}
                        download
                        className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500" /> CDR SUNAT
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-650 cursor-not-allowed">
                        <Download className="w-3.5 h-3.5" /> CDR (N/A)
                      </span>
                    )}
                  </div>
                </div>

                {/* Specific actions based on status - compact inline row */}
                {selectedDoc.status === 'accepted' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNoteDialog(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-350 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-blue-500" /> Emitir Nota de Crédito
                    </button>
                  </div>
                )}

                {selectedDoc.status === 'signed' && selectedDoc.docType === '03' && (
                  <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>Boleta firmada localmente. Pendiente de comunicación SUNAT (Resumen Diario RC).</span>
                  </div>
                )}

                {/* PDF receipt print format wrapper */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-100 dark:bg-zinc-900/40 print-invoice-container">
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

      {/* Cancel Boleta Modal */}
      {cancelModal && docToCancel && (
        <CancelBoletaModal
          doc={docToCancel}
          onCancel={handleCancelBoleta}
          onClose={() => {
            setCancelModal(false);
            setDocToCancel(null);
          }}
        />
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
