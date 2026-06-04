'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { BillingApiClient } from '@/services/api-client';
import { ArrowRight, AlertCircle, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { setSession, isAuthenticated } = useAuthStore();
  const [ruc, setRuc] = useState('20000000001');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberRuc, setRememberRuc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'empresa' | 'admin'>('empresa');

  // Load remembered RUC from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRuc = localStorage.getItem('remembered-ruc');
      if (savedRuc) {
        setRuc(savedRuc);
        setRememberRuc(true);
      }
    }
  }, []);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Tab switching presets
  const handleTabChange = (tab: 'empresa' | 'admin') => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'empresa') {
      setRuc('20000000001');
      setUsername('admin');
      setPassword('admin123');
    } else {
      setRuc('');
      setUsername('invoiceflow');
      setPassword('invoiceflow123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await BillingApiClient.login({ ruc: ruc || undefined, username, password });
      
      if (typeof window !== 'undefined') {
        if (rememberRuc && ruc) {
          localStorage.setItem('remembered-ruc', ruc);
        } else {
          localStorage.removeItem('remembered-ruc');
        }
      }

      // Normalize user object
      const normalizedUser = {
        id: res.user?.id || '',
        username: res.user?.username || username,
        fullName: res.user?.fullName || res.user?.username || username,
        email: res.user?.email || null,
        role: (res.user?.role as 'super_admin' | 'admin') || 'admin',
      };
      setSession(res.accessToken, normalizedUser, res.company);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f8fafc] to-[#e0e7ff] text-zinc-900 flex relative overflow-hidden font-sans">
      
      {/* Background Abstract Gradients (Similar to reference image) */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#4f46e5]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#38bdf8]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Decorative Wave */}
      <div className="absolute top-1/2 left-0 w-full h-[600px] -translate-y-1/2 opacity-30 pointer-events-none blur-[80px] bg-gradient-to-r from-transparent via-[#4f46e5] to-[#818cf8] transform -rotate-12 mix-blend-multiply" />

      <div className="flex-1 flex w-full max-w-[1440px] mx-auto z-10">
        
        {/* LEFT SIDE: Brand & Graphics */}
        <div className="hidden lg:flex flex-col justify-center flex-1 p-16 xl:p-24 relative">
          
          {/* Floating Dialogue Bubbles */}
          <div className="relative mb-16 space-y-3 opacity-90 pointer-events-none z-20">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl rounded-tl-sm text-xs font-semibold text-indigo-900 shadow-sm w-fit"
            >
              Hola, bienvenido de vuelta 👋
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-2xl rounded-tl-sm text-xs font-semibold text-indigo-900 shadow-sm w-fit"
            >
              Inicia sesión para gestionar tus comprobantes electrónicos.
            </motion.div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="bg-[#4f46e5] p-4 rounded-[20px] flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <img src="/log.png" alt="Logo" className="h-12 w-auto object-contain brightness-0 invert" />
              </div>
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-[#1e1b4b] tracking-tighter leading-[1.1] max-w-md mb-6">
              Plataforma 100% segura y homologada
            </h1>
            <p className="text-lg xl:text-xl text-[#1e1b4b]/70 font-semibold tracking-tight max-w-md mb-8">
              Emite facturas, boletas, notas de crédito, débito y guías de remisión en segundos.
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap gap-3 max-w-md">
              <span className="bg-white/60 backdrop-blur-md border border-white/80 px-4 py-2 rounded-xl text-xs font-bold text-indigo-900 shadow-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Seguridad AWS
              </span>
              <span className="bg-white/60 backdrop-blur-md border border-white/80 px-4 py-2 rounded-xl text-xs font-bold text-indigo-900 shadow-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#4f46e5]" /> Soporte 24/7
              </span>
              <span className="bg-white/60 backdrop-blur-md border border-white/80 px-4 py-2 rounded-xl text-xs font-bold text-indigo-900 shadow-sm flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-[#4f46e5]" /> Conexión OSE/PSE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form Card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[460px] bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center mb-8">
              <div className="bg-[#4f46e5] p-3 rounded-[14px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <img src="/log.png" alt="Logo" className="h-7 w-auto object-contain brightness-0 invert" />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 mb-6">Iniciar Sesión</h2>
              
              {/* Custom Tabs */}
              <div className="flex items-center gap-6 border-b border-zinc-200/60 pb-0">
                <button 
                  type="button"
                  onClick={() => handleTabChange('empresa')}
                  className={`text-sm font-bold pb-3 -mb-[1px] transition-all flex items-center gap-2 ${activeTab === 'empresa' ? 'text-[#4f46e5] border-b-2 border-[#4f46e5]' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  <ShieldCheck className="w-4 h-4" /> Cuenta Empresa
                </button>
                <button 
                  type="button"
                  onClick={() => handleTabChange('admin')}
                  className={`text-sm font-bold pb-3 -mb-[1px] transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'text-[#4f46e5] border-b-2 border-[#4f46e5]' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  <UserCheck className="w-4 h-4" /> SaaS Admin
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-rose-600 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <AnimatePresence>
                {activeTab === 'empresa' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 py-1">
                      <input
                        type="text"
                        value={ruc}
                        onChange={(e) => setRuc(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-zinc-200/50 rounded-2xl px-5 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all placeholder:text-zinc-400 placeholder:font-medium"
                        placeholder="Número de RUC"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#f8fafc] border border-zinc-200/50 rounded-2xl px-5 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all placeholder:text-zinc-400 placeholder:font-medium"
                  placeholder="Usuario"
                />
              </div>

              <div className="space-y-1.5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#f8fafc] border border-zinc-200/50 rounded-2xl px-5 py-3.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all placeholder:text-zinc-400 placeholder:font-medium pr-12"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2 pb-4 select-none">
                <input
                  type="checkbox"
                  id="rememberRuc"
                  checked={rememberRuc}
                  onChange={(e) => setRememberRuc(e.target.checked)}
                  className="rounded border-zinc-300 text-[#4f46e5] focus:ring-[#4f46e5] cursor-pointer w-4 h-4 bg-[#f8fafc]"
                />
                <label htmlFor="rememberRuc" className="text-xs font-bold text-zinc-500 cursor-pointer">
                  Recordar <span className="text-[#4f46e5]">credenciales de acceso</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.98] transition-all rounded-2xl font-black text-xs text-white shadow-xl shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
