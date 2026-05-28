'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { BillingApiClient } from '@/services/api-client';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  Package, 
  Layers, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  ShieldCheck,
  Building2,
  Terminal,
  Receipt
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, company, clearSession, updateCompanyEnv } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  const changeEnv = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const env = e.target.value as any;
    updateCompanyEnv(env);
    
    // Attempt updating in background mock if needed, but Zustand updates state immediately
    if (company) {
      try {
        await BillingApiClient.updateProduct(company.id, { sunatEnvironment: env });
      } catch (err) {}
    }
  };

  const rawLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Nueva Boleta', path: '/dashboard/boletas/new', icon: <Receipt className="w-4 h-4" /> },
    { name: 'Historial Docs', path: '/dashboard/invoices', icon: <FileText className="w-4 h-4" /> },
    { name: 'Clientes', path: '/dashboard/customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Productos', path: '/dashboard/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Resúmenes SUNAT', path: '/dashboard/daily-summaries', icon: <Layers className="w-4 h-4" /> },
    { name: 'Configuración', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const isSaaSAdmin = user?.role === 'super_admin';

  const links = isSaaSAdmin
    ? [
        { name: 'Dashboard SaaS', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Empresas Clientes', path: '/dashboard/companies', icon: <Building2 className="w-4 h-4" /> },
      ]
    : rawLinks;

  if (!user || (!company && !isSaaSAdmin)) return null;

  return (
    <aside className="w-64 bg-white text-zinc-700 flex flex-col border-r border-zinc-200 shrink-0 h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
          IZ
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900 tracking-tight text-sm">IZINVOCE</h1>
          <p className="text-[10px] text-zinc-400 font-sans font-semibold">MindDev</p>
        </div>
      </div>

      {/* Profile Info (Tenant / SaaS Admin) */}
      {isSaaSAdmin ? (
        <div className="p-4 mx-4 my-3 rounded-xl bg-zinc-50 border border-zinc-150">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4f46e5] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">IZINVOCE HQ</p>
              <p className="text-[10px] text-zinc-500">Control Global</p>
            </div>
          </div>
        </div>
      ) : company ? (
        <div className="p-4 mx-4 my-3 rounded-xl bg-zinc-50 border border-zinc-150">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Building2 className="w-4 h-4 text-zinc-500" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{company.businessName}</p>
              <p className="text-[10px] text-zinc-500 font-mono">RUC: {company.ruc}</p>
            </div>
          </div>

          {/* Environment Switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-zinc-200">
            <Terminal className="w-3.5 h-3.5 text-[#4f46e5]" />
            <select
              value={company.sunatEnvironment}
              onChange={changeEnv}
              className="w-full bg-transparent border-0 text-[10px] font-mono text-zinc-600 focus:ring-0 cursor-pointer p-0"
            >
              <option value="beta" className="bg-white text-zinc-700">SUNAT Beta (Pruebas)</option>
              <option value="homologacion" className="bg-white text-zinc-700">SUNAT Homologación</option>
              <option value="production" className="bg-white text-red-500 font-semibold">SUNAT Producción</option>
            </select>
          </div>
        </div>
      ) : null}

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1 py-3 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/10'
                  : 'hover:bg-[#eef2ff] hover:text-[#4f46e5] text-zinc-600'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-150 mt-auto">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700 uppercase shrink-0">
              {user.username.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">{user.fullName ?? user.username}</p>
              <p className="text-[9px] text-zinc-500 capitalize leading-none mt-1">{user.role?.replace('_', ' ') ?? 'usuario'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl border border-zinc-250 text-zinc-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer bg-white shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
