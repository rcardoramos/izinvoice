'use client';

import React, { useState, useEffect } from 'react';
import { BillingApiClient } from '@/services/api-client';
import { DOCUMENT_TYPES, getDocTypeConfigByCode } from '@/utils/document-types';
import { AlertModal } from '@/components/shared/AlertModal';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (createdClient: any) => void;
  initialDocNumber?: string;
  initialDocType?: string;
  allowedDocTypes?: string[]; // e.g., ['6'] for Factura
}

export function AddClientModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialDocNumber = '',
  initialDocType = '6',
  allowedDocTypes,
}: AddClientModalProps) {
  const [formData, setFormData] = useState({
    docType: initialDocType,
    docNumber: initialDocNumber,
    razonSocial: '',
    direccion: '',
    correo: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'warning') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        docType: initialDocType,
        docNumber: initialDocNumber,
        razonSocial: '',
        direccion: '',
        correo: '',
        telefono: '',
      });
    }
  }, [isOpen, initialDocNumber, initialDocType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce document type validations based on centralized configuration
    const config = getDocTypeConfigByCode(formData.docType);
    if (config) {
      if (!config.pattern.test(formData.docNumber)) {
        showAlert('Documento Inválido', config.errorMessage, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const apiPayload: any = {
        docType: formData.docType,
        docNumber: formData.docNumber,
        legalName: formData.razonSocial,
      };
      if (formData.direccion) apiPayload.address = formData.direccion;
      if (formData.correo) apiPayload.email = formData.correo;
      if (formData.telefono) apiPayload.phone = formData.telefono;

      const created = await BillingApiClient.createCustomer(apiPayload);
      onSubmitSuccess(created);
      onClose();
    } catch (err: any) {
      showAlert('Error', err.message || 'Error al guardar cliente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectableTypes = Object.values(DOCUMENT_TYPES).filter((doc) =>
    !allowedDocTypes || allowedDocTypes.includes(doc.code)
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="w-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
          Registrar Cliente
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Tipo Doc</label>
              <select
                value={formData.docType}
                onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-150"
              >
                {selectableTypes.map((doc) => (
                  <option key={doc.code} value={doc.code}>
                    {doc.label} ({doc.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Nro Documento</label>
              <input
                type="text"
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-150"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Razón Social / Nombre Completo</label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-150"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Dirección Fiscal</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-150"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-150"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-zinc-150"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer text-zinc-500 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
    <AlertModal
      isOpen={alertConfig.isOpen}
      title={alertConfig.title}
      message={alertConfig.message}
      type={alertConfig.type}
      onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
    />
  </>
);
}
