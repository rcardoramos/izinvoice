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
  Unlock,
  Settings
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
    ubigeo: '150101',
    email: '',
    phone: '',
    planName: 'starter',
    sunatEnvironment: 'beta',
    solUsername: '',
    solPassword: '',
    adminUsername: 'admin',
    adminFullName: 'Administrador',
    adminPassword: '',
  });
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdData, setCreatedData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Email simulation state
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);
  const [mailDetails, setMailDetails] = useState<{ from: string; to: string; subject: string; body: string } | null>(null);

  // Reset password states
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resettingCompany, setResettingCompany] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Config settings states
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedConfigCompany, setSelectedConfigCompany] = useState<any>(null);
  const [configForm, setConfigForm] = useState({
    tradeName: '',
    address: '',
    ubigeo: '',
    phone: '',
    email: '',
    sunatEnvironment: 'beta',
    solUsername: '',
    solPassword: '',
  });
  const [configSuccess, setConfigSuccess] = useState('');
  const [configError, setConfigError] = useState('');

  const handleSendEmailSimulated = (data: { email: string; ruc: string; businessName: string; username: string; password_hash: string }) => {
    const body = `Estimado cliente,

Tus credenciales de acceso para la plataforma izInvoice han sido creadas con éxito.

Empresa: ${data.businessName}
RUC: ${data.ruc}

Credenciales de Administrador:
- Usuario: ${data.username}
- Contraseña: ${data.password_hash}

Puedes iniciar sesión ingresando a la dirección de tu panel de facturación.

Atentamente,
Soporte Técnico de izInvoice`;

    setMailDetails({
      from: 'no-reply@izinvoice.pe',
      to: data.email,
      subject: '¡Tus credenciales de izInvoice han sido creadas!',
      body,
    });
    setIsMailModalOpen(true);
  };

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
      const payload = {
        ruc: form.ruc,
        businessName: form.businessName,
        tradeName: form.tradeName,
        address: form.address,
        ubigeo: form.ubigeo,
        email: form.email,
        phone: form.phone,
        planName: form.planName,
        sunatEnvironment: form.sunatEnvironment,
        solUsername: form.solUsername || `${form.ruc}MODDATOS`,
        solPassword: form.solPassword || 'MODDATOS',
        initialUser: {
          username: form.adminUsername || `admin_${form.ruc}`,
          password: form.adminPassword || 'admin123',
          fullName: form.adminFullName || `Admin ${form.businessName}`,
        }
      };

      const res = await BillingApiClient.createSaasCompany(payload);
      setCreatedData(res);
      setIsRegisterOpen(false);
      setIsSuccessOpen(true);
      
      // Reset form
      setForm({
        ruc: '',
        businessName: '',
        tradeName: '',
        address: '',
        ubigeo: '150101',
        email: '',
        phone: '',
        planName: 'starter',
        sunatEnvironment: 'beta',
        solUsername: '',
        solPassword: '',
        adminUsername: 'admin',
        adminFullName: 'Administrador',
        adminPassword: '',
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

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingCompany) return;
    if (!newPasswordInput.trim()) {
      return;
    }
    
    try {
      setSubmitting(true);
      await BillingApiClient.updateSaasCompany({
        companyId: resettingCompany.id,
        newPassword: newPasswordInput.trim()
      });
      setResetSuccessMessage('¡Contraseña restablecida con éxito!');
      await fetchCompanies();
    } catch (err: any) {
      setResetSuccessMessage(`Error: ${err.message || 'No se pudo restablecer la clave.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    if (!selectedConfigCompany) return;

    try {
      setSubmitting(true);
      await BillingApiClient.updateSaasCompany({
        companyId: selectedConfigCompany.id,
        tradeName: configForm.tradeName,
        address: configForm.address,
        ubigeo: configForm.ubigeo,
        phone: configForm.phone,
        email: configForm.email,
        sunatEnvironment: configForm.sunatEnvironment,
        solUsername: configForm.solUsername,
        solPassword: configForm.solPassword,
      });
      setConfigSuccess('¡Configuración actualizada con éxito!');
      await fetchCompanies();
      setTimeout(() => {
        setIsConfigOpen(false);
        setConfigSuccess('');
      }, 1500);
    } catch (err: any) {
      setConfigError(err.message || 'Error al guardar la configuración.');
    } finally {
      setSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(pass);
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
        subtitle="Administra los clientes de IZINVOICE, asigna planes, suspende servicios y visualiza credenciales."
      />

      <div className="p-6 space-y-5 max-w-7xl w-full mx-auto">
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-700/15 transition-all cursor-pointer"
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
                        <div className="flex items-center justify-end gap-2">
                           <button
                            onClick={() => {
                              setSelectedConfigCompany(c);
                              setConfigForm({
                                tradeName: c.trade_name || '',
                                address: c.address || '',
                                ubigeo: c.ubigeo || '',
                                phone: c.phone || '',
                                email: c.email || '',
                                sunatEnvironment: c.sunat_environment || 'beta',
                                solUsername: c.sol_username || '',
                                solPassword: c.sol_password || '',
                              });
                              setIsConfigOpen(false);
                              setIsConfigOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-zinc-250 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
                            title="Configurar SUNAT y Datos"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setResettingCompany(c);
                              setNewPasswordInput('');
                              setResetSuccessMessage('');
                              setIsResetPasswordOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-zinc-250 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all cursor-pointer"
                            title="Restablecer Contraseña"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
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
                        </div>
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Registrar Nueva Empresa</h3>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* 1. Datos del Emisor */}
                <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <h4 className="text-[10px] uppercase font-bold text-[#4f46e5] tracking-wider mb-2">1. Perfil del Emisor (Empresa)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">RUC (11 dígitos)</label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={form.ruc}
                        onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })}
                        placeholder="20123456789"
                        className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Plan de Suscripción</label>
                      <select
                        value={form.planName}
                        onChange={(e) => setForm({ ...form, planName: e.target.value })}
                        className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-zinc-800 dark:text-zinc-200 font-semibold"
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
                      className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Nombre Comercial</label>
                      <input
                        type="text"
                        value={form.tradeName}
                        onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                        placeholder="Acme Tech"
                        className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Ubigeo Fiscal</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={form.ubigeo}
                        onChange={(e) => setForm({ ...form, ubigeo: e.target.value.replace(/\D/g, '') })}
                        placeholder="150101"
                        className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Dirección Fiscal</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Av. Las Flores 123, San Isidro"
                      className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Correo de Contacto</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="contacto@acme.pe"
                        className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Teléfono</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="999888777"
                        className="w-full border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Configuración SUNAT */}
                <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <h4 className="text-[10px] uppercase font-bold text-[#4f46e5] tracking-wider mb-2">2. Configuración SUNAT / SOL</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Entorno de Emisión</label>
                      <select
                        value={form.sunatEnvironment}
                        onChange={(e) => setForm({ ...form, sunatEnvironment: e.target.value })}
                        className="w-full border border-zinc-255 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-zinc-800 dark:text-zinc-200 font-semibold"
                      >
                        <option value="beta">Beta (Pruebas SUNAT)</option>
                        <option value="production">Production (Emisión Real)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Usuario SOL (Opcional)</label>
                      <input
                        type="text"
                        value={form.solUsername}
                        onChange={(e) => setForm({ ...form, solUsername: e.target.value })}
                        placeholder="Def: RUC + MODDATOS"
                        className="w-full border border-zinc-255 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Clave SOL (Opcional)</label>
                    <input
                      type="password"
                      value={form.solPassword}
                      onChange={(e) => setForm({ ...form, solPassword: e.target.value })}
                      placeholder="Def: MODDATOS"
                      className="w-full border border-zinc-255 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* 3. Usuario Administrador Inicial */}
                <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <h4 className="text-[10px] uppercase font-bold text-[#4f46e5] tracking-wider mb-2">3. Usuario Administrador Inicial</h4>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Nombre Completo</label>
                    <input
                      type="text"
                      value={form.adminFullName}
                      onChange={(e) => setForm({ ...form, adminFullName: e.target.value })}
                      placeholder="Administrador de la Empresa"
                      className="w-full border border-zinc-255 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Usuario de Acceso</label>
                      <input
                        type="text"
                        value={form.adminUsername}
                        onChange={(e) => setForm({ ...form, adminUsername: e.target.value })}
                        placeholder="admin"
                        className="w-full border border-zinc-255 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Contraseña (Opcional)</label>
                      <input
                        type="text"
                        value={form.adminPassword}
                        onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                        placeholder="Def: admin123"
                        className="w-full border border-zinc-255 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
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
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md text-xs font-semibold disabled:opacity-50"
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

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendEmailSimulated({
                    email: createdData.company.email,
                    ruc: createdData.company.ruc,
                    businessName: createdData.company.business_name,
                    username: createdData.adminUser.username,
                    password_hash: createdData.adminUser.password_hash
                  })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar por Correo</span>
                </button>
                <button
                  onClick={() => setIsSuccessOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold text-xs border border-zinc-250 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SIMULATED EMAIL VIEWER */}
      {isMailModalOpen && mailDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-250 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Buzón de Correo Simulado</span>
              </div>
              <button 
                onClick={() => setIsMailModalOpen(false)} 
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Envelope Info */}
            <div className="p-4 border-b border-zinc-150 bg-zinc-50/50 space-y-2 text-xs">
              <div className="grid grid-cols-[60px_1fr] items-center">
                <span className="text-zinc-400 font-semibold">De:</span>
                <span className="font-mono text-zinc-700">{mailDetails.from}</span>
              </div>
              <div className="grid grid-cols-[60px_1fr] items-center">
                <span className="text-zinc-400 font-semibold">Para:</span>
                <span className="font-mono text-zinc-850 font-medium">{mailDetails.to}</span>
              </div>
              <div className="grid grid-cols-[60px_1fr] items-center">
                <span className="text-zinc-400 font-semibold">Asunto:</span>
                <span className="font-semibold text-zinc-800">{mailDetails.subject}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 bg-white min-h-[180px] font-sans text-xs text-zinc-800 leading-relaxed whitespace-pre-line">
              {mailDetails.body}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleCopy(mailDetails.body, 'email-content')}
                className="px-3 py-2 border border-zinc-250 rounded-xl hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'email-content' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMailModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                Cerrar Buzón
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RESET PASSWORD */}
      {isResetPasswordOpen && resettingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Restablecer Contraseña</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsResetPasswordOpen(false)} 
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Empresa</p>
                <p className="font-semibold text-zinc-800 text-xs">{resettingCompany.business_name}</p>
                <p className="text-[10px] text-zinc-500 font-mono">RUC: {resettingCompany.ruc}</p>
              </div>

              {resetSuccessMessage ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-3 rounded-lg text-xs font-medium">
                    {resetSuccessMessage}
                  </div>
                  
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-650 space-y-2">
                    <p className="font-semibold text-zinc-800">Nueva credencial establecida:</p>
                    <div className="font-mono text-xs flex justify-between items-center bg-white p-2 rounded border border-zinc-150">
                      <div>
                        <span className="text-[10px] text-zinc-400">Usuario:</span>
                        <p className="font-bold text-blue-600">admin_{resettingCompany.ruc}</p>
                      </div>
                    </div>
                    <div className="font-mono text-xs flex justify-between items-center bg-white p-2 rounded border border-zinc-150">
                      <div>
                        <span className="text-[10px] text-zinc-400">Nueva Contraseña:</span>
                        <p className="font-bold text-zinc-800">{newPasswordInput}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(newPasswordInput, 'reset-pass-copied')}
                        className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        {copiedKey === 'reset-pass-copied' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPasswordOpen(false);
                        handleSendEmailSimulated({
                          email: resettingCompany.email,
                          ruc: resettingCompany.ruc,
                          businessName: resettingCompany.business_name,
                          username: `admin_${resettingCompany.ruc}`,
                          password_hash: newPasswordInput
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Enviar por Correo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResetPasswordOpen(false)}
                      className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold text-xs border border-zinc-250 transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Nueva Contraseña de Administrador</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Ingresa la nueva clave..."
                        className="flex-1 border border-zinc-200 bg-zinc-50 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="px-3 border border-zinc-250 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 transition-colors cursor-pointer shrink-0"
                      >
                        Generar clave
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-150 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsResetPasswordOpen(false)}
                      className="px-4 py-2 border border-zinc-250 rounded-xl hover:bg-zinc-50 transition-colors text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !newPasswordInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md text-xs font-semibold disabled:opacity-50"
                    >
                      {submitting ? 'Guardando...' : 'Restablecer Clave'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL 5: CONFIG COMPANY SETTINGS */}
      {isConfigOpen && selectedConfigCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Configuración de Empresa</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsConfigOpen(false)} 
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} className="p-6 space-y-4 text-xs">
              {configError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{configError}</span>
                </div>
              )}

              {configSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-3 rounded-lg text-[11px] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{configSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Razón Social</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedConfigCompany.business_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">RUC</p>
                  <p className="font-mono text-zinc-500 font-bold">{selectedConfigCompany.ruc}</p>
                </div>
              </div>

              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3 space-y-3">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] tracking-wide">Datos Generales</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Nombre Comercial</label>
                    <input
                      type="text"
                      value={configForm.tradeName}
                      onChange={(e) => setConfigForm({ ...configForm, tradeName: e.target.value })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Ubigeo Fiscal</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={configForm.ubigeo}
                      onChange={(e) => setConfigForm({ ...configForm, ubigeo: e.target.value.replace(/\D/g, '') })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-400">Dirección Fiscal</label>
                  <input
                    type="text"
                    value={configForm.address}
                    onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                    className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Correo de Contacto</label>
                    <input
                      type="email"
                      required
                      value={configForm.email}
                      onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Teléfono</label>
                    <input
                      type="text"
                      value={configForm.phone}
                      onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3 space-y-3">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[10px] tracking-wide">Configuración SUNAT / SOL</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Entorno de Emisión</label>
                    <select
                      value={configForm.sunatEnvironment}
                      onChange={(e) => setConfigForm({ ...configForm, sunatEnvironment: e.target.value })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg text-zinc-800 dark:text-zinc-200 font-semibold"
                    >
                      <option value="beta">Beta (Pruebas SUNAT)</option>
                      <option value="production">Production (Emisión Real)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Usuario SOL</label>
                    <input
                      type="text"
                      required
                      value={configForm.solUsername}
                      onChange={(e) => setConfigForm({ ...configForm, solUsername: e.target.value })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400">Clave SOL</label>
                    <input
                      type="password"
                      required
                      value={configForm.solPassword}
                      onChange={(e) => setConfigForm({ ...configForm, solPassword: e.target.value })}
                      className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
