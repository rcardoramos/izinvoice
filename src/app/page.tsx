'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { BillingApiClient } from '@/services/api-client';
import { ArrowRight, ShieldCheck, Terminal, AlertCircle, Building2, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setSession, isAuthenticated } = useAuthStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await BillingApiClient.login({ username, password });
      setSession(res.accessToken, res.user, res.company);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-zinc-900 flex items-center justify-center p-6 dot-grid select-none relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] bg-white border border-zinc-200 rounded-2xl p-8 shadow-xl relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#4f46e5] flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-sm">
            IZ
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-zinc-900 text-base">IZINVOCE</h1>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase">Fintech Billing SaaS</p>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">Iniciar Sesión</h2>
          <p className="text-xs text-zinc-500 font-medium">Emita comprobantes electrónicos conectados con SUNAT</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-rose-550/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2 text-rose-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/35"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 bg-white focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/35"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.98] transition-all rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Ingresar'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Credentials Presets */}
        <div className="mt-8 pt-6 border-t border-zinc-150">
          <p className="text-[10px] text-zinc-400 font-bold mb-3 uppercase tracking-wider">Perfiles de Demostración</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => selectPreset('admin', 'admin123')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors cursor-pointer"
            >
              <span className="text-[9px] font-bold text-zinc-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4f46e5] shrink-0" /> Admin
              </span>
              <span className="text-[8px] text-zinc-500 font-mono mt-1">admin123</span>
            </button>

            <button
              onClick={() => selectPreset('operador', 'operador123')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors cursor-pointer"
            >
              <span className="text-[9px] font-bold text-zinc-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Operario
              </span>
              <span className="text-[8px] text-zinc-500 font-mono mt-1">operador123</span>
            </button>

            <button
              onClick={() => selectPreset('invoiceflow', 'invoiceflow123')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors cursor-pointer"
            >
              <span className="text-[9px] font-bold text-zinc-700 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-650 shrink-0" /> SaaS HQ
              </span>
              <span className="text-[8px] text-zinc-500 font-mono mt-1">invoiceflow123</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
