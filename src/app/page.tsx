'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { BillingApiClient } from '@/services/api-client';
import { ArrowRight, ShieldCheck, Terminal, AlertCircle, Building2 } from 'lucide-react';

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
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 dot-grid select-none relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-sm">
            IF
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white text-base">INVOICEFLOW</h1>
            <p className="text-[10px] text-zinc-500 font-mono">FINTECH BILLING SaaS</p>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Iniciar Sesión</h2>
          <p className="text-xs text-zinc-400">Emita comprobantes electrónicos conectados con SUNAT</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1.5 tracking-wider">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/35"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-zinc-500 mb-1.5 tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/35"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-xl font-medium text-xs text-white shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Ingresar'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Credentials Presets */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-semibold mb-3 uppercase tracking-wider">Perfiles de Demostración</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => selectPreset('admin', 'admin123')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 text-left transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Admin
              </span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">admin / admin123</span>
            </button>

            <button
              onClick={() => selectPreset('operador', 'operador123')}
              className="flex flex-col items-start p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 text-left transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Operador
              </span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">operador / operador123</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
