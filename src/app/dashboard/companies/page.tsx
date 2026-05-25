'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { BillingApiClient } from '@/services/api-client';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  ExternalLink,
  Unlock
} from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  
  // Register Form State
  const [form, setForm] = useState({
    ruc: '',
    businessName: '',
    tradeName: '',
    address: '',
    email: '',
    phone: '',
    planName: 'starter',
  });
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdData, setCreatedData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await BillingApiClient.listSaasCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Validations
    if (!form.ruc || form.ruc.length !== 11 || !/^\d+$/.test(form.ruc)) {
      setFormError('El RUC debe ser una cadena numérica de exactamente 11 dígitos.');
      return;
    }
    if (!form.businessName.trim()) {
      setFormError('La Razón Social es requerida.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setFormError('El correo electrónico de contacto debe ser válido.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await BillingApiClient.createSaasCompany(form);
      setCreatedData(res);
      setIsRegisterOpen(false);
      setIsSuccessOpen(true);
      
      // Reset form
      setForm({
        ruc: '',
        businessName: '',
        tradeName: '',
        address: '',
        email: '',
        phone: '',
        planName: 'starter',
      });
      
      // Refresh
      await fetchCompanies();
    } catch (err: any) {
      setFormError(err.message || 'Error al registrar la empresa. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (companyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await BillingApiClient.updateSaasCompany({ companyId, status: nextStatus });
      await fetchCompanies();
    } catch (err) {
      console.error('Error updating company status', err);
    }
  };

  const changePlan = async (companyId: string, planName: string) => {
    try {
      await BillingApiClient.updateSaasCompany({ companyId, planName });
      await fetchCompanies();
    } catch (err) {
      console.error('Error updating company plan', err);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.ruc.includes(q) ||
      c.business_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader 
        title="Directorio de Empresas Clientes" 
        subtitle="Administra los clientes de IZINVOCE, asigna planes, suspende servicios y visualiza credenciales."
      />

      <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por RUC o Razón Social..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Empresa</span>
          </button>
        </div>

        {/* Table representation */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 font-semibold">
                  <th className="p-4">Razón Social / RUC</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Plan / Suscripción</th>
                  <th className="p-4">Usuarios</th>
                  <th className="p-4">API Key</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 space-y-2">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-850 rounded w-48" />
                        <div className="h-3 bg-zinc-200 dark:bg-zinc-850 rounded w-24" />
                      </td>
                      <td className="p-4"><div className="h-3 bg-zinc-200 dark:bg-zinc-850 rounded w-32" /></td>
                      <td className="p-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-850 rounded w-16" /></td>
                      <td className="p-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-850 rounded w-8" /></td>
                      <td className="p-4"><div className="h-3 bg-zinc-200 dark:bg-zinc-850 rounded w-28" /></td>
                      <td className="p-4"><div className="h-8 bg-zinc-200 dark:bg-zinc-850 rounded w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-400">
                      No se encontraron empresas clientes en el sistema.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{c.business_name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">RUC: {c.ruc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 space-y-1 text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={c.plan}
                            onChange={(e) => changePlan(c.id, e.target.value)}
                            className="bg-transparent border border-zinc-250 dark:border-zinc-800 p-1 text-[11px] rounded font-medium focus:outline-none dark:bg-zinc-900 cursor-pointer"
                          >
                            <option value="starter">Starter</option>
                            <option value="scale">Scale</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                        {c.usersCount || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 p-1 px-2 rounded border border-zinc-200/50 dark:border-zinc-800/40 w-fit font-mono text-[10px] text-zinc-400">
                          <span className="truncate max-w-[120px]">{c.api_key}</span>
                          <button
                            onClick={() => handleCopy(c.api_key, `api-${c.id}`)}
                            className="p-1 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Copiar API Key"
                          >
                            {copiedKey === `api-${c.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleStatus(c.id, c.status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            c.status === 'active' 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                          }`}
                        >
                          {c.status === 'active' ? 'Suspender' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: REGISTER NEW COMPANY */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Registrar Nueva Empresa</h3>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">RUC (11 dígitos)</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={form.ruc}
                    onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })}
                    placeholder="20123456789"
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Plan de Suscripción</label>
                  <select
                    value={form.planName}
                    onChange={(e) => setForm({ ...form, planName: e.target.value })}
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="scale">Scale Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Razón Social</label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="ACME SOLUTIONS S.A.C."
                  className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Nombre Comercial (Opcional)</label>
                  <input
                    type="text"
                    value={form.tradeName}
                    onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                    placeholder="Acme Tech"
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Dirección Fiscal (Opcional)</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Av. Las Flores 123, San Isidro"
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Correo de Contacto</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contacto@acme.pe"
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Teléfono (Opcional)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="999888777"
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-blue-500 leading-relaxed">
                <p className="font-semibold mb-1">Aprovisionamiento Automático de SUNAT y Credenciales:</p>
                Al registrar la empresa, se crearán las series de comprobantes (F001/B001), credenciales SOL Mock para el entorno Beta, y un usuario Administrador por defecto con clave temporal.
              </div>

              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUCCESS CREDENTIALS DISPLAY */}
      {isSuccessOpen && createdData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">¡Empresa Registrada!</h4>
                <p className="text-xs text-zinc-400">Entrega estas credenciales a tu cliente final para su primer inicio de sesión.</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-left space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Empresa</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{createdData.company.business_name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">RUC: {createdData.company.ruc}</p>
                </div>

                <div className="border-t border-zinc-150 dark:border-zinc-800 pt-2 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Credenciales del Administrador</p>
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-150 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-500">Usuario:</span>
                      <p className="font-mono font-bold text-blue-500">{createdData.adminUser.username}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(createdData.adminUser.username, 'created-user')}
                      className="p-1 hover:text-zinc-900 dark:hover:text-white text-zinc-400 transition-colors"
                    >
                      {copiedKey === 'created-user' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-150 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-500">Clave Temporal:</span>
                      <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{createdData.adminUser.password_hash}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(createdData.adminUser.password_hash, 'created-pass')}
                      className="p-1 hover:text-zinc-900 dark:hover:text-white text-zinc-400 transition-colors"
                    >
                      {copiedKey === 'created-pass' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-150 dark:border-zinc-800 pt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">API Key Principal (Producción)</p>
                      <p className="font-mono text-[10px] text-zinc-500 truncate max-w-[200px]">{createdData.company.api_key}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(createdData.company.api_key, 'created-key')}
                      className="p-1.5 bg-white dark:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white text-zinc-400 rounded border border-zinc-150 dark:border-zinc-800 transition-colors"
                    >
                      {copiedKey === 'created-key' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsSuccessOpen(false)}
                className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-xl font-semibold text-xs shadow-md transition-colors cursor-pointer"
              >
                Cerrar y Regresar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
