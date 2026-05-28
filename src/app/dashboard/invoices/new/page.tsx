'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { BillingApiClient } from '@/services/api-client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PdfViewer } from '@/components/shared/PdfViewer';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  FileCode, 
  Printer, 
  UserPlus, 
  PackagePlus,
  RefreshCw
} from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { AddClientModal } from './components/AddClientModal';
import { EmissionResultModal } from './components/EmissionResultModal';

export default function NewInvoicePage() {
  const router = useRouter();
  const { company } = useAuthStore();
  const { addNotification } = useAppStore();

  // Form State
  const [docType, setDocType] = useState<'01' | '03'>('01'); // 01 Factura, 03 Boleta
  const [serie, setSerie] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [formaPago, setFormaPago] = useState('CON'); // CON Contado, CRE Credito

  // Client Selection State
  const [clientDoc, setClientDoc] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientSearching, setClientSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // Product Catalog State
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Invoice Lines
  const [lines, setLines] = useState<any[]>([]);

  // Page Load Series Configuration
  const [availableSeries, setAvailableSeries] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Emission Result Modal State
  const [emissionLoading, setEmissionLoading] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [emittedDoc, setEmittedDoc] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingConfig(true);
        // Load registered series & products
        const [series, products] = await Promise.all([
          fetch('/api/v1/daily-summaries').then(() => {
            // Read series from FileDb simulation via direct call
            return BillingApiClient.listProducts(); // temporary read products
          }),
          BillingApiClient.listProducts(),
        ]);
        
        const productsData = Array.isArray(products) ? products : (products?.data ?? []);
        setProductsList(productsData);

        // Standard seed series mapping
        const seriesData = [
          { docType: '01', serie: 'F001' },
          { docType: '03', serie: 'B001' },
        ];
        setAvailableSeries(seriesData);
        setSerie('F001');
      } catch (err) {
        console.error('Error loading config', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    loadConfig();
  }, []);

  // Update default series prefix when docType changes
  useEffect(() => {
    setSerie(docType === '01' ? 'F001' : 'B001');
    // For Boletas (03), clear RUC check defaults
    if (docType === '03' && (selectedClient?.docType ?? selectedClient?.doc_type) === '6') {
      setSelectedClient(null);
      setClientDoc('');
    }
  }, [docType]);

  // Client DNI/RUC Autocomplete Search
  const searchClient = async () => {
    if (!clientDoc) return;
    setClientSearching(true);
    setSearchPerformed(true);
    try {
      const results = await BillingApiClient.findCustomerByDoc(clientDoc);
      if (results.length > 0) {
        setSelectedClient(results[0]);
      } else {
        setSelectedClient(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClientSearching(false);
    }
  };

  const handleClientRegistered = (created: any) => {
    setSelectedClient(created);
    setClientDoc(created.docNumber ?? created.doc_number);
    setSearchPerformed(true);
    
    addNotification({
      id: Math.random().toString(),
      title: 'Cliente Registrado',
      message: `Cliente ${created.legalName ?? created.razon_social} registrado y seleccionado para el comprobante.`,
      type: 'success',
      created_at: new Date().toISOString(),
    });
  };

  // Add Item Line to Invoice
  const handleAddItemLine = () => {
    if (!selectedProductId) return;
    const prod = productsList.find((p) => p.id === selectedProductId);
    if (!prod) return;

    // Check duplicate
    if (lines.some((l) => l.id === prod.id)) {
      alert('El producto ya se encuentra en las líneas del comprobante.');
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        id: prod.id,
        codigo: prod.code ?? prod.codigo,
        descripcion: prod.description ?? prod.nombre,
        cantidad: 1,
        precioUnitario: prod.unitPrice ?? prod.precio ?? 0,
      },
    ]);
    setSelectedProductId('');
  };

  // Modify line quantity
  const updateLineQty = (id: string, qty: number) => {
    if (qty < 0.01) return;
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, cantidad: parseFloat(qty.toFixed(2)) } : l))
    );
  };

  // Modify line unit price
  const updateLinePrice = (id: string, price: number) => {
    if (price < 0) return;
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, precioUnitario: parseFloat(price.toFixed(2)) } : l))
    );
  };

  // Remove line item
  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Calculate Totals
  const subtotal = lines.reduce((sum, line) => sum + line.cantidad * line.precioUnitario, 0);
  const igvTotal = subtotal * 0.18;
  const total = subtotal + igvTotal;

  // Submit invoice to SUNAT API
  const handleEmitComprobante = async () => {
    if (!selectedClient) {
      alert('Debe seleccionar o registrar un cliente antes de emitir.');
      return;
    }

    if (docType === '01' && (selectedClient.docType ?? selectedClient.doc_type) !== '6') {
      alert('Las Facturas requieren un cliente con RUC válido.');
      return;
    }

    if (lines.length === 0) {
      alert('Debe agregar al menos un producto a las líneas del comprobante.');
      return;
    }

    setEmissionLoading(true);
    setApiError(null);
    setResultModalOpen(true);

    try {
      const clientPayload = {
        tipoDoc: selectedClient.docType ?? selectedClient.doc_type,
        numDoc: selectedClient.docNumber ?? selectedClient.doc_number,
        razonSocial: selectedClient.legalName ?? selectedClient.razon_social,
        direccion: selectedClient.address ?? selectedClient.direccion,
        correo: selectedClient.email ?? selectedClient.correo,
        telefono: selectedClient.phone ?? selectedClient.telefono,
      };

      const itemsPayload = lines.map((l) => ({
        codigo: l.codigo,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
      }));

      let res: any = null;

      if (docType === '01') {
        res = await BillingApiClient.createInvoice({
          serie,
          tipoOperacion: '0101',
          moneda,
          cliente: clientPayload,
          items: itemsPayload,
          formaPago,
        });
      } else {
        res = await BillingApiClient.createBoleta({
          serie,
          moneda,
          cliente: clientPayload,
          items: itemsPayload,
          formaPago,
        });
      }

      setEmittedDoc(res);
    } catch (err: any) {
      setApiError(err.message || 'Ocurrió un error al procesar el comprobante electrónico.');
    } finally {
      setEmissionLoading(false);
    }
  };

  const closeOutcomeModal = () => {
    setResultModalOpen(false);
    setEmittedDoc(null);
    setApiError(null);
    // Reset wizard
    setLines([]);
    setClientDoc('');
    setSelectedClient(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader 
        title="Nuevo Comprobante Electrónico" 
        subtitle="Emisión autorizada de Facturas, Boletas y Notas SUNAT"
      />

      <div className="p-8 space-y-6 max-w-5xl w-full mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Setup / Document configurations panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header config block */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Datos del Comprobante</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1 tracking-wide">Tipo de Doc</label>
                  <select
                    value={docType}
                    onChange={(e: any) => setDocType(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-300"
                  >
                    <option value="01">Factura</option>
                    <option value="03">Boleta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1 tracking-wide">Serie</label>
                  <select
                    value={serie}
                    onChange={(e: any) => setSerie(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-300"
                  >
                    {availableSeries
                      .filter((s) => s.docType === docType)
                      .map((s) => (
                        <option key={s.serie} value={s.serie}>{s.serie}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1 tracking-wide">Moneda</label>
                  <select
                    value={moneda}
                    onChange={(e: any) => setMoneda(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-300"
                  >
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1 tracking-wide">Pago</label>
                  <select
                    value={formaPago}
                    onChange={(e: any) => setFormaPago(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-300"
                  >
                    <option value="CON">Contado</option>
                    <option value="CRE">Crédito</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Invoicing Lines / Items adding grid */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Líneas del Comprobante</h3>
              </div>

              {/* Add product to lines selector */}
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-zinc-900 dark:text-zinc-300"
                >
                  <option value="">-- Seleccionar producto del catálogo --</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code ?? p.codigo}] {p.description ?? p.nombre} - S/ {(p.unitPrice ?? p.precio ?? 0).toFixed(2)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddItemLine}
                  disabled={!selectedProductId}
                  className="px-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {/* Lines Table representation */}
              <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800/80 text-[10px] text-zinc-500 font-semibold uppercase">
                      <th className="p-3 w-16">Código</th>
                      <th className="p-3">Detalle</th>
                      <th className="p-3 text-center w-20">Cant.</th>
                      <th className="p-3 text-right w-28">P. Unitario</th>
                      <th className="p-3 text-right w-24">Importe</th>
                      <th className="p-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {lines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-400">
                          Agregue productos del catálogo para comenzar.
                        </td>
                      </tr>
                    ) : (
                      lines.map((line) => (
                        <tr key={line.id}>
                          <td className="p-3 font-mono text-[10px] text-zinc-500">{line.codigo}</td>
                          <td className="p-3 font-semibold text-zinc-900 dark:text-white">{line.descripcion}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={line.cantidad}
                              onChange={(e) => updateLineQty(line.id, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-center font-mono"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={line.precioUnitario}
                              onChange={(e) => updateLinePrice(line.id, parseFloat(e.target.value) || 0)}
                              className="w-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-right font-mono"
                            />
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            S/ {(line.cantidad * line.precioUnitario).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => removeLine(line.id)}
                              className="text-rose-500 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Client Search and Totals Panel */}
          <div className="space-y-6">
            
            {/* Client registry section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Cliente Adquiriente</h3>
                <button
                  onClick={() => setShowAddClientModal(true)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Registrar
                </button>
              </div>

              {/* Client doc lookups search */}
              <div className="flex gap-2">
                <SearchInput
                  value={clientDoc}
                  onChange={(e) => {
                    setClientDoc(e.target.value);
                    setSearchPerformed(false);
                    setSelectedClient(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && searchClient()}
                  placeholder={docType === '01' ? 'Ingrese RUC...' : 'RUC o DNI...'}
                />
                <button
                  onClick={searchClient}
                  disabled={clientSearching || !clientDoc}
                  className="px-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
                >
                  {clientSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>

              {/* Autofilled client details card */}
              {selectedClient ? (
                <div className="p-3 bg-blue-500/[0.02] border border-blue-500/10 rounded-xl space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <p className="font-bold text-zinc-900 dark:text-white">
                    {selectedClient.legalName ?? selectedClient.razon_social}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-400">
                    {(selectedClient.docType ?? selectedClient.doc_type) === '6' ? 'RUC' : 'DNI'}: {selectedClient.docNumber ?? selectedClient.doc_number}
                  </p>
                  {(selectedClient.address ?? selectedClient.direccion) && (
                    <p className="text-[10px] text-zinc-400 truncate">{selectedClient.address ?? selectedClient.direccion}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
                    <Check className="w-3.5 h-3.5" /> Autocompletado
                  </div>
                </div>
              ) : clientDoc && searchPerformed && !clientSearching ? (
                <div className="p-3 border border-yellow-500/10 bg-yellow-500/[0.02] rounded-xl flex items-center justify-between text-xs text-amber-600/90 font-medium">
                  <span>Cliente no registrado</span>
                  <button
                    onClick={() => setShowAddClientModal(true)}
                    className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold hover:bg-amber-500/20 transition-colors cursor-pointer"
                  >
                    Registrar
                  </button>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
                  Ingrese RUC/DNI para vincular cliente.
                </div>
              )}
            </div>

            {/* Calculations and Actions panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Cálculo e Importes</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-400">Op. Gravada</span>
                  <span className="font-mono">S/ {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-400">I.G.V. (18%)</span>
                  <span className="font-mono">S/ {igvTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-white pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Importe Total</span>
                  <span className="font-mono text-blue-500">S/ {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Emission action trigger */}
              <button
                onClick={handleEmitComprobante}
                disabled={lines.length === 0 || !selectedClient}
                className="w-full py-3 bg-blue-700 enabled:hover:bg-blue-800 enabled:active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-700/15 transition-all disabled:cursor-not-allowed enabled:cursor-pointer"
              >
                Emitir {docType === '01' ? 'Factura' : 'Boleta'} Electrónica
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSubmitSuccess={handleClientRegistered}
        initialDocNumber={clientDoc}
        initialDocType={clientDoc.length === 11 ? '6' : '1'}
      />

      <EmissionResultModal
        isOpen={resultModalOpen}
        onClose={closeOutcomeModal}
        emissionLoading={emissionLoading}
        apiError={apiError}
        emittedDoc={emittedDoc}
        docType={docType}
        serie={serie}
        selectedClient={selectedClient}
        lines={lines}
        subtotal={subtotal}
        igvTotal={igvTotal}
        total={total}
        company={company}
      />
    </div>
  );
}
