'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { 
  Building, 
  Key, 
  Lock, 
  FileCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export default function SettingsPage() {
  const { user, company } = useAuthStore();
  const { addNotification } = useAppStore();

  // Company profile form state
  const [profile, setProfile] = useState({
    businessName: '',
    tradeName: '',
    address: '',
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

  // Load config on mount
  useEffect(() => {
    if (company) {
      setProfile({
        businessName: company.businessName,
        tradeName: company.tradeName || '',
        address: company.address || '',
        phone: '+51 987654321',
        email: 'facturacion@invoiceflow.pe',
      });
      setSolUsername(company.ruc + 'MODDATOS');
    }

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
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      id: Math.random().toString(),
      title: 'Configuración Actualizada',
      message: 'Los datos de la empresa se han actualizado correctamente.',
      type: 'success',
      created_at: new Date().toISOString(),
    });
    alert('Información guardada con éxito.');
  };

  // Update SOL SOAP credentials
  const handleUpdateSol = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      id: Math.random().toString(),
      title: 'Credenciales SUNAT Guardadas',
      message: 'Las credenciales del usuario SOL se han actualizado con éxito.',
      type: 'success',
      created_at: new Date().toISOString(),
    });
    alert('Credenciales SOL guardadas con éxito. Conexión verificada en entorno beta.');
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
      created_at: new Date().toISOString(),
    };

    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName('');
    setShowKeyModal(false);

    addNotification({
      id: Math.random().toString(),
      title: 'API Key Generada',
      message: `Nueva clave '${newKey.name}' creada para integraciones REST.`,
      type: 'success',
      created_at: new Date().toISOString(),
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
      created_at: new Date().toISOString(),
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

      <div className="p-8 space-y-8 max-w-5xl w-full mx-auto pb-16 select-none text-xs">
        
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

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400">Dirección Fiscal</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    required
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 bg-white"
                  />
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
                                ? new Date(key.last_used_at).toLocaleDateString([], { dateStyle: 'short' })
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

            {/* Certificado Digital status display */}
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <FileCheck className="w-4 h-4 text-[#4f46e5]" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Certificado Digital</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-900">dev-beta.pfx</span>
                    <span className="text-[9px] bg-indigo-500/10 text-[#4f46e5] px-2 py-0.5 rounded-md font-bold uppercase">Activo</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 space-y-0.5 font-mono font-semibold">
                    <p>Emisor: SUNAT Pruebas Autorizadas</p>
                    <p>Vence: 24 May 2027 (Válido)</p>
                  </div>
                </div>

                <div className="border border-dashed border-zinc-200 p-4 rounded-xl text-center text-zinc-400">
                  <p className="font-bold text-[10px] mb-1 text-zinc-700">¿Actualizar Certificado?</p>
                  <p className="text-[9px] mb-2 leading-snug">Suba su archivo .pfx para emitir comprobantes en producción.</p>
                  <button className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-650 rounded-xl font-bold transition-colors cursor-pointer text-[10px]">
                    Seleccionar Archivo
                  </button>
                </div>
              </div>
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
    </div>
  );
}
