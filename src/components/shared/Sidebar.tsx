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
  Terminal
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
    { name: 'Nuevo Comprobante', path: '/dashboard/invoices/new', icon: <PlusCircle className="w-4 h-4" /> },
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
    : rawLinks.filter((link) => {
        if (user?.role === 'operator') {
          return ['Nuevo Comprobante', 'Historial Docs', 'Clientes'].includes(link.name);
        }
        return true;
      });

  if (!user || (!company && !isSaaSAdmin)) return null;

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800 shrink-0 h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          IF
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-tight text-sm">INVOICEFLOW</h1>
          <p className="text-[10px] text-zinc-500 font-mono font-medium">SaaS FE PREMIUM</p>
        </div>
      </div>

      {/* Profile Info (Tenant / SaaS Admin) */}
      {isSaaSAdmin ? (
        <div className="p-4 mx-4 my-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">INVOICEFLOW HQ</p>
              <p className="text-[10px] text-zinc-500 font-mono">Control Global</p>
            </div>
          </div>
        </div>
      ) : company ? (
        <div className="p-4 mx-4 my-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Building2 className="w-4 h-4 text-zinc-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{company.businessName}</p>
              <p className="text-[10px] text-zinc-500 font-mono">RUC: {company.ruc}</p>
            </div>
          </div>

          {/* Environment Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800/40">
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <select
              value={company.sunatEnvironment}
              onChange={changeEnv}
              className="w-full bg-transparent border-0 text-[10px] font-mono text-zinc-400 focus:ring-0 cursor-pointer p-0"
            >
              <option value="beta" className="bg-zinc-900 text-zinc-300">SUNAT Beta (Pruebas)</option>
              <option value="homologacion" className="bg-zinc-900 text-zinc-300">SUNAT Homologación</option>
              <option value="production" className="bg-zinc-900 text-red-400">SUNAT Producción</option>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'hover:bg-zinc-900 hover:text-white text-zinc-400'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.username.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{user.fullName}</p>
              <p className="text-[9px] text-zinc-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-zinc-800 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
