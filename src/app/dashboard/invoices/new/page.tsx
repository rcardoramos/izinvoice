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
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // New Client Form
  const [newClient, setNewClient] = useState({
    docType: '6',
    docNumber: '',
    razonSocial: '',
    direccion: '',
    correo: '',
    telefono: '',
  });

  // Product Inventory State
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Product Form
  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    igvRate: '18.00',
  });

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
        
        setProductsList(products);

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
    if (docType === '03' && selectedClient?.doc_type === '6') {
      setSelectedClient(null);
      setClientDoc('');
    }
  }, [docType]);

  // Client DNI/RUC Autocomplete Search
  const searchClient = async () => {
    if (!clientDoc) return;
    setClientSearching(true);
    try {
      const results = await BillingApiClient.findCustomerByDoc(clientDoc);
      if (results.length > 0) {
        setSelectedClient(results[0]);
      } else {
        // Preset client number in new customer form
        setNewClient((prev) => ({
          ...prev,
          docType: clientDoc.length === 11 ? '6' : '1',
          docNumber: clientDoc,
        }));
        setSelectedClient(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClientSearching(false);
    }
  };

  // Add client inline without leaving flow
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await BillingApiClient.createCustomer(newClient);
      setSelectedClient(created);
      setClientDoc(created.doc_number);
      setShowAddClientModal(false);
      
      // Clear client form
      setNewClient({
        docType: '6',
        docNumber: '',
        razonSocial: '',
        direccion: '',
        correo: '',
        telefono: '',
      });
      
      addNotification({
        id: Math.random().toString(),
        title: 'Cliente Registrado',
        message: `Cliente ${created.razon_social} registrado y seleccionado para el comprobante.`,
        type: 'success',
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(err.message || 'Error al guardar cliente');
    }
  };

  // Add product inline
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await BillingApiClient.createProduct(newProduct);
      setProductsList((prev) => [...prev, created]);
      setSelectedProductId(created.id);
      setShowAddProductModal(false);
      
      // Clear product form
      setNewProduct({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        igvRate: '18.00',
      });
      
      addNotification({
        id: Math.random().toString(),
        title: 'Producto Registrado',
        message: `Producto '${created.nombre}' agregado al catálogo de la empresa.`,
        type: 'success',
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(err.message || 'Error al guardar producto');
    }
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
        codigo: prod.codigo,
        descripcion: prod.nombre,
        cantidad: 1,
        precioUnitario: prod.precio,
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

    if (docType === '01' && selectedClient.doc_type !== '6') {
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
        tipoDoc: selectedClient.doc_type,
        numDoc: selectedClient.doc_number,
        razonSocial: selectedClient.razon_social,
        direccion: selectedClient.direccion,
        correo: selectedClient.correo,
        telefono: selectedClient.telefono,
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
                      [{p.codigo}] {p.nombre} - S/ {p.precio.toFixed(2)}
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={clientDoc}
                    onChange={(e) => setClientDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchClient()}
                    placeholder={docType === '01' ? 'Ingrese RUC...' : 'RUC o DNI...'}
                    style={{ paddingLeft: '2.5rem' }}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
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
                  <p className="font-bold text-zinc-900 dark:text-white">{selectedClient.razon_social}</p>
                  <p className="font-mono text-[10px] text-zinc-400">
                    {selectedClient.doc_type === '6' ? 'RUC' : 'DNI'}: {selectedClient.doc_number}
                  </p>
                  {selectedClient.direccion && (
                    <p className="text-[10px] text-zinc-400 truncate">{selectedClient.direccion}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
                    <Check className="w-3.5 h-3.5" /> Autocompletado
                  </div>
                </div>
              ) : clientDoc && !clientSearching ? (
                <div className="p-3 border border-yellow-500/10 bg-yellow-500/[0.02] rounded-xl flex items-center justify-between text-xs text-amber-600/90 font-medium">
                  <span>Cliente no registrado</span>
                  <button
                    onClick={() => {
                      setNewClient((prev) => ({
                        ...prev,
                        docType: clientDoc.length === 11 ? '6' : '1',
                        docNumber: clientDoc,
                      }));
                      setShowAddClientModal(true);
                    }}
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

      {/* 1. Registrar Cliente Inline Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Registrar Cliente
            </h3>
            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Tipo Doc</label>
                  <select
                    value={newClient.docType}
                    onChange={(e) => setNewClient({ ...newClient, docType: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  >
                    <option value="1">DNI (1)</option>
                    <option value="6">RUC (6)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Nro Documento</label>
                  <input
                    type="text"
                    value={newClient.docNumber}
                    onChange={(e) => setNewClient({ ...newClient, docNumber: e.target.value })}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Razón Social / Nombre Completo</label>
                <input
                  type="text"
                  value={newClient.razonSocial}
                  onChange={(e) => setNewClient({ ...newClient, razonSocial: e.target.value })}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  value={newClient.direccion}
                  onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={newClient.correo}
                    onChange={(e) => setNewClient({ ...newClient, correo: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newClient.telefono}
                    onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer text-zinc-500 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-sm transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
             {/* 3. Post-Emission Result / Receipt outcome Modal */}
      {resultModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto select-none print:bg-white print:p-0 print:block print:static print:z-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:border-none print:shadow-none print:my-0 print:max-w-none print:bg-white">
            
            {/* Outcome banner */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-3">
                {emissionLoading ? (
                  <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                ) : apiError ? (
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                ) : (
                  <Check className="w-6 h-6 text-emerald-500" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    {emissionLoading ? 'Procesando Firma y Emisión...' : apiError ? 'Error de Emisión' : 'Comprobante Emitido'}
                  </h3>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-500 font-mono">
                    {emissionLoading ? 'Negociando con servidores SUNAT...' : apiError ? 'Error devuelto por la API SUNAT' : `Documento registrado con éxito.`}
                  </p>
                </div>
              </div>
              
              {!emissionLoading && (
                <button
                  onClick={closeOutcomeModal}
                  className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350 cursor-pointer"
                >
                  Cerrar
                </button>
              )}
            </div>

            {/* Content box */}
            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 flex-1 max-h-[90vh] overflow-y-auto space-y-6 print:p-0 print:bg-white print:max-h-none print:overflow-visible">
              {emissionLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Generando UBL XML, firmando digitalmente y enviando...</p>
                </div>
              ) : apiError ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex gap-2 items-center text-rose-500 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error al enviar a SUNAT</span>
                  </div>
                  <p className="text-rose-600 dark:text-rose-400 leading-snug">{apiError}</p>
                  <p className="text-[10px] text-zinc-500 pt-2 font-mono">Verifique el ambiente SUNAT o consulte en los registros de bajas.</p>
                </div>
              ) : emittedDoc ? (
                <div className="space-y-6">
                  {/* Status Badges & Quick actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
                    <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-2 text-xs">
                      <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Resultado Transacción</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-white">{emittedDoc.serie}-{emittedDoc.correlativo}</span>
                        <StatusBadge status={emittedDoc.status} />
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-snug">
                        {emittedDoc.sunat?.description || emittedDoc.message || 'El comprobante ha sido registrado.'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                      <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Archivos Digitales</p>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <a
                          href={BillingApiClient.getXmlUrl(emittedDoc.id)}
                          download
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          <FileCode className="w-4 h-4 text-blue-500" /> XML UBL
                        </a>
                        {emittedDoc.status === 'accepted' ? (
                          <a
                            href={BillingApiClient.getCdrUrl(emittedDoc.id)}
                            download
                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                          >
                            <Download className="w-4 h-4 text-emerald-500" /> CDR SUNAT
                          </a>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/55 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-650 cursor-not-allowed">
                            <Download className="w-4 h-4" /> CDR (N/A)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PDF Receipt Print preview */}
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 print:border-none print:p-0">
                    <p className="font-semibold text-zinc-450 dark:text-zinc-400 uppercase text-[9px] tracking-wider flex items-center justify-between print:hidden">
                      <span>Vista Previa del Formato Impreso</span>
                      <button
                        onClick={() => window.print()}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
                      </button>
                    </p>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white overflow-hidden p-2 print-invoice-container print:border-none print:p-0">
                      <PdfViewer
                        document={{
                          id: emittedDoc.id,
                          docType: docType,
                          serie,
                          correlativo: emittedDoc.correlativo,
                          status: emittedDoc.status,
                          total: emittedDoc.total,
                          issueDate: emittedDoc.issueDate || new Date().toISOString().split('T')[0] as any,
                          dailySummaryId: null,
                          payload: {
                            cliente: {
                              tipoDoc: selectedClient.doc_type,
                              numDoc: selectedClient.doc_number,
                              razonSocial: selectedClient.razon_social,
                              direccion: selectedClient.direccion,
                            },
                            items: lines,
                            totals: {
                              subtotal,
                              igvTotal,
                              total,
                            },
                          },
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          sunat: null,
                        }}
                        companyName={company?.businessName || ''}
                        companyRuc={company?.ruc || ''}
                        companyAddress={company?.address || ''}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
