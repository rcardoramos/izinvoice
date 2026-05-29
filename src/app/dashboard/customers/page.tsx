'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BillingApiClient } from '@/services/api-client';
import { useAppStore } from '@/store/app';
import { PlusCircle, Edit2, Trash2, X, User, DollarSign, Calendar, TrendingUp, RefreshCw, Ban, CheckCircle } from 'lucide-react';

export default function CustomersCrudPage() {
  const { addNotification } = useAppStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination & Filter States
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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
      const params: any = {
        page,
        limit,
        q: debouncedSearch || undefined,
      };
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;

      const res = await BillingApiClient.listCustomers(params);
      const customersData = res?.data ?? [];
      const meta = res?.meta ?? { total: customersData.length, totalPages: 1 };

      setCustomers(customersData);
      setTotalItems(meta.total);
      setTotalPages(meta.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  useEffect(() => {
    loadCustomers();
  }, [page, debouncedSearch, statusFilter]);

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
      docType: customer.docType ?? customer.doc_type ?? '6',
      docNumber: customer.docNumber ?? customer.doc_number ?? '',
      razonSocial: customer.razonSocial ?? customer.razon_social ?? customer.legalName ?? '',
      nombreComercial: customer.nombreComercial ?? customer.nombre_comercial ?? customer.commercialName ?? '',
      direccion: customer.direccion ?? customer.address ?? '',
      correo: customer.correo ?? customer.email ?? '',
      telefono: customer.telefono ?? customer.phone ?? '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiPayload: any = {
        docType: formCustomer.docType,
        docNumber: formCustomer.docNumber,
        legalName: formCustomer.razonSocial,
      };
      if (formCustomer.nombreComercial) apiPayload.commercialName = formCustomer.nombreComercial;
      if (formCustomer.direccion) apiPayload.address = formCustomer.direccion;
      if (formCustomer.correo) apiPayload.email = formCustomer.correo;
      if (formCustomer.telefono) apiPayload.phone = formCustomer.telefono;

      if (modalMode === 'create') {
        await BillingApiClient.createCustomer(apiPayload);
        loadCustomers();
        addNotification({
          id: Math.random().toString(),
          title: 'Cliente Creado',
          message: `Se registró con éxito a ${formCustomer.razonSocial}.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
      } else {
        await BillingApiClient.updateCustomer(formCustomer.id, apiPayload);
        loadCustomers();
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

  const handleToggleCustomerStatus = async (customer: any, enable: boolean) => {
    const name = customer.razonSocial ?? customer.razon_social ?? customer.legalName ?? '-';
    const actionText = enable ? 'habilitar' : 'deshabilitar';
    if (!confirm(`¿Está seguro de que desea ${actionText} al cliente ${name}?`)) return;
    try {
      if (enable) {
        await BillingApiClient.updateCustomer(customer.id, { isActive: true });
        addNotification({
          id: Math.random().toString(),
          title: 'Cliente Habilitado',
          message: `El cliente ${name} fue habilitado con éxito.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
      } else {
        await BillingApiClient.deleteCustomer(customer.id);
        addNotification({
          id: Math.random().toString(),
          title: 'Cliente Deshabilitado',
          message: `El cliente ${name} fue deshabilitado con éxito.`,
          type: 'info',
          created_at: new Date().toISOString(),
        });
      }
      loadCustomers();
      if (selectedCustomerId === customer.id) setSelectedCustomerId(null);
    } catch (err: any) {
      alert(err.message || `Error al ${actionText} cliente.`);
    }
  };

  const columns = [
    {
      key: 'razon_social',
      label: 'Razón Social / Nombre',
      render: (val: any, row: any) => {
        const name = row.razonSocial ?? row.razon_social ?? row.legalName ?? val ?? '-';
        return (
          <button
            onClick={() => setSelectedCustomerId(row.id)}
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left cursor-pointer"
          >
            {name}
          </button>
        );
      },
    },
    {
      key: 'doc_number',
      label: 'Documento',
      render: (val: any, row: any) => {
        const type = row.docType ?? row.doc_type;
        const number = row.docNumber ?? row.doc_number ?? val;
        return (
          <span className="font-mono">
            {type === '6' ? 'RUC' : 'DNI'} {number}
          </span>
        );
      },
    },
    {
      key: 'correo',
      label: 'Correo',
      render: (val: any, row: any) => row.correo ?? row.email ?? val ?? '-',
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (val: any, row: any) => row.telefono ?? row.phone ?? val ?? '-',
    },
    {
      key: 'status',
      label: 'Estado',
      render: (val: any, row: any) => {
        const isActive = !row.deleted_at && row.status !== 'inactive' && row.isActive !== false;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border ${
            isActive 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => {
        const isActive = !row.deleted_at && row.status !== 'inactive' && row.isActive !== false;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {isActive ? (
              <button
                onClick={() => handleToggleCustomerStatus(row, false)}
                className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                title="Deshabilitar"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => handleToggleCustomerStatus(row, true)}
                className="p-1 rounded hover:bg-emerald-500/10 text-emerald-500 cursor-pointer"
                title="Habilitar"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
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
            loading={loading}
            emptyMessage="No se encontraron clientes."
            serverSide={true}
            itemsPerPage={limit}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            searchValue={searchVal}
            onSearchChange={(q) => setSearchVal(q)}
            actions={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-900 text-[11px]">
                  <button
                    type="button"
                    onClick={() => { setStatusFilter('all'); setPage(1); }}
                    className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${statusFilter === 'all' ? 'bg-white dark:bg-zinc-800 shadow-xs text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStatusFilter('active'); setPage(1); }}
                    className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${statusFilter === 'active' ? 'bg-white dark:bg-zinc-800 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}
                  >
                    Activos
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStatusFilter('inactive'); setPage(1); }}
                    className={`px-2 py-1 rounded-md transition-all font-medium cursor-pointer ${statusFilter === 'inactive' ? 'bg-white dark:bg-zinc-800 shadow-xs text-rose-600 dark:text-rose-400' : 'text-zinc-500'}`}
                  >
                    Inactivos
                  </button>
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Registrar Cliente
                </button>
              </div>
            }
          />
        </div>
      </div>

      {/* Flyout Drawer panel for Client Profile */}
      {selectedCustomerId && (
        <>
          {/* Drawer backdrop for mobile/tablet */}
          <div 
            onClick={() => setSelectedCustomerId(null)}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40 lg:hidden"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen lg:relative lg:z-30 shadow-2xl lg:shadow-none select-none">
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
                      {clientDetail.customer.razonSocial ?? clientDetail.customer.razon_social ?? clientDetail.customer.legalName}
                    </h4>
                    <p className="font-mono text-[10px] text-zinc-400 mt-1">
                      {(clientDetail.customer.docType ?? clientDetail.customer.doc_type) === '6' ? 'RUC' : 'DNI'}: {clientDetail.customer.docNumber ?? clientDetail.customer.doc_number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-zinc-100 dark:border-zinc-800/60 py-4 font-medium">
                  <div>
                    <span className="text-zinc-400">Dirección:</span>
                    <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">{clientDetail.customer.direccion ?? clientDetail.customer.address ?? '-'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Correo:</span>
                    <p className="mt-0.5 text-zinc-700 dark:text-zinc-200">{clientDetail.customer.correo ?? clientDetail.customer.email ?? '-'}</p>
                  </div>
                                {/* Analytical Metrics grid */}
                <div className="space-y-3">
                  <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Métricas de Compra</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                      <DollarSign className="w-4 h-4 mx-auto text-blue-500" />
                      <span className="text-[10px] text-zinc-400">Monto Facturado</span>
                      <p className="font-bold font-mono text-sm">S/ {(clientDetail.metrics?.totalBilled ?? 0).toFixed(2)}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                      <Calendar className="w-4 h-4 mx-auto text-emerald-500" />
                      <span className="text-[10px] text-zinc-400">Última Compra</span>
                      <p className="font-bold font-mono text-xs">{clientDetail.metrics?.lastPurchaseDate || 'N/A'}</p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-1.5">
                      <TrendingUp className="w-4 h-4 mx-auto text-amber-500" />
                      <span className="text-[10px] text-zinc-400">Frecuencia</span>
                      <p className="font-bold text-xs">{clientDetail.metrics?.frequency || 'N/A'}</p>
                    </div>

                  </div>
                </div>

                {/* Document purchase history table representation */}
                <div className="space-y-3">
                  <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Historial de Compras ({(clientDetail.metrics?.history ?? []).length})</p>
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
                        {(!clientDetail.metrics?.history || clientDetail.metrics.history.length === 0) ? (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-zinc-400">Sin compras registradas</td>
                          </tr>
                        ) : (
                          clientDetail.metrics.history.map((h: any) => (
                            <tr key={h.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300">
                              <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{h.serie}-{h.correlativo}</td>
                              <td className="p-2.5">{h.issueDate ?? h.issue_date}</td>
                              <td className="p-2.5 text-right font-mono font-semibold">S/ {(h.total ?? 0).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>    </div>

              </div>
            ) : null}
          </div>
        </div>
      </>
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
