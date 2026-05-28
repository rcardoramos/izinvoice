'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { BillingApiClient } from '@/services/api-client';
import { useAppStore } from '@/store/app';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';

export default function ProductsCrudPage() {
  const { addNotification } = useAppStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formProduct, setFormProduct] = useState({
    id: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    unidadMedida: 'NIU',
    precio: '',
    igvRate: '18.00',
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await BillingApiClient.listProducts({ limit: 100 });
      const productsData = Array.isArray(res) ? res : (res?.data ?? []);
      setProducts(productsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormProduct({
      id: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: 'NIU',
      precio: '',
      igvRate: '18.00',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setModalMode('edit');
    const codigoVal = p.code ?? p.codigo ?? '';
    const nombreVal = p.description ?? p.name ?? p.nombre ?? '';
    const descVal = (p.name || p.nombre) ? (p.description ?? p.descripcion ?? '') : (p.descripcion ?? '');
    const catVal = p.category ?? p.categoria ?? '';
    const umVal = p.unitMeasure ?? p.unidadMedida ?? p.unidad_medida ?? 'NIU';
    const priceVal = (p.unitPrice ?? p.precio ?? 0).toString();
    const igvVal = (p.igvRate ?? p.igv_rate ?? '18.00').toString();

    setFormProduct({
      id: p.id,
      codigo: codigoVal,
      nombre: nombreVal,
      descripcion: descVal,
      categoria: catVal,
      unidadMedida: umVal,
      precio: priceVal,
      igvRate: igvVal,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiPayload = {
        code: formProduct.codigo,
        description: formProduct.nombre, // formProduct.nombre is the main name/description
        unitPrice: parseFloat(formProduct.precio),
      };

      if (modalMode === 'create') {
        const created = await BillingApiClient.createProduct(apiPayload);
        setProducts((prev) => [...prev, created]);
        addNotification({
          id: Math.random().toString(),
          title: 'Producto Creado',
          message: `Producto '${formProduct.nombre}' registrado con éxito.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
      } else {
        const updated = await BillingApiClient.updateProduct(formProduct.id, apiPayload);
        setProducts((prev) => prev.map((p) => (p.id === formProduct.id ? updated : p)));
        addNotification({
          id: Math.random().toString(),
          title: 'Producto Actualizado',
          message: `Datos del producto '${formProduct.nombre}' guardados con éxito.`,
          type: 'success',
          created_at: new Date().toISOString(),
        });
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error al guardar producto.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de que desea eliminar el producto '${name}'?`)) return;
    try {
      await BillingApiClient.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addNotification({
        id: Math.random().toString(),
        title: 'Producto Eliminado',
        message: `El producto '${name}' fue retirado del catálogo.`,
        type: 'info',
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(err.message || 'Error al eliminar producto.');
    }
  };

  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      render: (val: any, row: any) => <span className="font-mono font-semibold">{row.code ?? row.codigo ?? val}</span>,
    },
    {
      key: 'nombre',
      label: 'Nombre / Detalle',
      render: (val: any, row: any) => {
        const name = row.description ?? row.name ?? row.nombre ?? val ?? '-';
        const desc = (row.name || row.nombre) ? row.description : row.descripcion;
        const hasDesc = desc && desc !== name;
        return (
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{name}</p>
            {hasDesc && <p className="text-[10px] text-zinc-500 truncate max-w-[250px]">{desc}</p>}
          </div>
        );
      },
    },
    {
      key: 'categoria',
      label: 'Categoría',
      render: (val: any, row: any) => row.category ?? row.categoria ?? val ?? '-',
    },
    {
      key: 'unidad_medida',
      label: 'Medida',
      render: (val: any, row: any) => {
        const measure = row.unitMeasure ?? row.unidadMedida ?? row.unidad_medida ?? val ?? 'NIU';
        return <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{measure}</span>;
      },
    },
    {
      key: 'precio',
      label: 'Precio',
      render: (val: any, row: any) => {
        const price = row.unitPrice ?? row.precio ?? val ?? 0;
        return <span className="font-mono font-bold">S/ {parseFloat(price).toFixed(2)}</span>;
      },
    },
    {
      key: 'igv_rate',
      label: 'Tasa IGV',
      render: (val: any, row: any) => {
        const igv = row.igvRate ?? row.igv_rate ?? val ?? 18;
        return <span className="text-[10px] text-zinc-500 font-mono">{parseFloat(igv)}%</span>;
      },
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
            onClick={() => handleDeleteProduct(row.id, row.name ?? row.nombre)}
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
    <div className="flex-1 flex flex-col overflow-y-auto">
      <PageHeader 
        title="Catálogo de Productos" 
        subtitle="Artículos y servicios registrados con especificación impositiva SUNAT"
      />

      <div className="p-8 max-w-7xl w-full mx-auto pb-16">
        <DataTable
          columns={columns}
          data={products}
          searchPlaceholder="Buscar por código, nombre..."
          searchKey="nombre"
          loading={loading}
          emptyMessage="No hay productos registrados en esta empresa."
          actions={
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Registrar Producto
            </button>
          }
        />
      </div>

      {/* CRUD dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="w-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
              {modalMode === 'create' ? 'Registrar Producto' : 'Editar Producto'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Código de Catálogo</label>
                  <input
                    type="text"
                    value={formProduct.codigo}
                    onChange={(e) => setFormProduct({ ...formProduct, codigo: e.target.value })}
                    required
                    placeholder="PROD-100"
                    disabled={modalMode === 'edit'}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 disabled:opacity-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formProduct.categoria}
                    onChange={(e) => setFormProduct({ ...formProduct, categoria: e.target.value })}
                    placeholder="Hardware"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={formProduct.nombre}
                  onChange={(e) => setFormProduct({ ...formProduct, nombre: e.target.value })}
                  required
                  placeholder="Laptop HP 15.6 pulgadas"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Descripción Breve</label>
                <textarea
                  value={formProduct.descripcion}
                  onChange={(e) => setFormProduct({ ...formProduct, descripcion: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Precio Unitario (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProduct.precio}
                    onChange={(e) => setFormProduct({ ...formProduct, precio: e.target.value })}
                    required
                    placeholder="2500.00"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Unidad Medida</label>
                  <select
                    value={formProduct.unidadMedida}
                    onChange={(e) => setFormProduct({ ...formProduct, unidadMedida: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 font-mono"
                  >
                    <option value="NIU">NIU (Bienes)</option>
                    <option value="ZZ">ZZ (Servicios)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Tasa IGV (%)</label>
                <select
                  value={formProduct.igvRate}
                  onChange={(e) => setFormProduct({ ...formProduct, igvRate: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2"
                >
                  <option value="18.00">18% Gravado</option>
                  <option value="0.00">0% Exonerado / Inafecto</option>
                </select>
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
