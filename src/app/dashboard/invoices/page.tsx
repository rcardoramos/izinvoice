'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PdfViewer } from '@/components/shared/PdfViewer';
import { TicketViewer } from '@/components/shared/TicketViewer';
import { CancelBoletaModal } from '@/components/shared/CancelBoletaModal';
import { VoidFacturaModal } from '@/components/shared/VoidFacturaModal';
import { BillingApiClient } from '@/services/api-client';
import { DOC_TYPE_LABELS } from '@/types/enums';
import { useAuthStore } from '@/store/auth';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { formatTimePE } from '@/utils/date-pe';
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

const CATALOG_09_REASONS = [
  { value: '01', label: 'Anulación de la operación', isTotal: true },
  { value: '02', label: 'Anulación por error en el RUC', isTotal: true },
  { value: '03', label: 'Corrección por error en la descripción', isTotal: false },
  { value: '04', label: 'Descuento global', isTotal: false },
  { value: '06', label: 'Devolución total', isTotal: true },
  { value: '07', label: 'Devolución parcial', isTotal: false },
  { value: '08', label: 'Bonificación', isTotal: false },
  { value: '09', label: 'Disminución en el valor', isTotal: false },
  { value: '10', label: 'Otros conceptos', isTotal: false },
];

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
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search input to prevent rapid API requests on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchQuery) return prev;
        return { ...prev, search: searchQuery };
      });
      setPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [limit] = useState(8); // match DataTable itemsPerPage default
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
  });

  // Drawer state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [isSummarizedPdf, setIsSummarizedPdf] = useState(false);
  const [printFormat, setPrintFormat] = useState<'pdf' | 'ticket'>('pdf');
  
  // Credit Note dialog state
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteForm, setNoteForm] = useState({
    serie: '',
    motivoCodigo: '01',
    motivoDescripcion: 'ANULACIÓN DE LA OPERACIÓN',
  });
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [noteEmitting, setNoteEmitting] = useState(false);

  const handleReasonChange = (code: string) => {
    const reason = CATALOG_09_REASONS.find(r => r.value === code);
    if (!reason) return;
    
    setNoteForm(prev => ({
      ...prev,
      motivoCodigo: code,
      motivoDescripcion: reason.label.toUpperCase()
    }));
    
    if (reason.isTotal && selectedDoc) {
      setCreditAmount(parseFloat(selectedDoc.total || '0').toFixed(2));
    }
  };

  // Cancel boleta modal state
  const [cancelModal, setCancelModal] = useState(false);
  const [docToCancel, setDocToCancel] = useState<any>(null);

  // Void factura modal state
  const [voidModal, setVoidModal] = useState(false);
  const [docToVoid, setDocToVoid] = useState<any>(null);

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
    setSearchQuery('');
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
    setIsSummarizedPdf(false); // Reset visual summary on switch
    setPrintFormat('pdf'); // Reset visual format on switch
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
        setNoteForm({
          serie: prefix,
          motivoCodigo: '01',
          motivoDescripcion: 'ANULACIÓN DE LA OPERACIÓN',
        });
        setCreditAmount(parseFloat(detail.total || '0').toFixed(2));
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
    
    const isTotalReason = CATALOG_09_REASONS.find(r => r.value === noteForm.motivoCodigo)?.isTotal ?? false;
    const amountVal = isTotalReason ? parseFloat(selectedDoc.total || '0') : parseFloat(creditAmount);
    
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Por favor ingrese un importe válido mayor a 0.');
      return;
    }
    const maxVal = parseFloat(selectedDoc.total || '0');
    if (amountVal > maxVal) {
      alert('El importe a creditar no puede ser mayor al total del documento afectado.');
      return;
    }

    try {
      setNoteEmitting(true);
      
      const IGV_FACTOR = 1.18;
      // Convert amountVal (with IGV) to precioUnitario (without IGV)
      const precioUnitario = Math.round((amountVal / IGV_FACTOR) * 100) / 100;

      const payload = {
        serie: noteForm.serie,
        moneda: selectedDoc.payload?.moneda || selectedDoc.moneda || 'PEN',
        documentoAfectadoId: selectedDoc.id,
        cliente: selectedDoc.payload?.cliente || selectedDoc.cliente,
        items: [
          {
            codigo: 'AJUSTE',
            descripcion: noteForm.motivoDescripcion,
            cantidad: 1,
            precioUnitario,
          },
        ],
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
  const handleVoidFacturaClick = () => {
    if (!selectedDoc) return;
    setDocToVoid(selectedDoc);
    setVoidModal(true);
  };

  const handleVoidFactura = async (reason: string) => {
    if (!docToVoid) return;
    try {
      await BillingApiClient.voidedDocuments({
        documentIds: [docToVoid.id],
        referenceDate: (docToVoid.issueDate || docToVoid.issue_date) as any,
        issueDate: new Date().toISOString().split('T')[0] as any,
        motivoBaja: reason,
      });
      alert('Comunicación de baja (RA) enviada a SUNAT. Consulte su estado en el menú de resúmenes.');
      setVoidModal(false);
      setDocToVoid(null);
      setSelectedDocId(null);
      loadDocuments();
    } catch (err: any) {
      throw err;
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
      render: (_: any, row: any) => {
        const dateStr = row.issueDate ?? row.issue_date ?? '';
        const timeStr = row.created_at || row.createdAt
          ? formatTimePE(row.created_at || row.createdAt)
          : '';
        return (
          <div className="space-y-0.5">
            <p className="font-semibold">{dateStr}</p>
            {timeStr && <p className="text-[10px] text-zinc-400 font-mono">{timeStr}</p>}
          </div>
        );
      },
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
    }
  ];

  // Calculate client contact details for selected doc
  const cliente = selectedDoc?.cliente ?? selectedDoc?.payload?.cliente;
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
        `Estimado cliente, le adjuntamos su comprobante electrónico ${selectedDoc?.serie}-${selectedDoc?.correlativo} por un monto de S/ ${parseFloat(selectedDoc?.total || '0').toFixed(2)}. ¡Muchas gracias!`
      )}`
    : null;
  
  const mailUrl = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        `Comprobante de Pago Electrónico ${selectedDoc?.serie}-${selectedDoc?.correlativo}`
      )}&body=${encodeURIComponent(
        `Estimado cliente,\n\nLe hacemos llegar su comprobante electrónico ${selectedDoc?.serie}-${selectedDoc?.correlativo} por un monto de S/ ${parseFloat(selectedDoc?.total || '0').toFixed(2)}.\n\nAtentamente,\n${company?.businessName || ''}`
      )}`
    : null;

  // Calculate breakdown
  const totalDoc = parseFloat(selectedDoc?.total || '0');
  const isTotalReason = CATALOG_09_REASONS.find(r => r.value === noteForm.motivoCodigo)?.isTotal ?? false;
  const amountNum = parseFloat(creditAmount) || 0;
  
  const creditAmountWithIgv = isTotalReason ? totalDoc : amountNum;
  const IGV_FACTOR = 1.18;
  const totalVal = creditAmountWithIgv;
  const baseVal = Math.round((totalVal / IGV_FACTOR) * 100) / 100;
  const igvVal = Math.round((totalVal - baseVal) * 100) / 100;
  const isAmountInvalid = !isTotalReason && (isNaN(amountNum) || amountNum <= 0 || amountNum > totalDoc);

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
                <CustomSelect
                  value={filters.docType}
                  onChange={(val) => handleFilterChange('docType', val)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: '01', label: 'Factura' },
                    { value: '03', label: 'Boleta' },
                    { value: '07', label: 'Nota de Crédito' },
                    { value: '08', label: 'Nota de Débito' },
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Estado SUNAT</label>
                <CustomSelect
                  value={filters.status}
                  onChange={(val) => handleFilterChange('status', val)}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'signed', label: 'Firmado (Local)' },
                    { value: 'accepted', label: 'Aceptado' },
                    { value: 'rejected', label: 'Rechazado' },
                    { value: 'voided', label: 'De Baja' },
                  ]}
                />
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
            searchValue={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />
        </div>
      </div>

      {/* Flyout detailed Drawer Panel */}
      {selectedDocId && (
        <>
          {/* Drawer backdrop for mobile/tablet */}
          <div 
            onClick={() => setSelectedDocId(null)}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40 lg:hidden"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] lg:w-[750px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen lg:relative lg:z-30 shadow-2xl lg:shadow-none select-none">
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

                {/* Unified actions bar inside details drawer */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Acciones del Comprobante</h4>
                  <div className="flex items-center gap-1.5 w-full">
                    {/* Imprimir / PDF */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">Imprimir</span>
                    </button>

                    {/* WhatsApp */}
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-emerald-500/10 hover:border-emerald-500/30 rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-100 dark:border-zinc-900/50 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-lg text-[10px] font-bold text-zinc-400 dark:text-zinc-650 cursor-not-allowed shadow-none"
                        title="Sin teléfono registrado"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 opacity-50 shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </button>
                    )}

                    {/* Enviar Correo */}
                    {mailUrl ? (
                      <a
                        href={mailUrl}
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-blue-500/10 hover:border-blue-500/30 rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">Correo</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-100 dark:border-zinc-900/50 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-lg text-[10px] font-bold text-zinc-400 dark:text-zinc-655 cursor-not-allowed shadow-none"
                        title="Sin correo registrado"
                      >
                        <Mail className="w-3.5 h-3.5 opacity-50 shrink-0" />
                        <span className="truncate">Correo</span>
                      </button>
                    )}

                    {/* Emitir Nota de Crédito */}
                    {selectedDoc.status === 'accepted' && ['01', '03'].includes(selectedDoc.docType || selectedDoc.doc_type) && (
                      <button
                        type="button"
                        onClick={() => setShowNoteDialog(true)}
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-amber-500/10 hover:border-amber-500/30 rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Nota Crédito</span>
                      </button>
                    )}

                    {/* Anular Factura */}
                    {selectedDoc.status === 'accepted' && (selectedDoc.docType === '01' || selectedDoc.doc_type === '01') && (
                      <button
                        type="button"
                        onClick={handleVoidFacturaClick}
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-450 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">Anular</span>
                      </button>
                    )}

                    {/* Cancelar Boleta / Nota */}
                    {selectedDoc.status === 'signed' && (
                      selectedDoc.docType === '03' || selectedDoc.doc_type === '03' ||
                      selectedDoc.docType === '07' || selectedDoc.doc_type === '07' ||
                      selectedDoc.docType === '08' || selectedDoc.doc_type === '08'
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocToCancel(selectedDoc);
                          setCancelModal(true);
                        }}
                        className="flex-1 min-w-0 flex items-center justify-center gap-1 py-1.5 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-450 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>

                {selectedDoc.status === 'signed' && (
                  selectedDoc.docType === '03' || selectedDoc.doc_type === '03' ||
                  selectedDoc.docType === '07' || selectedDoc.doc_type === '07' ||
                  selectedDoc.docType === '08' || selectedDoc.doc_type === '08'
                ) && (
                  <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>
                      {(() => {
                        const type = selectedDoc.docType || selectedDoc.doc_type;
                        if (type === '07') return 'Nota de Crédito firmada localmente. Pendiente de comunicación SUNAT (Resumen Diario RC).';
                        if (type === '08') return 'Nota de Débito firmada localmente. Pendiente de comunicación SUNAT (Resumen Diario RC).';
                        return 'Boleta firmada localmente. Pendiente de comunicación SUNAT (Resumen Diario RC).';
                      })()}
                    </span>
                  </div>
                )}

                {/* Print Layout Format and Summarization Toggles */}
                <div className="flex flex-col gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  {/* Row 1: PDF vs Ticket selector */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Diseño Impresión:</span>
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setPrintFormat('pdf')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            printFormat === 'pdf'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent'
                          }`}
                        >
                          PDF (A4)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintFormat('ticket')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            printFormat === 'ticket'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent'
                          }`}
                        >
                          Ticket (80mm)
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      {printFormat === 'pdf' ? 'Formato de hoja A4 completa' : 'Formato de ticketera térmica'}
                    </div>
                  </div>

                  {/* Row 2: Detailed vs Summarized (Only for Boletas) */}
                  {(selectedDoc.docType === '03' || selectedDoc.doc_type === '03') && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Detalle Contenido:</span>
                        <button
                          type="button"
                          onClick={() => setIsSummarizedPdf(prev => !prev)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isSummarizedPdf
                              ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-sm'
                              : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {isSummarizedPdf ? 'Formato Resumido (Activo)' : 'Formato Detallado'}
                        </button>
                      </div>
                      
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {isSummarizedPdf ? 'Agrupa items bajo "DETALLADO POR SERVICIO"' : 'Muestra desglose completo'}
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF receipt print format wrapper */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-100 dark:bg-zinc-900/40 print-invoice-container">
                  {printFormat === 'pdf' ? (
                    <PdfViewer
                      document={selectedDoc}
                      companyName={company?.businessName || ''}
                      companyRuc={company?.ruc || ''}
                      companyAddress={company?.address || ''}
                      companyPhone={company?.phone || ''}
                      companyEmail={company?.email || ''}
                      isSummarized={isSummarizedPdf}
                    />
                  ) : (
                    <TicketViewer
                      document={selectedDoc}
                      companyName={company?.businessName || ''}
                      companyRuc={company?.ruc || ''}
                      companyAddress={company?.address || ''}
                      companyPhone={company?.phone || ''}
                      companyEmail={company?.email || ''}
                      isSummarized={isSummarizedPdf}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </>
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

      {/* Void Factura Modal */}
      {voidModal && docToVoid && (
        <VoidFacturaModal
          doc={docToVoid}
          onVoid={handleVoidFactura}
          onClose={() => {
            setVoidModal(false);
            setDocToVoid(null);
          }}
        />
      )}

      {/* Credit Note prompt Dialog */}
      {showNoteDialog && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-800/80 pb-2.5">
              Emitir Nota de Crédito
            </h3>
            
            {/* Info Box */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl space-y-1 text-[11px] text-zinc-650 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Documento afectado:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">{selectedDoc.serie}-{String(selectedDoc.correlativo).padStart(8, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total documento:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono">{selectedDoc.payload?.moneda || selectedDoc.moneda || 'PEN'} {parseFloat(selectedDoc.total || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between truncate">
                <span>Cliente:</span>
                <span className="font-semibold text-zinc-900 dark:text-white max-w-[280px] truncate">
                  {selectedDoc.payload?.cliente?.razonSocial || selectedDoc.cliente?.razonSocial || 'VARIOS'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 mb-1">Serie de la Nota</label>
                <CustomSelect
                  value={noteForm.serie}
                  onChange={(val) => setNoteForm({ ...noteForm, serie: val })}
                  options={selectedDoc.docType === '01' ? [
                    { value: 'FC01', label: 'FC01 (Nota de Crédito para Factura)' }
                  ] : [
                    { value: 'BC01', label: 'BC01 (Nota de Crédito para Boleta)' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 mb-1">Motivo de Emisión (SUNAT)</label>
                <CustomSelect
                  value={noteForm.motivoCodigo}
                  onChange={handleReasonChange}
                  options={CATALOG_09_REASONS}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 mb-1">Sustento / Descripción</label>
                  <input
                    type="text"
                    value={noteForm.motivoDescripcion}
                    onChange={(e) => setNoteForm({ ...noteForm, motivoDescripcion: e.target.value.toUpperCase() })}
                    required
                    placeholder="Sustento de emisión..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 mb-1">
                    Importe a Acreditar ({selectedDoc.payload?.moneda || selectedDoc.moneda || 'PEN'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={isTotalReason}
                    value={isTotalReason ? totalDoc.toFixed(2) : creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono ${
                      isTotalReason ? 'opacity-60 cursor-not-allowed border-zinc-200 dark:border-zinc-800' : 
                      isAmountInvalid ? 'border-rose-500 focus:ring-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  />
                  {isAmountInvalid && (
                    <span className="text-[10px] text-rose-500 mt-1 block">
                      Debe ser mayor a 0 y menor o igual a {totalDoc.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Live Calculations Box */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5 font-mono text-[11px] text-zinc-650 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Base Imponible (sin IGV):</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{selectedDoc.payload?.moneda || selectedDoc.moneda || 'PEN'} {baseVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%):</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{selectedDoc.payload?.moneda || selectedDoc.moneda || 'PEN'} {igvVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                  <span>Total Nota de Crédito:</span>
                  <span>{selectedDoc.payload?.moneda || selectedDoc.moneda || 'PEN'} {totalVal.toFixed(2)}</span>
                </div>
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
                  disabled={noteEmitting || !noteForm.motivoDescripcion || isAmountInvalid}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {noteEmitting ? 'Emitiendo...' : 'Emitir Nota de Crédito'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
