'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { BillingApiClient } from '@/services/api-client';
import { useAuthStore } from '@/store/auth';
import { 
  DollarSign, 
  Receipt, 
  Users, 
  Ban, 
  Activity, 
  TrendingUp, 
  CheckCircle,
  Building2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { company, user } = useAuthStore();
  const isSaaSAdmin = user?.role === 'super_admin';
  
  const [loading, setLoading] = useState(true);
  
  // Local tenant metrics
  const [metrics, setMetrics] = useState({
    dailyBilling: 0,
    monthlyBilling: 0,
    invoicesCount: 0,
    boletasCount: 0,
    customersCount: 0,
    voidedCount: 0,
    creditNotesCount: 0,
    sunatStatus: 'Conectado',
  });

  // SaaS global metrics
  const [saasMetrics, setSaasMetrics] = useState({
    totalCompanies: 0,
    activeSubscriptions: 0,
    totalDocuments: 0,
    totalRevenue: 0,
  });

  const [dailySalesData, setDailySalesData] = useState<any[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [recentCompanies, setRecentCompanies] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        if (isSaaSAdmin) {
          // Load SaaS Super Admin metrics
          const [companiesRes, auditsRes, docsRes] = await Promise.all([
            BillingApiClient.listSaasCompanies().catch(err => {
              console.warn('Failed to load SaaS companies', err);
              return [];
            }),
            BillingApiClient.listAuditLogs().catch(err => {
              console.warn('Failed to load audit logs', err);
              return [];
            }),
            BillingApiClient.listDocuments().catch(err => {
              console.warn('Failed to load documents', err);
              return [];
            }),
          ]);

          // Unwrap paginated responses
          const companies: any[] = Array.isArray(companiesRes) ? companiesRes : (companiesRes as any)?.data ?? [];
          const audits: any[] = Array.isArray(auditsRes) ? auditsRes : (auditsRes as any)?.data ?? [];
          const docs: any[] = Array.isArray(docsRes) ? docsRes : (docsRes as any)?.data ?? [];

          const totalCompanies = companies.length;
          const activeSubscriptions = companies.filter((c: any) => c.status === 'active').length;
          const totalDocuments = docs.length;
          const totalRevenue = docs
            .filter((d: any) => ['accepted', 'signed', 'submitted'].includes(d.status))
            .reduce((sum: number, d: any) => sum + parseFloat(d.total || '0'), 0);

          setSaasMetrics({
            totalCompanies,
            activeSubscriptions,
            totalDocuments,
            totalRevenue,
          });

          // Show last 5 registered companies
          const sortedCompanies = [...companies].sort(
            (a: any, b: any) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()
          );
          setRecentCompanies(sortedCompanies.slice(0, 4));
          setRecentAudits(audits.slice(0, 6));

          // Calculate Daily Sales Data (Last 7 Days)
          const days = Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date();
            d.setDate(d.getDate() - idx);
            return d.toISOString().split('T')[0];
          }).reverse();

          const formattedDaily = days.map((dateStr) => {
            const daySales = docs
              .filter((d: any) => ['accepted', 'signed', 'submitted'].includes(d.status) && (d.issueDate ?? d.issue_date) === dateStr)
              .reduce((sum: number, d: any) => sum + parseFloat(d.total || '0'), 0);
            
            const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
            return { name: label, total: daySales };
          });
          setDailySalesData(formattedDaily);

        } else {
          // Load local company metrics
          const [docsRes, customersRes, auditsRes] = await Promise.all([
            BillingApiClient.listDocuments().catch(err => {
              console.warn('Failed to load documents', err);
              return [];
            }),
            BillingApiClient.listCustomers({ limit: 1 }).catch(err => {
              console.warn('Failed to load customers', err);
              return [];
            }),
            BillingApiClient.listAuditLogs().catch(err => {
              console.warn('Failed to load audit logs', err);
              return [];
            }),
          ]);

          // Unwrap paginated responses from real API
          const docs: any[] = Array.isArray(docsRes) ? docsRes : (docsRes?.data ?? []);
          const customersTotal: number = docsRes?.meta?.total ?? (Array.isArray(customersRes) ? customersRes.length : (customersRes?.meta?.total ?? 0));
          const audits: any[] = Array.isArray(auditsRes) ? auditsRes : ((auditsRes as any)?.data ?? []);

          const todayStr = new Date().toISOString().split('T')[0];
          const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

          // Calculate basic KPIs — external API uses camelCase (issueDate, docType)
          const activeDocs = docs.filter((d: any) => ['accepted', 'signed', 'submitted'].includes(d.status));
          
          const dailyBilling = activeDocs
            .filter((d: any) => (d.issueDate ?? d.issue_date) === todayStr)
            .reduce((sum: number, d: any) => sum + parseFloat(d.total || '0'), 0);

          const monthlyBilling = activeDocs
            .filter((d: any) => (d.issueDate ?? d.issue_date ?? '').startsWith(currentMonthStr))
            .reduce((sum: number, d: any) => sum + parseFloat(d.total || '0'), 0);

          const invoicesCount = docs.filter((d: any) => (d.docType ?? d.doc_type) === '01').length;
          const boletasCount = docs.filter((d: any) => (d.docType ?? d.doc_type) === '03').length;
          const creditNotesCount = docs.filter((d: any) => (d.docType ?? d.doc_type) === '07').length;
          const voidedCount = docs.filter((d: any) => d.status === 'voided').length;

          setMetrics({
            dailyBilling,
            monthlyBilling,
            invoicesCount,
            boletasCount,
            customersCount: Array.isArray(customersRes) ? customersRes.length : (customersRes?.meta?.total ?? 0),
            voidedCount,
            creditNotesCount,
            sunatStatus: company?.sunatEnvironment === 'production' ? 'Producción OK' : 'Beta Pruebas',
          });

          // Calculate Daily Sales Data (Last 7 Days)
          const days = Array.from({ length: 7 }).map((_, idx) => {
            const d = new Date();
            d.setDate(d.getDate() - idx);
            return d.toISOString().split('T')[0];
          }).reverse();

          const formattedDaily = days.map((dateStr) => {
            const daySales = activeDocs
              .filter((d: any) => (d.issueDate ?? d.issue_date) === dateStr)
              .reduce((sum: number, d: any) => sum + parseFloat(d.total || '0'), 0);
            
            const label = new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
            return { name: label, total: daySales };
          });
          setDailySalesData(formattedDaily);

          // Calculate Monthly Sales Data (Last 6 Months)
          const months = Array.from({ length: 6 }).map((_, idx) => {
            const d = new Date();
            d.setMonth(d.getMonth() - idx);
            return d.toISOString().substring(0, 7);
          }).reverse();

          const formattedMonthly = months.map((monthStr) => {
            const monthSales = activeDocs
              .filter((d: any) => (d.issueDate ?? d.issue_date ?? '').startsWith(monthStr))
              .reduce((sum: number, d: any) => sum + parseFloat(d.total || '0'), 0);
            
            const label = new Date(monthStr + '-02T00:00:00').toLocaleDateString('es-PE', { month: 'short' });
            return { name: label, total: monthSales };
          });
          setMonthlySalesData(formattedMonthly);

          setRecentAudits(audits.slice(0, 5));
        }
      } catch (err) {
        console.error('Error loading dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [company, isSaaSAdmin, user]);

  // Render SaaS Global Dashboard
  if (isSaaSAdmin) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PageHeader 
          title="Consola de Administración SaaS" 
          subtitle="Supervisión global de empresas clientes y facturación de Izinvoce"
        />

        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* SaaS KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Empresas Clientes</span>
                <p className="text-xl font-bold font-mono">
                  {loading ? '...' : saasMetrics.totalCompanies}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Suscripciones Activas</span>
                <p className="text-xl font-bold font-mono">
                  {loading ? '...' : saasMetrics.activeSubscriptions}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Comprobantes Procesados</span>
                <p className="text-xl font-bold font-mono">
                  {loading ? '...' : saasMetrics.totalDocuments}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-400">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Facturación Global</span>
                <p className="text-xl font-bold font-mono">
                  {loading ? 'S/ ...' : `S/ ${saasMetrics.totalRevenue.toFixed(2)}`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Facturación Global Semanal</h3>
              <p className="text-[10px] text-zinc-500 font-medium">Volumen de ventas emitido por todas las empresas clientes en los últimos 7 días</p>
            </div>
            <RevenueChart data={dailySalesData} type="area" />
          </div>

          {/* Dual Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent registered companies */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Empresas Clientes Recientes</h3>
                </div>
                <Link href="/dashboard/companies" className="text-xs text-blue-500 hover:underline">
                  Ver todas
                </Link>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {recentCompanies.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">No hay empresas registradas.</p>
                ) : (
                  recentCompanies.map((c: any) => (
                    <div key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white">{c.business_name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">RUC: {c.ruc} | {c.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-semibold border border-zinc-200 dark:border-zinc-700/60">
                          {c.plan}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Logs de Actividad SaaS</h3>
              </div>

              <div className="space-y-4">
                {recentAudits.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">No hay actividad reciente registrada.</p>
                ) : (
                  recentAudits.map((log: any) => (
                    <div key={log.id} className="flex gap-4 items-start text-xs">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-white truncate">{log.action}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{log.details}</p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 self-center">
                          {log.user_name} ({log.ip_address})
                        </span>
                        <span className="text-right text-[10px] text-zinc-400 font-mono self-center">
                          {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Local Company Dashboard
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader 
        title="Dashboard General" 
        subtitle="Métricas globales de facturación y estado del sistema"
      />

      <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Facturación del Día</span>
              <p className="text-xl font-bold font-mono">
                {loading ? 'S/ ...' : `S/ ${metrics.dailyBilling.toFixed(2)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Facturación del Mes</span>
              <p className="text-xl font-bold font-mono">
                {loading ? 'S/ ...' : `S/ ${metrics.monthlyBilling.toFixed(2)}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Boletas / Facturas Emitidas</span>
              <p className="text-xl font-bold font-mono">
                {loading ? '...' : `${metrics.boletasCount} / ${metrics.invoicesCount}`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Entorno SUNAT</span>
              <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 pt-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {metrics.sunatStatus}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic Secondary KPIs grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Clientes Registrados</span>
            <span className="text-sm font-bold font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{metrics.customersCount}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Documentos Anulados</span>
            <span className="text-sm font-bold font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">{metrics.voidedCount}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Notas de Crédito Emitidas</span>
            <span className="text-sm font-bold font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">{metrics.creditNotesCount}</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Facturación Semanal (Día a Día)</h3>
              <p className="text-[10px] text-zinc-500 font-medium">Volumen de ventas de los últimos 7 días</p>
            </div>
            <RevenueChart data={dailySalesData} type="area" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Facturación Mensual</h3>
              <p className="text-[10px] text-zinc-500 font-medium">Volumen de ventas acumulado por mes</p>
            </div>
            <RevenueChart data={monthlySalesData} type="bar" />
          </div>
        </div>

        {/* Activity Audits Feed */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Auditoría y Actividad Reciente</h3>
          </div>

          <div className="space-y-4">
            {recentAudits.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-4">No hay actividad reciente registrada.</p>
            ) : (
              recentAudits.map((log: any) => (
                <div key={log.id} className="flex gap-4 items-start text-xs">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">{log.action}</span>
                    <span className="text-zinc-500">{log.details}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{log.user_name} ({log.ip_address})</span>
                    <span className="text-right text-[10px] text-zinc-400 font-mono animate-none">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
