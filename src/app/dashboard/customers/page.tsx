'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BillingApiClient } from '@/services/api-client';
import { useAppStore } from '@/store/app';
import { PlusCircle, Edit2, Trash2, X, User, DollarSign, Calendar, TrendingUp, RefreshCw } from 'lucide-react';

export default function CustomersCrudPage() {
  const { addNotification } = useAppStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Client Drawer details
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [clientDetail, setClientDetail] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formCustomer, setFormCustomer] = useState({
    id: '',
    docType: '6',
    docNumber: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    correo: '',
    telefono: '',
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await BillingApiClient.listCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Fetch customer profile details
  useEffect(() => {
    if (!selectedCustomerId) {
      setClientDetail(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        setDrawerLoading(true);
        const res = await BillingApiClient.getCustomerDetail(selectedCustomerId);
        setClientDetail(res);
      } catch (e) {
        console.error(e);
      } finally {
        setDrawerLoading(false);
      }
    };
    fetchDetail();
  }, [selectedCustomerId]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormCustomer({
      id: '',
      docType: '6',
      docNumber: '',
      razonSocial: '',
      nombreComercial: '',
      direccion: '',
      correo: '',
      telefono: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (customer: any) => {
    setModalMode('edit');
    setFormCustomer({
      id: customer.id,
      docType: customer.doc_type,
      docNumber: customer.doc_number,
      razonSocial: customer.razon_social,
      nombreComercial: customer.nombre_comercial || '',
      direccion: customer.direccion || '',
      correo: customer.correo || '',
      telefono: customer.telefono || '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const created = await BillingApiClient.createCustomer(formCustomer);
        setCustomers((prev) => [...prev, created]);
        addNotification({
          id: Math.random().toString(),
          title: 'Cliente Creado',
          message: `Se registró con éxito a ${formCustomer.razonSocial}.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
      } else {
        const updated = await BillingApiClient.updateCustomer(formCustomer.id, formCustomer);
        setCustomers((prev) => prev.map((c) => (c.id === formCustomer.id ? updated : c)));
        addNotification({
          id: Math.random().toString(),
          title: 'Cliente Actualizado',
          message: `Se actualizaron los datos de ${formCustomer.razonSocial}.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
        
        // Refresh details drawer if open
        if (selectedCustomerId === formCustomer.id) {
          const detailRes = await BillingApiClient.getCustomerDetail(formCustomer.id);
          setClientDetail(detailRes);
        }
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar cliente.');
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar al cliente ${name}?`)) return;
    try {
      await BillingApiClient.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCustomerId === id) setSelectedCustomerId(null);
      
      addNotification({
        id: Math.random().toString(),
        title: 'Cliente Eliminado',
        message: `El cliente ${name} fue retirado con éxito.`,
        type: 'info',
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(err.message || 'Error al eliminar cliente.');
    }
  };

  const columns = [
    {
      key: 'razon_social',
      label: 'Razón Social / Nombre',
      render: (val: any, row: any) => (
        <button
          onClick={() => setSelectedCustomerId(row.id)}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer"
        >
          {val}
        </button>
      ),
    },
    {
      key: 'doc_number',
      label: 'Documento',
      render: (val: any, row: any) => (
        <span className="font-mono">
          {row.doc_type === '6' ? 'RUC' : 'DNI'} {val}
        </span>
      ),
    },
    {
      key: 'correo',
      label: 'Correo',
      render: (val: any) => val || '-',
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (val: any) => val || '-',
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            title="Editar"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteCustomer(row.id, row.razon_social)}
            className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Primary list workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <PageHeader 
          title="Directorio de Clientes" 
          subtitle="Directorio unificado de RUC y DNI para autocompletado"
        />

        <div className="p-8 max-w-7xl w-full mx-auto pb-16">
          <DataTable
            columns={columns}
            data={customers}
            searchPlaceholder="Buscar por nombre, documento..."
            searchKey="razon_social"
            loading={loading}
            emptyMessage="No hay clientes registrados en esta empresa."
            actions={
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Registrar Cliente
              </button>
            }
          />
        </div>
      </div>

      {/* Flyout Drawer panel for Client Profile */}
      {selectedCustomerId && (
        <div className="w-[500px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen shrink-0 relative z-30 shadow-2xl select-none">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Perfil del Cliente</h3>
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer text-zinc-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {drawerLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-400 font-mono">Cargando perfil...</span>
              </div>
            ) : clientDetail ? (
              <div className="space-y-6 text-xs text-zinc-800 dark:text-zinc-300">
                {/* Core profile details */}
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                      {clientDetail.customer.razon_social}
                    </h4>
                    <p className="font-mono text-[10px] text-zinc-400 mt-1">
                      {clientDetail.customer.doc_type === '6' ? 'RUC' : 'DNI'}: {clientDetail.customer.doc_number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-zinc-100 dark:border-zinc-800/60 py-4 font-medium">
                  <div>
                    <span className="text-zinc-400">Dirección:</span>
                    <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">{clientDetail.customer.direccion || '-'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Correo:</span>
                    <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">{clientDetail.customer.correo || '-'}</p>
                  </div>
                </div>

                {/* Analytical Metrics grid */}
                <div className="space-y-3">
                  <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Métricas de Compra</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                      <DollarSign className="w-4 h-4 mx-auto text-blue-500" />
                      <span className="text-[10px] text-zinc-400">Monto Facturado</span>
                      <p className="font-bold font-mono text-sm">S/ {clientDetail.metrics.totalBilled.toFixed(2)}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                      <Calendar className="w-4 h-4 mx-auto text-emerald-500" />
                      <span className="text-[10px] text-zinc-400">Última Compra</span>
                      <p className="font-bold font-mono text-xs">{clientDetail.metrics.lastPurchaseDate || 'N/A'}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                      <TrendingUp className="w-4 h-4 mx-auto text-amber-500" />
                      <span className="text-[10px] text-zinc-400">Frecuencia</span>
                      <p className="font-bold text-xs">{clientDetail.metrics.frequency}</p>
                    </div>

                  </div>
                </div>

                {/* Document purchase history table representation */}
                <div className="space-y-3">
                  <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Historial de Compras ({clientDetail.metrics.history.length})</p>
                  <div className="border border-zinc-100 dark:border-zinc-800/80 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 uppercase font-semibold">
                          <th className="p-2.5">Documento</th>
                          <th className="p-2.5">Fecha</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850/60">
                        {clientDetail.metrics.history.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-zinc-400">Sin compras registradas</td>
                          </tr>
                        ) : (
                          clientDetail.metrics.history.map((h: any) => (
                            <tr key={h.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300">
                              <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{h.serie}-{h.correlativo}</td>
                              <td className="p-2.5">{h.issueDate}</td>
                              <td className="p-2.5 text-right font-mono font-semibold">S/ {h.total.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* CRUD dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              {modalMode === 'create' ? 'Registrar Cliente' : 'Editar Cliente'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Tipo Doc</label>
                  <select
                    value={formCustomer.docType}
                    onChange={(e) => setFormCustomer({ ...formCustomer, docType: e.target.value })}
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
                    value={formCustomer.docNumber}
                    onChange={(e) => setFormCustomer({ ...formCustomer, docNumber: e.target.value })}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Razón Social / Nombre Completo</label>
                <input
                  type="text"
                  value={formCustomer.razonSocial}
                  onChange={(e) => setFormCustomer({ ...formCustomer, razonSocial: e.target.value })}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  value={formCustomer.direccion}
                  onChange={(e) => setFormCustomer({ ...formCustomer, direccion: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formCustomer.correo}
                    onChange={(e) => setFormCustomer({ ...formCustomer, correo: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formCustomer.telefono}
                    onChange={(e) => setFormCustomer({ ...formCustomer, telefono: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-zinc-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
