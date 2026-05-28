'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { BillingApiClient } from '@/services/api-client';
import { 
  Search, 
  FileText, 
  PlusCircle, 
  Users, 
  Package, 
  Layers, 
  Settings, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function SearchCommand() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ customers: any[]; products: any[]; documents: any[] }>({
    customers: [],
    products: [],
    documents: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Monitor Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setResults({ customers: [], products: [], documents: [] });
    }
  }, [commandPaletteOpen]);

  // Search trigger on query modification
  useEffect(() => {
    if (!query) {
      setResults({ customers: [], products: [], documents: [] });
      return;
    }

    const triggerSearch = async () => {
      try {
        const promises = [
          BillingApiClient.listCustomers(query),
          BillingApiClient.listProducts(query),
          BillingApiClient.listDocuments({ search: query }),
        ];
        
        const [cRes, pRes, dRes] = await Promise.all(promises);
        const customers = Array.isArray(cRes) ? cRes : (cRes?.data ?? []);
        const products = Array.isArray(pRes) ? pRes : (pRes?.data ?? []);
        const documents = Array.isArray(dRes) ? dRes : (dRes?.data ?? []);
        setResults({
          customers: customers.slice(0, 3),
          products: products.slice(0, 3),
          documents: documents.slice(0, 3),
        });
      } catch (err) {}
    };

    const delayDebounce = setTimeout(triggerSearch, 200);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  const hasResults = results.customers.length > 0 || results.products.length > 0 || results.documents.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24 select-none">
      <div className="w-[550px] bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Search input header */}
        <div className="p-4 border-b border-zinc-150 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca clientes, productos, comprobantes o comandos..."
            className="flex-1 bg-transparent border-0 text-sm focus:ring-0 text-zinc-900 placeholder-zinc-400 p-0 focus:outline-none"
          />
          <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 font-mono text-zinc-400">ESC</span>
        </div>

        {/* Command list content */}
        <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 p-2">
          {/* Action/Comando suggestions */}
          {!query && (
            <div className="p-2 space-y-1">
              <p className="text-[10px] text-zinc-400 font-semibold px-2 mb-2 uppercase tracking-wider">Comandos Rápidos</p>
              
              <button
                onClick={() => handleNavigate('/dashboard')}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/70 hover:text-[#4f46e5] text-left text-xs text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                  <span>Ir al Dashboard</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleNavigate('/dashboard/invoices/new')}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/70 hover:text-[#4f46e5] text-left text-xs text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-[#4f46e5]" />
                  <span>Emitir Nuevo Comprobante</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleNavigate('/dashboard/invoices')}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/70 hover:text-[#4f46e5] text-left text-xs text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#4f46e5]" />
                  <span>Ver Historial de Documentos</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleNavigate('/dashboard/daily-summaries')}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/70 hover:text-[#4f46e5] text-left text-xs text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#4f46e5]" />
                  <span>Ver Resúmenes Diarios (RC/RA)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => handleNavigate('/dashboard/settings')}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/70 hover:text-[#4f46e5] text-left text-xs text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#4f46e5]" />
                  <span>Configuración del Sistema</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          )}

          {/* Search query results */}
          {query && (
            <div className="p-2 space-y-4">
              {!hasResults && (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No se encontraron resultados para "{query}"
                </div>
              )}

              {/* Customers search results */}
              {results.customers.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-400 font-semibold px-2 mb-1.5 uppercase tracking-wider">Clientes</p>
                  {results.customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleNavigate(`/dashboard/customers`)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/50 hover:text-[#4f46e5] text-left text-xs text-zinc-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-zinc-400" />
                        <div>
                          <p className="font-semibold text-zinc-900 leading-none">{c.razon_social}</p>
                          <p className="text-[9px] text-zinc-400 mt-1 font-mono">{c.doc_type === '6' ? 'RUC' : 'DNI'}: {c.doc_number}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Products search results */}
              {results.products.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-400 font-semibold px-2 mb-1.5 uppercase tracking-wider">Productos</p>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleNavigate(`/dashboard/products`)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/50 hover:text-[#4f46e5] text-left text-xs text-zinc-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        <div>
                          <p className="font-semibold text-zinc-900 leading-none">{p.nombre}</p>
                          <p className="text-[9px] text-zinc-400 mt-1 font-mono">Cod: {p.codigo} · Precio: PEN {p.precio.toFixed(2)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Documents search results */}
              {results.documents.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-400 font-semibold px-2 mb-1.5 uppercase tracking-wider">Comprobantes</p>
                  {results.documents.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleNavigate(`/dashboard/invoices`)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/50 hover:text-[#4f46e5] text-left text-xs text-zinc-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <div>
                          <p className="font-semibold text-zinc-900 leading-none">{d.serie}-{d.correlativo}</p>
                          <p className="text-[9px] text-zinc-400 mt-1 font-mono">
                            {d.payload?.cliente?.razonSocial} · PEN {d.total.toFixed(2)} · {d.status}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Command palette keyboard helper footer */}
        <div className="p-3 border-t border-zinc-150 bg-zinc-50/55 flex items-center justify-between text-[10px] text-zinc-400">
          <div className="flex items-center gap-4">
            <span>↑↓ para navegar</span>
            <span>↵ para seleccionar</span>
          </div>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="hover:underline cursor-pointer"
          >
            Cerrar Paleta
          </button>
        </div>
      </div>
    </div>
  );
}
