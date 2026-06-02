'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BillingApiClient } from '@/services/api-client';
import { useAppStore } from '@/store/app';
import { DOC_TYPE_LABELS } from '@/types/enums';
import {
  Layers,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Eye,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Clock,
  Loader2,
  Info,
  TriangleAlert,
  ShieldCheck,
} from 'lucide-react';
import { todayPE, formatIssueDatePE, nowPE } from '@/utils/date-pe';
import { CustomSelect } from '@/components/shared/CustomSelect';

// ─── NOTE: GET /daily-summaries (list) is in Backlog per API-REFERENCE.md ────
// We persist submitted RCs in localStorage and refresh each one individually
// via GET /daily-summaries/:id when the user polls for status.

const STORAGE_KEY = 'izinvoce_rc_history';

interface RcRecord {
  id: string;
  summaryCode: string;
  referenceDate: string;
  issueDate: string;
  status: any;
  ticket: string | null;
  documentCount?: number;
  createdAt: string;
  summaryType?: string;
}

function loadHistory(): RcRecord[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveHistory(records: RcRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function upsertRecord(records: RcRecord[], next: RcRecord): RcRecord[] {
  const idx = records.findIndex(r => r.id === next.id);
  if (idx >= 0) { const u = [...records]; u[idx] = next; return u; }
  return [next, ...records];
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'configure' | 'preview' | 'submitting' | 'result';

interface PreviewDoc {
  id: string;
  docType: string;
  serie: string;
  correlativo: number;
  issueDate: string | null;
  total: string | number;
  status: any;
  cliente?: { razonSocial?: string; numDoc?: string; tipoDoc?: string };
  billingReference?: {
    id?: string;
    documentTypeCode?: string;
    serie?: string;
    correlativo?: number;
  };
  payload?: {
    cliente?: { razonSocial?: string; numDoc?: string; tipoDoc?: string };
    documentoAfectado?: {
      docType: string;
      serie: string;
      correlativo: number;
    };
    billingReference?: {
      id?: string;
      documentTypeCode?: string;
      serie?: string;
      correlativo?: number;
    };
  };
}

interface PreviewResponse {
  documentCount: number;
  referenceDate: string;
  issueDate: string;
  documents: {
    data: PreviewDoc[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => todayPE();

const formatDate = (str: string | null | undefined) => formatIssueDatePE(str);

const formatCurrency = (val: string | number | null | undefined) => {
  const n = parseFloat(String(val ?? '0'));
  return isNaN(n) ? '—' : `S/ ${n.toFixed(2)}`;
};

const getDocTypeColor = (docType: string) => {
  switch (docType) {
    case '03': return 'bg-violet-100 text-violet-700';
    case '07': return 'bg-amber-100 text-amber-700';
    case '08': return 'bg-rose-100 text-rose-700';
    default:   return 'bg-zinc-100 text-zinc-600';
  }
};

const getSummaryTypeBadge = (type: string) => {
  switch (type) {
    case 'RC':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Altas (RC)
        </span>
      );
    case 'RC_VOID':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Anulación Boletas (RC Void)
        </span>
      );
    case 'RA':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Baja Facturas (RA)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-50 text-zinc-600 border border-zinc-200">
          {type}
        </span>
      );
  }
};

// ─── Step breadcrumb ──────────────────────────────────────────────────────────

function StepBreadcrumb({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'configure', label: '1. Configurar' },
    { key: 'preview',   label: '2. Vista Previa' },
    { key: 'result',    label: '3. Resultado' },
  ];
  const activeIdx = steps.findIndex(
    s => s.key === step || (step === 'submitting' && s.key === 'preview')
  );

  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold select-none">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <span className={`px-3 py-1 rounded-full transition-all ${
            i <= activeIdx ? 'bg-[#4f46e5] text-white' : 'bg-zinc-100 text-zinc-400'
          }`}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="w-3 h-3 text-zinc-300 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DailySummariesPage() {
  const { addNotification } = useAppStore();

  // Summaries API state
  const [summaries, setSummaries] = useState<RcRecord[]>([]);
  const [summariesMeta, setSummariesMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [checkingIds, setCheckingIds] = useState<Record<string, boolean>>({});

  // Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);

  // Filters state
  const [filterReferenceDate, setFilterReferenceDate] = useState('');
  const [filterIssueDate, setFilterIssueDate] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterSummaryType, setFilterSummaryType] = useState(''); // '' (Todos), 'RC', 'RA'
  const [filterStatus, setFilterStatus] = useState(''); // '' (Todos), 'draft', 'processing', 'accepted', 'rejected', 'failed', 'cancelled'
  const [summariesPage, setSummariesPage] = useState(1);

  // Wizard state
  const [step, setStep] = useState<Step | null>(null);
  const [referenceDate, setReferenceDate] = useState(todayStr());
  const [issueDate, setIssueDate] = useState(todayStr());

  // Preview
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_LIMIT = 20;

  // Submit result
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // RC Void / Bajas state
  const [summaryMode, setSummaryMode] = useState<'altas' | 'bajas'>('altas');
  const [acceptedBoletas, setAcceptedBoletas] = useState<any[]>([]);
  const [acceptedBoletasLoading, setAcceptedBoletasLoading] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const loadAcceptedBoletas = useCallback(async (refDate: string) => {
    if (!refDate) return;
    setAcceptedBoletasLoading(true);
    try {
      const docs = await BillingApiClient.listDocuments({
        status: 'accepted',
        issueDate: refDate,
        docType: '03,07,08',
      });
      const docsList = Array.isArray(docs) ? docs : (docs?.data ?? []);
      const filtered = docsList.filter((doc: any) => {
        const dailySummaryId = doc.dailySummaryId || doc.daily_summary_id;
        const isAlreadyVoided = doc.payload?._rcVoid;
        return dailySummaryId && !isAlreadyVoided;
      });
      setAcceptedBoletas(filtered);
      setSelectedDocIds([]);
    } catch (err) {
      console.error('Error fetching accepted documents', err);
    } finally {
      setAcceptedBoletasLoading(false);
    }
  }, []);

  useEffect(() => {
    if (summaryMode === 'bajas') {
      loadAcceptedBoletas(referenceDate);
    }
  }, [summaryMode, referenceDate, loadAcceptedBoletas]);

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllDocs = () => {
    if (selectedDocIds.length === acceptedBoletas.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(acceptedBoletas.map(b => b.id));
    }
  };

  const fetchSummariesList = useCallback(async () => {
    setSummariesLoading(true);
    try {
      const res = await BillingApiClient.listDailySummaries({
        referenceDate: filterReferenceDate || undefined,
        issueDate: filterIssueDate || undefined,
        from: filterFromDate || undefined,
        to: filterToDate || undefined,
        summaryType: filterSummaryType || undefined,
        status: filterStatus || undefined,
        page: summariesPage,
        limit: 10,
      });

      const mapped: RcRecord[] = res.data.map((item: any) => ({
        id: item.id,
        summaryCode: item.summaryCode,
        referenceDate: item.referenceDate,
        issueDate: item.issueDate,
        status: item.status,
        ticket: item.ticket,
        documentCount: item.documentCount,
        createdAt: item.createdAt,
        summaryType: item.summaryType,
      }));

      setSummaries(mapped);
      setSummariesMeta(res.meta);
    } catch (err: any) {
      addNotification({
        id: Math.random().toString(),
        title: 'Error al cargar historial',
        message: err?.message || 'No se pudo obtener el historial de resúmenes.',
        type: 'error',
        created_at: nowPE(),
      });
    } finally {
      setSummariesLoading(false);
    }
  }, [
    filterReferenceDate,
    filterIssueDate,
    filterFromDate,
    filterToDate,
    filterSummaryType,
    filterStatus,
    summariesPage,
    addNotification,
  ]);

  useEffect(() => {
    fetchSummariesList();
  }, [fetchSummariesList]);

  const handleClearFilters = () => {
    setFilterReferenceDate('');
    setFilterIssueDate('');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterSummaryType('');
    setFilterStatus('');
    setSummariesPage(1);
  };

  const handleOpenDetail = async (summaryId: string) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const data = await BillingApiClient.getDailySummary(summaryId);
      setDetailData(data);
    } catch (err: any) {
      addNotification({
        id: Math.random().toString(),
        title: 'Error al cargar detalles',
        message: err?.message || 'No se pudo obtener el detalle del resumen.',
        type: 'error',
        created_at: nowPE(),
      });
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Open wizard ──
  const openWizard = () => {
    setReferenceDate(todayStr());
    setIssueDate(todayStr());
    setPreviewData(null);
    setPreviewError(null);
    setSubmitResult(null);
    setSubmitError(null);
    setPreviewPage(1);
    setSummaryMode('altas');
    setAcceptedBoletas([]);
    setSelectedDocIds([]);
    setStep('configure');
  };

  const closeWizard = () => {
    setStep(null);
  };

  // ── Step 1 → 2: Preview ──
  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    setPreviewPage(1);
    try {
      let res;
      if (summaryMode === 'bajas') {
        res = await BillingApiClient.previewDailySummaryVoid({
          documentIds: selectedDocIds,
          referenceDate,
          issueDate,
          page: 1,
          limit: PREVIEW_LIMIT,
        });
      } else {
        res = await BillingApiClient.previewDailySummary({
          referenceDate,
          issueDate,
          page: 1,
          limit: PREVIEW_LIMIT,
        });
      }
      setPreviewData(res);
      setStep('preview');
    } catch (err: any) {
      const msg = err?.message?.message || err?.message || 'Error al cargar la vista previa.';
      setPreviewError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Preview pagination ──
  const handlePreviewPage = async (newPage: number) => {
    setPreviewLoading(true);
    try {
      let res;
      if (summaryMode === 'bajas') {
        res = await BillingApiClient.previewDailySummaryVoid({
          documentIds: selectedDocIds,
          referenceDate,
          issueDate,
          page: newPage,
          limit: PREVIEW_LIMIT,
        });
      } else {
        res = await BillingApiClient.previewDailySummary({
          referenceDate,
          issueDate,
          page: newPage,
          limit: PREVIEW_LIMIT,
        });
      }
      setPreviewData(res);
      setPreviewPage(newPage);
    } catch { /* keep current */ }
    finally { setPreviewLoading(false); }
  };

  // ── Step 2 → 3: Submit RC ──
  const handleSubmit = async () => {
    setStep('submitting');
    setSubmitError(null);
    setSubmitResult(null);
    try {
      let res;
      if (summaryMode === 'bajas') {
        res = await BillingApiClient.voidDailySummary({
          documentIds: selectedDocIds,
          referenceDate: referenceDate as any,
          issueDate: issueDate as any,
        });
      } else {
        res = await BillingApiClient.closeDailySummary({
          referenceDate: referenceDate as any,
          issueDate: issueDate as any,
        });
      }
      setSubmitResult(res);
      setStep('result');

      // Persist to localStorage (GET /daily-summaries list is Backlog)
      const record: RcRecord = {
        id: res.id,
        summaryCode: res.summaryCode ?? `RC-${referenceDate.replace(/-/g, '')}-?`,
        referenceDate: res.referenceDate ?? referenceDate,
        issueDate: res.issueDate ?? issueDate,
        status: res.status,
        ticket: res.ticket ?? null,
        documentCount: res.sunat?.documentCount ?? selectedDocIds.length,
        createdAt: nowPE(),
        summaryType: summaryMode === 'bajas' ? 'RC_VOID' : 'RC',
      };
      const updated = upsertRecord(loadHistory(), record);
      saveHistory(updated);
      
      // Refresh API list
      fetchSummariesList();

      addNotification({
        id: Math.random().toString(),
        title: summaryMode === 'bajas' ? 'Baja de Boleta Enviada' : 'RC Enviado',
        message: `Resumen ${res.summaryCode} enviado. Ticket: ${res.ticket ?? 'pendiente'}.`,
        type: 'success',
        created_at: nowPE(),
      });
    } catch (err: any) {
      const errObj = err?.message ?? err;
      // If error includes a dailySummaryId, persist so user can poll later
      if (typeof errObj === 'object' && errObj?.dailySummaryId) {
        const record: RcRecord = {
          id: errObj.dailySummaryId,
          summaryCode: `RC-${referenceDate.replace(/-/g, '')}-?`,
          referenceDate,
          issueDate,
          status: errObj.status ?? 'failed',
          ticket: errObj.ticket ?? null,
          createdAt: nowPE(),
          summaryType: summaryMode === 'bajas' ? 'RC_VOID' : 'RC',
        };
        const updated = upsertRecord(loadHistory(), record);
        saveHistory(updated);
        
        // Refresh API list
        fetchSummariesList();
      }
      const hint = typeof errObj === 'object'
        ? (errObj?.hint || errObj?.message || JSON.stringify(errObj))
        : String(errObj);
      setSubmitError(hint);
      setStep('result');
    }
  };

  // ── Poll ticket — POST /daily-summaries/:id/status ──
  const handleCheckStatus = async (summaryId: string, summaryCode: string) => {
    setCheckingIds(p => ({ ...p, [summaryId]: true }));
    try {
      const res = await BillingApiClient.pollDailySummaryStatus(summaryId);

      // Update persisted record
      const current = loadHistory();
      const existing = current.find(r => r.id === summaryId);
      if (existing) {
        const updated = upsertRecord(current, {
          ...existing,
          status: res.status,
          ticket: res.ticket ?? existing.ticket,
          documentCount: (res as any).sunat?.documentCount ?? existing.documentCount,
          summaryType: res.summaryType ?? existing.summaryType,
        });
        saveHistory(updated);
      }

      // Refresh API list
      fetchSummariesList();

      if (res.status === 'accepted') {
        addNotification({
          id: Math.random().toString(),
          title: 'RC Aceptado ✓',
          message: `SUNAT aprobó el resumen ${summaryCode}.`,
          type: 'success',
          created_at: nowPE(),
        });
      } else if (res.status === 'processing') {
        addNotification({
          id: Math.random().toString(),
          title: 'En procesamiento',
          message: 'SUNAT aún procesa el ticket. Reintente en unos momentos.',
          type: 'info',
          created_at: nowPE(),
        });
      }
    } catch (err: any) {
      addNotification({
        id: Math.random().toString(),
        title: 'Error consultando ticket',
        message: err?.message || 'No se pudo consultar el estado.',
        type: 'error',
        created_at: nowPE(),
      });
    } finally {
      setCheckingIds(p => ({ ...p, [summaryId]: false }));
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader
        title="Resúmenes Diarios SUNAT (RC)"
        subtitle="Gestión de envíos de Boletas y Notas de Venta a SUNAT mediante Resumen Diario"
      />

      <div className="p-5 lg:p-6 space-y-5 max-w-7xl w-full mx-auto pb-12">

        {/* Info banner */}
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-4 items-start">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-indigo-900 tracking-tight">Flujo de Boletas (RC)</h4>
            <p className="text-indigo-600 leading-relaxed">
              Las <b>Boletas de Venta</b>, <b>Notas de Crédito</b> y <b>Notas de Débito</b> que afectan boletas quedan en estado{' '}
              <code className="bg-indigo-100 px-1 rounded font-mono">signed</code> tras emitirse. Deben enviarse a SUNAT agrupadas en un{' '}
              <b>Resumen Diario (RC)</b> antes del fin del día. El sistema devuelve un <b>ticket</b> que se puede consultar para obtener el CDR.
            </p>
          </div>
        </div>

        {/* Header + new RC button */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Historial de Resúmenes</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Historial y filtros de resúmenes del sistema</p>
          </div>
          <button
            onClick={openWizard}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-500/20 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            Nuevo Resumen Diario (RC)
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              Filtros de búsqueda
            </h3>
            {(filterReferenceDate || filterIssueDate || filterFromDate || filterToDate || filterSummaryType || filterStatus) && (
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Limpiar Filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* F. Referencia */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">F. Referencia</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterReferenceDate}
                  onChange={(e) => {
                    setFilterReferenceDate(e.target.value);
                    setSummariesPage(1);
                  }}
                  className="w-full text-xs border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-1.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* F. Envío */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">F. Envío Exacta</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterIssueDate}
                  disabled={!!(filterFromDate || filterToDate)}
                  onChange={(e) => {
                    setFilterIssueDate(e.target.value);
                    setSummariesPage(1);
                  }}
                  className="w-full text-xs border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-1.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Desde */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Desde (Envío)</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterFromDate}
                  disabled={!!filterIssueDate}
                  onChange={(e) => {
                    setFilterFromDate(e.target.value);
                    setSummariesPage(1);
                  }}
                  className="w-full text-xs border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-1.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Hasta */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hasta (Envío)</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterToDate}
                  disabled={!!filterIssueDate}
                  onChange={(e) => {
                    setFilterToDate(e.target.value);
                    setSummariesPage(1);
                  }}
                  className="w-full text-xs border border-zinc-200 hover:border-zinc-300 rounded-xl px-3 py-1.5 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tipo Resumen</label>
              <CustomSelect
                value={filterSummaryType}
                onChange={(val) => {
                  setFilterSummaryType(val);
                  setSummariesPage(1);
                }}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'RC', label: 'Altas (RC)' },
                  { value: 'RC_VOID', label: 'Anulación Boletas (RC Void)' },
                  { value: 'RA', label: 'Baja Facturas (RA)' },
                ]}
              />
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Estado SUNAT</label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val);
                  setSummariesPage(1);
                }}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'draft', label: 'Borrador' },
                  { value: 'processing', label: 'En Proceso' },
                  { value: 'accepted', label: 'Aceptado' },
                  { value: 'rejected', label: 'Rechazado' },
                  { value: 'failed', label: 'Fallido' },
                  { value: 'cancelled', label: 'Cancelado' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          {summaries.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-600">Sin resúmenes aún</p>
              <p className="text-xs text-zinc-400">Crea el primer resumen diario con el botón superior.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">
                    <th className="px-5 py-3.5">Código</th>
                    <th className="px-5 py-3.5">Tipo</th>
                    <th className="px-5 py-3.5">F.Referencia</th>
                    <th className="px-5 py-3.5">F.Envío</th>
                    <th className="px-5 py-3.5">Ticket SUNAT</th>
                    <th className="px-5 py-3.5 text-center">Docs</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {summaries.map((sum) => {
                    const isChecking = checkingIds[sum.id];
                    const canPoll = ['processing', 'submitted', 'draft', 'failed'].includes(sum.status) && !!sum.ticket;

                    return (
                      <tr key={sum.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                            {sum.summaryCode}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {getSummaryTypeBadge(sum.summaryType ?? 'RC')}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-zinc-700">{formatDate(sum.referenceDate)}</td>
                        <td className="px-5 py-3.5 text-zinc-500">{formatDate(sum.issueDate)}</td>
                        <td className="px-5 py-3.5">
                          {sum.ticket
                            ? <span className="font-mono text-indigo-600 text-[10px] bg-indigo-50 px-2 py-0.5 rounded">{sum.ticket}</span>
                            : <span className="text-zinc-400 text-[10px]">Sin ticket</span>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-mono font-bold text-zinc-800">{sum.documentCount ?? '—'}</span>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={sum.status} /></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetail(sum.id)}
                              className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-[11px] font-semibold text-zinc-650 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-zinc-500" />
                              Ver Detalle
                            </button>
                            {canPoll ? (
                              <button
                                onClick={() => handleCheckStatus(sum.id, sum.summaryCode)}
                                disabled={isChecking}
                                className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg border border-indigo-200 hover:bg-indigo-50 text-[11px] font-semibold text-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                                Consultar
                              </button>
                            ) : sum.status === 'accepted' ? (
                              <span className="text-emerald-600 inline-flex items-center gap-1 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aceptado
                              </span>
                            ) : (
                              <span className="text-zinc-400 inline-flex items-center gap-1 text-[11px]">
                                <AlertCircle className="w-3 h-3" /> —
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {summariesMeta.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 select-none">
              <span className="text-[11px] text-zinc-500 font-medium">
                Página {summariesPage} de {summariesMeta.totalPages} ({summariesMeta.total} resúmenes en total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSummariesPage(p => Math.max(p - 1, 1))}
                  disabled={summariesPage <= 1 || summariesLoading}
                  className="px-3 py-1.5 text-[11px] font-semibold border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 cursor-pointer text-zinc-600 transition-all select-none"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setSummariesPage(p => Math.min(p + 1, summariesMeta.totalPages))}
                  disabled={summariesPage >= summariesMeta.totalPages || summariesLoading}
                  className="px-3 py-1.5 text-[11px] font-semibold border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 cursor-pointer text-zinc-600 transition-all select-none"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Wizard Modal ──────────────────────────────────────────────────── */}
      {step !== null && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className={`relative bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full my-8 transition-all ${
            step === 'preview' || step === 'submitting'
              ? 'max-w-5xl'
              : 'max-w-3xl'
          }`}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {summaryMode === 'bajas' ? 'Nuevo Resumen de Anulación (RC Void)' : 'Nuevo Resumen Diario (RC)'}
                  </h3>
                </div>
                <StepBreadcrumb step={step} />
              </div>
              <button
                onClick={closeWizard}
                disabled={step === 'submitting'}
                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── STEP 1: Configure ── */}
            {step === 'configure' && (
              <form onSubmit={handlePreview} className="p-6 space-y-5">
                {/* Selector de Tipo de Resumen */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                    Tipo de Resumen a Generar
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-150 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setSummaryMode('altas')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        summaryMode === 'altas'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/55'
                          : 'text-zinc-400 hover:text-zinc-500'
                      }`}
                    >
                      Altas (Enviar Boletas/Notas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSummaryMode('bajas')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        summaryMode === 'bajas'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700/55'
                          : 'text-zinc-400 hover:text-zinc-500'
                      }`}
                    >
                      Bajas (Anular Boletas Aceptadas)
                    </button>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex gap-3 text-xs">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-indigo-700 leading-relaxed">
                    {summaryMode === 'altas'
                      ? 'Solo se incluirán Boletas, Notas de Crédito y Notas de Débito en estado signed cuya fecha de emisión coincida con la Fecha de Referencia.'
                      : 'Permite reportar la anulación (baja) de boletas en estado Aceptado que no hayan sido entregadas al cliente comercialmente.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1.5 tracking-wider">
                      Fecha de Referencia <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                      <input
                        type="date"
                        value={referenceDate}
                        onChange={e => setReferenceDate(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      />
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-1.5 leading-snug">
                      Fecha de emisión de los documentos a agrupar en el RC.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1.5 tracking-wider">
                      Fecha de Envío
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                      <input
                        type="date"
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      />
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-1.5 leading-snug">
                      Fecha en que se envía el RC a SUNAT. Por defecto: hoy.
                    </p>
                  </div>
                </div>

                {/* Checklist of accepted documents when mode is Bajas */}
                {summaryMode === 'bajas' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                        Seleccione Comprobantes a Anular <span className="text-rose-400">*</span>
                      </label>
                      {acceptedBoletas.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllDocs}
                          className="text-[10px] text-indigo-600 font-semibold hover:underline"
                        >
                          {selectedDocIds.length === acceptedBoletas.length
                            ? 'Deseleccionar Todos'
                            : 'Seleccionar Todos'}
                        </button>
                      )}
                    </div>

                    {acceptedBoletasLoading ? (
                      <div className="flex items-center justify-center gap-2 p-6 border border-dashed border-zinc-200 rounded-xl text-xs text-zinc-400 bg-zinc-50/50">
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        <span>Buscando comprobantes aceptados...</span>
                      </div>
                    ) : acceptedBoletas.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-2 text-xs text-amber-700">
                        <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>No se encontraron boletas, notas de crédito o notas de débito en estado &quot;Aceptado&quot; para la Fecha de Referencia seleccionada.</span>
                      </div>
                    ) : (
                      <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-[9px] text-zinc-400 uppercase font-semibold">
                              <th className="px-3 py-2 w-10 text-center">Seleccionar</th>
                              <th className="px-3 py-2">Tipo</th>
                              <th className="px-3 py-2">Comprobante</th>
                              <th className="px-3 py-2">Cliente</th>
                              <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {acceptedBoletas.map(doc => (
                              <tr key={doc.id} className="hover:bg-zinc-50/50">
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedDocIds.includes(doc.id)}
                                    onChange={() => handleToggleDoc(doc.id)}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-3.5 h-3.5"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getDocTypeColor(doc.docType || doc.doc_type)}`}>
                                    {DOC_TYPE_LABELS[(doc.docType || doc.doc_type) as keyof typeof DOC_TYPE_LABELS] ?? (doc.docType || doc.doc_type)}
                                  </span>
                                </td>
                                <td className="px-3 py-2 font-mono font-bold text-zinc-900">
                                  {doc.serie}-{String(doc.correlativo || doc.correlativo_numero || '').padStart(8, '0')}
                                </td>
                                <td className="px-3 py-2 text-zinc-500 max-w-[150px] truncate">
                                  {doc.payload?.cliente?.razonSocial || doc.cliente?.razonSocial || 'VARIOS'}
                                </td>
                                <td className="px-3 py-2 text-right font-mono font-semibold text-zinc-800">
                                  {formatCurrency(doc.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {previewError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {previewError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                  <button type="button" onClick={closeWizard}
                    className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-50 cursor-pointer transition-colors">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={previewLoading || !referenceDate || (summaryMode === 'bajas' && selectedDocIds.length === 0)}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {previewLoading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando vista previa...</>
                      : <><Eye className="w-3.5 h-3.5" /> Ver Documentos a Incluir</>
                    }
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: Preview ── */}
            {(step === 'preview' || step === 'submitting') && previewData && (
              <div className="p-6 space-y-5">
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{previewData.documentCount}</p>
                    <p className="text-[10px] font-semibold text-indigo-500 mt-0.5 uppercase tracking-wider">Comprobantes</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-zinc-800 font-mono">{previewData.referenceDate}</p>
                    <p className="text-[10px] font-semibold text-zinc-400 mt-0.5 uppercase tracking-wider">F.Referencia</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-zinc-800 font-mono">{previewData.issueDate}</p>
                    <p className="text-[10px] font-semibold text-zinc-400 mt-0.5 uppercase tracking-wider">F.Envío RC</p>
                  </div>
                </div>

                {previewData.documentCount === 0 ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center space-y-2">
                    <TriangleAlert className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-sm font-semibold text-amber-700">No hay documentos para incluir</p>
                    <p className="text-xs text-amber-600">
                      No se encontraron Boletas, Notas de Crédito o Notas de Débito en estado <b>signed</b> para la fecha <b>{referenceDate}</b>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                          Documentos a incluir en el RC
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {previewData.documents.meta.total} total · Pág. {previewPage}/{previewData.documents.meta.totalPages}
                        </span>
                      </div>

                      <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-[9px] uppercase tracking-wider font-semibold text-zinc-400">
                              <th className="px-4 py-2.5">Tipo</th>
                              <th className="px-4 py-2.5">Comprobante</th>
                              <th className="px-4 py-2.5">Cliente</th>
                              <th className="px-4 py-2.5 text-right">Total</th>
                              <th className="px-4 py-2.5">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {previewData.documents.data.map((doc) => {
                              const cliente = doc.cliente ?? doc.payload?.cliente;
                              return (
                                <tr key={doc.id} className="hover:bg-zinc-50/50">
                                  <td className="px-4 py-2.5">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getDocTypeColor(doc.docType)}`}>
                                      {DOC_TYPE_LABELS[doc.docType as keyof typeof DOC_TYPE_LABELS] ?? doc.docType}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className="font-mono font-bold text-zinc-900">
                                      {doc.serie}-{String(doc.correlativo).padStart(8, '0')}
                                    </span>
                                    <p className="text-[9px] text-zinc-400 mt-0.5">{doc.issueDate ?? '—'}</p>
                                    {(() => {
                                      if (doc.docType !== '07') return null;

                                      // 1. Try payload.documentoAfectado
                                      const affected = doc.payload?.documentoAfectado;
                                      if (affected && affected.serie) {
                                        return (
                                          <p className="text-[9px] text-amber-700 font-semibold mt-1 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded inline-block">
                                            Afecta: {affected.serie}-{String(affected.correlativo).padStart(8, '0')}
                                          </p>
                                        );
                                      }

                                      // 2. Try billingReference (both in payload or at root level)
                                      const billingRef = doc.payload?.billingReference || doc.billingReference;
                                      if (billingRef) {
                                        if (billingRef.serie && billingRef.correlativo) {
                                          return (
                                            <p className="text-[9px] text-amber-700 font-semibold mt-1 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded inline-block">
                                              Afecta: {billingRef.serie}-{String(billingRef.correlativo).padStart(8, '0')}
                                            </p>
                                          );
                                        }
                                        if (billingRef.id) {
                                          const parts = billingRef.id.split('-');
                                          if (parts.length === 2) {
                                            const serie = parts[0];
                                            const corr = parts[1];
                                            if (!isNaN(parseInt(corr))) {
                                              return (
                                                <p className="text-[9px] text-amber-700 font-semibold mt-1 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded inline-block">
                                                  Afecta: {serie}-{corr.padStart(8, '0')}
                                                </p>
                                              );
                                            }
                                          }
                                          return (
                                            <p className="text-[9px] text-amber-700 font-semibold mt-1 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded inline-block">
                                              Afecta: {billingRef.id}
                                            </p>
                                          );
                                        }
                                      }

                                      return null;
                                    })()}
                                  </td>
                                  <td className="px-4 py-2.5 max-w-[160px]">
                                    <p className="font-medium text-zinc-800 truncate">{cliente?.razonSocial ?? '—'}</p>
                                    <p className="text-[9px] text-zinc-400 font-mono">{cliente?.numDoc ?? ''}</p>
                                  </td>
                                  <td className="px-4 py-2.5 text-right">
                                    <span className="font-mono font-bold text-zinc-900">{formatCurrency(doc.total)}</span>
                                  </td>
                                  <td className="px-4 py-2.5"><StatusBadge status={doc.status} /></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {previewData.documents.meta.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-3">
                          <button onClick={() => handlePreviewPage(previewPage - 1)}
                            disabled={previewPage <= 1 || previewLoading}
                            className="px-3 py-1.5 text-[11px] border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 cursor-pointer">
                            ← Anterior
                          </button>
                          <button onClick={() => handlePreviewPage(previewPage + 1)}
                            disabled={previewPage >= previewData.documents.meta.totalPages || previewLoading}
                            className="px-3 py-1.5 text-[11px] border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 cursor-pointer">
                            Siguiente →
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-xs">
                      <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-indigo-700 leading-relaxed">
                        {summaryMode === 'bajas'
                          ? `Al confirmar se enviará el resumen de bajas (RC Void) a SUNAT para anular los ${previewData.documentCount} comprobante(s) listados. SUNAT responderá con un ticket que podrás consultar desde el historial.`
                          : `Al confirmar se enviará el RC a SUNAT con los ${previewData.documentCount} comprobante(s) listados. SUNAT responderá con un ticket que podrás consultar desde el historial.`
                        }
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                  <button onClick={() => setStep('configure')} disabled={step === 'submitting'}
                    className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-50 cursor-pointer transition-colors disabled:opacity-40">
                    <ArrowLeft className="w-3.5 h-3.5" /> Cambiar Fecha
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={step === 'submitting' || previewData.documentCount === 0}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    {step === 'submitting'
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando a SUNAT...</>
                      : <><Send className="w-3.5 h-3.5" /> {summaryMode === 'bajas' ? 'Confirmar y Anular Boletas' : 'Confirmar y Enviar RC'}</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Result ── */}
            {step === 'result' && (
              <div className="p-6 space-y-5">
                {submitResult && !submitError ? (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900">RC Enviado a SUNAT</h4>
                      <p className="text-xs text-zinc-500 mt-1">El resumen diario fue enviado correctamente.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                        <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Código RC</p>
                        <p className="font-mono font-bold text-zinc-900">{submitResult.summaryCode ?? '—'}</p>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                        <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Estado</p>
                        <StatusBadge status={submitResult.status} />
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 col-span-2">
                        <p className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider mb-1">Ticket SUNAT</p>
                        <p className="font-mono font-bold text-indigo-700 text-sm">
                          {submitResult.ticket ?? `Pendiente (${submitResult.status})`}
                        </p>
                      </div>
                      {submitResult.sunat?.documentCount !== undefined && (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 col-span-2">
                          <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mb-1">Documentos incluidos</p>
                          <p className="font-bold text-zinc-900">{submitResult.sunat.documentCount}</p>
                        </div>
                      )}
                    </div>
                    {submitResult.status === 'processing' && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 text-xs text-amber-700">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>SUNAT sigue procesando. Usa <b>Consultar ticket</b> en el historial para verificar el CDR.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900">Error al enviar RC</h4>
                      <p className="text-xs text-zinc-500 mt-1">El resumen no pudo ser enviado a SUNAT.</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-left">
                      <p className="text-xs text-rose-700 leading-relaxed">{submitError}</p>
                    </div>
                     <p className="text-xs text-zinc-500">
                      Si SUNAT no devolvió ticket (estado <code className="bg-zinc-100 px-1 rounded">cancelled</code>), puedes
                      reintentar. Si hay ticket y el estado es <code className="bg-zinc-100 px-1 rounded">failed</code>, usa
                      {' '}<b>&quot;Consultar ticket&quot;</b> desde el historial.
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100">
                  <button onClick={closeWizard}
                    className="px-5 py-2 bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Detail Modal ────────────────────────────────────────────────── */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-5xl my-8 transition-all overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Detalle de Resumen
                  </h3>
                  {detailData && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-zinc-900 text-xs bg-zinc-100 px-2 py-0.5 rounded">
                        {detailData.summaryCode}
                      </span>
                      {getSummaryTypeBadge(detailData.summaryType)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs font-semibold text-zinc-500">Cargando detalles del resumen...</p>
                </div>
              ) : detailData ? (
                <>
                  {/* Grid Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">F. Referencia</span>
                      <span className="font-semibold text-zinc-800 text-xs font-mono">{formatDate(detailData.referenceDate)}</span>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">F. Envío</span>
                      <span className="font-semibold text-zinc-800 text-xs font-mono">{formatDate(detailData.issueDate)}</span>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5 col-span-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Estado SUNAT</span>
                      <StatusBadge status={detailData.status} />
                    </div>
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Ticket SUNAT</span>
                      {detailData.ticket ? (
                        <span className="font-mono text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{detailData.ticket}</span>
                      ) : (
                        <span className="text-zinc-400 text-xs">Sin ticket</span>
                      )}
                    </div>
                  </div>

                  {/* Error Message if failed */}
                  {detailData.errorMessage && (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold mb-1">Error de SUNAT</h5>
                        <p className="leading-relaxed">{detailData.errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Documents table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Comprobantes Incluidos ({detailData.documents?.length || 0})
                    </h4>
                    
                    {!detailData.documents || detailData.documents.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                        <p className="text-xs text-zinc-400">No hay documentos registrados para este resumen.</p>
                      </div>
                    ) : (
                      <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200 text-[9px] text-zinc-400 uppercase font-semibold">
                              <th className="px-4 py-2.5">Tipo</th>
                              <th className="px-4 py-2.5">Comprobante</th>
                              <th className="px-4 py-2.5">Cliente</th>
                              <th className="px-4 py-2.5 text-right">Total</th>
                              <th className="px-4 py-2.5 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {detailData.documents.map((doc: any) => (
                              <tr key={doc.id} className="hover:bg-zinc-50/40 transition-colors">
                                <td className="px-4 py-2.5">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getDocTypeColor(doc.docType)}`}>
                                    {DOC_TYPE_LABELS[doc.docType as keyof typeof DOC_TYPE_LABELS] ?? doc.docType}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-mono font-bold text-zinc-900">
                                  {doc.serie}-{String(doc.correlativo).padStart(8, '0')}
                                </td>
                                <td className="px-4 py-2.5 text-zinc-500 max-w-[200px] truncate">
                                  <p className="font-semibold text-zinc-800">{doc.cliente?.razonSocial || 'VARIOS'}</p>
                                  <p className="text-[9px] text-zinc-400 font-mono">
                                    {doc.cliente?.tipoDoc === '6' ? 'RUC' : 'DNI'}: {doc.cliente?.numDoc || '—'}
                                  </p>
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-zinc-800">
                                  {formatCurrency(doc.total)}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <StatusBadge status={doc.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No se pudo cargar la información.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
