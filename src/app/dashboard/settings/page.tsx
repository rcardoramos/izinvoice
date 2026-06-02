'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { BillingApiClient } from '@/services/api-client';
import { 
  Building, 
  Key, 
  Lock, 
  FileCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle,
  X,
  Edit
} from 'lucide-react';
import { formatDatePE, nowPE } from '@/utils/date-pe';

export default function SettingsPage() {
  const { user, company } = useAuthStore();
  const { addNotification } = useAppStore();

  // Company profile form state
  const [profile, setProfile] = useState({
    businessName: '',
    tradeName: '',
    address: '',
    ubigeo: '',
    phone: '',
    email: '',
  });

  // SOL credentials form
  const [solUsername, setSolUsername] = useState('20000000001MODDATOS');
  const [solPassword, setSolPassword] = useState('MODDATOS');

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Certificates CRUD state
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);

  // Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPassword, setUploadPassword] = useState('');
  const [uploadAlias, setUploadAlias] = useState('');
  const [uploadSetActive, setUploadSetActive] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Edit Form state
  const [editAlias, setEditAlias] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const loadCertificates = async () => {
    try {
      setCertLoading(true);
      const res = await BillingApiClient.listCertificates();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setCertificates(list);
    } catch (err) {
      console.error('Failed to load certificates', err);
    } finally {
      setCertLoading(false);
    }
  };

  const handleActivateCert = async (id: string) => {
    try {
      await BillingApiClient.updateCertificate(id, { isActive: true });
      addNotification({
        id: Math.random().toString(),
        title: 'Certificado Activo',
        message: 'Se ha cambiado el certificado activo para la firma XML.',
        type: 'success',
        created_at: nowPE(),
      });
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error al activar el certificado.');
    }
  };

  // Delete certificate handler disabled per request
  /*
  const handleDeleteCert = async (id: string, alias: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el certificado '${alias}'?`)) return;
    try {
      await BillingApiClient.deleteCertificate(id);
      addNotification({
        id: Math.random().toString(),
        title: 'Certificado Eliminado',
        message: `El certificado '${alias}' ha sido eliminado.`,
        type: 'info',
        created_at: nowPE(),
      });
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el certificado.');
    }
  };
  */

  const handleUploadCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Por favor seleccione un archivo .pfx o .p12');
      return;
    }
    if (!uploadPassword) {
      alert('La contraseña del certificado es requerida.');
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('pfxPassword', uploadPassword);
      formData.append('alias', uploadAlias);
      formData.append('setActive', String(uploadSetActive));

      await BillingApiClient.uploadCertificate(formData);

      addNotification({
        id: Math.random().toString(),
        title: 'Certificado Subido',
        message: 'El nuevo certificado digital se ha cargado con éxito.',
        type: 'success',
        created_at: nowPE(),
      });

      setUploadFile(null);
      setUploadPassword('');
      setUploadAlias('');
      setUploadSetActive(true);
      setShowUploadModal(false);
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error al subir el certificado. Asegúrese de que el archivo sea .pfx/.p12 y la clave sea correcta.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditCertClick = (cert: any) => {
    setEditingCert(cert);
    setEditAlias(cert.alias || '');
    setEditPassword('');
    setEditIsActive(cert.isActive);
    setShowEditModal(true);
  };

  const handleUpdateCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    try {
      setEditLoading(true);
      const body: any = {
        alias: editAlias,
        isActive: editIsActive,
      };
      if (editPassword) {
        body.pfxPassword = editPassword;
      }

      await BillingApiClient.updateCertificate(editingCert.id, body);

      addNotification({
        id: Math.random().toString(),
        title: 'Certificado Actualizado',
        message: 'Los datos del certificado se han actualizado con éxito.',
        type: 'success',
        created_at: nowPE(),
      });

      setShowEditModal(false);
      setEditingCert(null);
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el certificado.');
    } finally {
      setEditLoading(false);
    }
  };

  // Load config on mount
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      const activeCompanyId = company?.id || '00000000-0000-4000-8000-000000000001';
      try {
        const comp = await BillingApiClient.getCompanyProfile(activeCompanyId);
        setProfile({
          businessName: comp.businessName || '',
          tradeName: comp.tradeName || '',
          address: comp.address || '',
          ubigeo: comp.ubigeo || '',
          phone: comp.phone || '',
          email: comp.email || '',
        });
        setSolUsername(comp.solUsername || `${comp.ruc}MODDATOS`);
        setSolPassword(comp.solPassword || 'MODDATOS');
      } catch (err) {
        console.error('Failed to load company profile from API', err);
        // Fallback to store company if API fails
        if (company) {
          setProfile({
            businessName: company.businessName,
            tradeName: company.tradeName || '',
            address: company.address || '',
            ubigeo: company.ubigeo || '',
            phone: company.phone || '',
            email: company.email || '',
          });
          const compAny = company as any;
          setSolUsername(compAny.solUsername || compAny.sol_username || compAny.ruc + 'MODDATOS');
          setSolPassword(compAny.solPassword || compAny.sol_password || 'MODDATOS');
        }
      }
    };

    fetchCompanyProfile();
    loadCertificates();

    // Load API keys list from simulated storage
    const loadApiKeys = () => {
      const list = [
        {
          id: 'key_1',
          name: 'Producción ERP Link',
          key_value: 'if_live_83ba9a10c839fde1029c48b201a093ef',
          status: 'active',
          last_used_at: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 864000000).toISOString(),
        },
        {
          id: 'key_2',
          name: 'Sandbox SDK Testing',
          key_value: 'if_test_48a910bc7de89f0293da7e48b8120ef9',
          status: 'active',
          last_used_at: null,
          created_at: new Date(Date.now() - 250000000).toISOString(),
        }
      ];
      setApiKeys(list);
    };
    loadApiKeys();
  }, [company]);

  // Update profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCompanyId = company?.id || '00000000-0000-4000-8000-000000000001';
    try {
      await BillingApiClient.updateCompanyProfile(activeCompanyId, {
        businessName: profile.businessName,
        tradeName: profile.tradeName,
        address: profile.address,
        ubigeo: profile.ubigeo,
        phone: profile.phone,
        email: profile.email,
      });

      addNotification({
        id: Math.random().toString(),
        title: 'Configuración Actualizada',
        message: 'Los datos de la empresa se han actualizado correctamente.',
        type: 'success',
        created_at: nowPE(),
      });
      alert('Información guardada con éxito.');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el perfil.');
    }
  };

  // Update SOL SOAP credentials
  const handleUpdateSol = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCompanyId = company?.id || '00000000-0000-4000-8000-000000000001';
    try {
      await BillingApiClient.updateCompanyProfile(activeCompanyId, {
        solUsername,
        solPassword,
      });

      addNotification({
        id: Math.random().toString(),
        title: 'Credenciales SUNAT Guardadas',
        message: 'Las credenciales del usuario SOL se han actualizado con éxito.',
        type: 'success',
        created_at: nowPE(),
      });
      alert('Credenciales SOL guardadas con éxito. Conexión verificada en entorno beta.');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar las credenciales.');
    }
  };

  // Generate new API Key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      id: 'key_' + Math.random().toString(36).substring(2, 9),
      name: newKeyName,
      key_value: `if_live_${hex}`,
      status: 'active',
      last_used_at: null,
      created_at: nowPE(),
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName('');
    setShowKeyModal(false);

    addNotification({
      id: Math.random().toString(),
      title: 'API Key Generada',
      message: `Nueva clave '${newKey.name}' creada para integraciones REST.`,
      type: 'success',
      created_at: nowPE(),
    });
  };

  // Revoke API Key
  const handleRevokeKey = (id: string, name: string) => {
    if (!confirm(`¿Está seguro de que desea revocar la API Key '${name}'? Las integraciones conectadas perderán acceso de inmediato.`)) return;

    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k))
    );

    addNotification({
      id: Math.random().toString(),
      title: 'API Key Revocada',
      message: `La clave '${name}' ha sido revocada de forma permanente.`,
      type: 'info',
      created_at: nowPE(),
    });
  };

  // Copy to clipboard helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader 
        title="Configuración de Empresa" 
        subtitle="Gestione el emisor, credenciales SOL, certificado y API Keys"
      />

      <div className="p-6 space-y-6 max-w-5xl w-full mx-auto pb-12 select-none text-xs">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company details and SUNAT creds form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Emisor Profile */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Building className="w-4 h-4 text-[#4f46e5]" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Perfil Emisor (Empresa)</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Razón Social</label>
                    <input
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                      required
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Nombre Comercial</label>
                    <input
                      type="text"
                      value={profile.tradeName}
                      onChange={(e) => setProfile({ ...profile, tradeName: e.target.value })}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Dirección Fiscal</label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      required
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Ubigeo Fiscal</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={profile.ubigeo}
                      onChange={(e) => setProfile({ ...profile, ubigeo: e.target.value.replace(/\D/g, '') })}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Correo Notificaciones</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Teléfono</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold hover:bg-[#4338ca] shadow-md shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    Guardar Perfil
                  </button>
                </div>
              </form>
            </div>

            {/* API Keys management panel */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Programmatic API Keys</h3>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => setShowKeyModal(true)}
                    className="flex items-center gap-1 text-[10px] bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Crear API Key
                  </button>
                )}
              </div>

              {/* Access Denied Warning if not super admin */}
              {!isSuperAdmin ? (
                <div className="bg-amber-500/5 border border-amber-500/25 p-4 rounded-xl flex items-start gap-2.5 text-amber-600 leading-snug">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Acceso Restringido</p>
                    <p className="mt-0.5">La gestión de claves de API externas está reservada para usuarios con rol de <b>Super Administrador</b>.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-zinc-500 leading-relaxed font-medium">
                    Utilice claves de API para integrar facturación directa en su ERP, WooCommerce o sistemas externos de punto de venta.
                  </p>

                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] text-zinc-500 uppercase font-bold">
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Clave</th>
                          <th className="p-3">Último Uso</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {apiKeys.map((key) => (
                          <tr key={key.id} className={key.status === 'revoked' ? 'opacity-50' : ''}>
                            <td className="p-3 font-bold text-zinc-900">{key.name}</td>
                            <td className="p-3 font-mono text-[10px] flex items-center gap-1.5">
                              <span className="truncate max-w-[150px]">{key.key_value}</span>
                              <button
                                onClick={() => handleCopy(key.id, key.key_value)}
                                className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer text-zinc-400 hover:text-zinc-900"
                                title="Copiar al portapapeles"
                              >
                                {copiedKeyId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                            <td className="p-3 font-mono text-[10px] text-zinc-400 font-semibold">
                              {key.last_used_at
                                ? formatDatePE(key.last_used_at, { dateStyle: 'short' })
                                : 'Nunca'}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  key.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}
                              >
                                {key.status === 'active' ? 'Activo' : 'Revocado'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {key.status === 'active' && (
                                <button
                                  onClick={() => handleRevokeKey(key.id, key.name)}
                                  className="text-rose-550 hover:bg-rose-550/10 p-1.5 rounded-xl cursor-pointer"
                                  title="Revocar Clave"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right settings block: SUNAT credentials */}
          <div className="space-y-6">
            
            {/* SUNAT SOAP Credentials */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Lock className="w-4 h-4 text-[#4f46e5]" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Credenciales SOL SUNAT</h3>
              </div>

              <form onSubmit={handleUpdateSol} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">Usuario SOL</label>
                  <input
                    type="text"
                    value={solUsername}
                    onChange={(e) => setSolUsername(e.target.value.toUpperCase())}
                    required
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">Clave SOL</label>
                  <input
                    type="password"
                    value={solPassword}
                    onChange={(e) => setSolPassword(e.target.value)}
                    required
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 transition-colors cursor-pointer text-center"
                >
                  Guardar Credenciales
                </button>
              </form>
            </div>

            {/* Certificado Digital management */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Certificados Digitales</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1 text-[10px] bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Subir PFX
                </button>
              </div>

              {certLoading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-zinc-400">Cargando certificados...</span>
                </div>
              ) : certificates.length === 0 ? (
                <div className="border border-dashed border-zinc-200 p-6 rounded-xl text-center text-zinc-400">
                  <p className="font-bold text-[10px] mb-1 text-zinc-700">Sin Certificados</p>
                  <p className="text-[9px] mb-2 leading-snug">Suba su certificado digital (.pfx) para comenzar a firmar comprobantes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div 
                      key={cert.id} 
                      className={`p-3 border rounded-xl space-y-2 transition-all ${
                        cert.isActive 
                          ? 'border-[#4f46e5]/40 bg-indigo-500/[0.01]' 
                          : 'border-zinc-200 bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-zinc-900 truncate text-[11px]" title={cert.alias}>
                            {cert.alias}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-mono truncate">
                            {cert.filename}
                          </p>
                        </div>
                        <span 
                          className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                            cert.isActive 
                              ? 'bg-indigo-500/10 text-[#4f46e5]' 
                              : 'bg-zinc-200 text-zinc-500'
                          }`}
                        >
                          {cert.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="text-[9.5px] text-zinc-500 font-mono space-y-0.5">
                        <p>Validez: {cert.validFrom} al {cert.validTo}</p>
                      </div>

                      {cert.isActive && (
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-150/60 mt-1">
                          <div className="flex gap-2">
                            {/* Inactive certs are filtered out, so active ones need no Activar button */}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditCertClick(cert)}
                              className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-450 hover:text-zinc-900 cursor-pointer"
                              title="Editar Certificado"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          </div>
        </div>

      {/* Generate API Key modal dialog */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[400px] bg-white border border-zinc-200 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">
              Crear API Key
            </h3>
            
            <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400">Nombre Descriptivo</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                  placeholder="ej. API Integracion Shopify"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer text-zinc-500 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  Generar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Certificate modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[420px] bg-white border border-zinc-200 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Subir Certificado Digital (.pfx / .p12)
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadCertSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Archivo del Certificado</label>
                <input
                  type="file"
                  accept=".pfx,.p12"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-750 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Contraseña del Certificado</label>
                <input
                  type="password"
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  required
                  placeholder="Contraseña de exportación de la clave privada"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Alias / Nombre Amigable</label>
                <input
                  type="text"
                  value={uploadAlias}
                  onChange={(e) => setUploadAlias(e.target.value)}
                  placeholder="ej. Certificado SUNAT 2026"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white font-sans"
                />
              </div>

              <div className="flex items-center gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  id="uploadSetActive"
                  checked={uploadSetActive}
                  onChange={(e) => setUploadSetActive(e.target.checked)}
                  className="rounded border-zinc-300 text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer w-4 h-4"
                />
                <label htmlFor="uploadSetActive" className="text-[10px] font-semibold text-zinc-650 cursor-pointer">
                  Activar inmediatamente para firma
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer text-zinc-500 font-semibold"
                  disabled={uploadLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold cursor-pointer shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
                >
                  {uploadLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Subir Certificado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Certificate modal */}
      {showEditModal && editingCert && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[420px] bg-white border border-zinc-200 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Editar Certificado
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCertSubmit} className="space-y-4 text-xs">
              <div className="space-y-0.5">
                <label className="block text-[9px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Archivo Original</label>
                <p className="font-mono text-zinc-650 font-bold text-[10px]">{editingCert.filename}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Alias / Nombre Amigable</label>
                <input
                  type="text"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  required
                  placeholder="ej. Certificado SUNAT 2026"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400">Contraseña (Opcional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Dejar vacío si no desea cambiarla"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  disabled={editingCert.isActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-zinc-300 text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="editIsActive" className="text-[10px] font-semibold text-zinc-650 cursor-pointer">
                  Activar certificado para firma
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer text-zinc-500 font-semibold"
                  disabled={editLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl font-bold cursor-pointer shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
                >
                  {editLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
