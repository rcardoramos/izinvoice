'use client';

import React from 'react';
import { DocumentDetail } from '@/types/document.types';
import { DOC_TYPE_LABELS } from '@/types/enums';
import { QrCode } from 'lucide-react';
import { TZ } from '@/utils/date-pe';

interface TicketViewerProps {
  document: DocumentDetail;
  companyName: string;
  companyRuc: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  isSummarized?: boolean;
}

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-PE', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    return '';
  }
};

export function TicketViewer({ document, companyName, companyRuc, companyAddress, companyPhone, companyEmail, isSummarized = false }: TicketViewerProps) {
  const p = document.payload;
  if (!p) return null;

  const calculatedSubtotal = p.totals?.subtotal || p.items?.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0) || 0;

  return (
    <div className="bg-white text-zinc-900 p-5 rounded-lg border border-zinc-200 shadow-md max-w-[310px] mx-auto font-mono text-[10px] select-none print-ticket-viewer">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <div className="flex justify-center mb-1">
          <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center font-bold text-white text-[12px]">
            IF
          </div>
        </div>
        <p className="font-bold text-xs uppercase tracking-tight text-zinc-950">{companyName}</p>
        <p className="text-zinc-600">R.U.C. {companyRuc}</p>
        {companyAddress && <p className="text-zinc-500 leading-tight text-[9px]">{companyAddress}</p>}
        {companyPhone && <p className="text-zinc-500 text-[9px]">Telf: {companyPhone}</p>}
        {companyEmail && <p className="text-zinc-500 text-[9px] lowercase">{companyEmail}</p>}
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-zinc-300 my-2.5" />

      {/* Doc Title & Number */}
      <div className="text-center space-y-0.5">
        <p className="font-bold text-zinc-900 uppercase text-[10px]">
          {DOC_TYPE_LABELS[document.docType]} ELECTRÓNICA
        </p>
        <p className="font-bold text-zinc-950 text-xs tracking-wider">
          {document.serie}-{String(document.correlativo).padStart(8, '0')}
        </p>
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-zinc-300 my-2.5" />

      {/* Meta details */}
      <div className="space-y-1 text-zinc-700">
        <p className="flex justify-between">
          <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">F.Emisión:</span>
          <span>{document.issueDate}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">Hora Emisión:</span>
          <span>{formatTime(document.createdAt)}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">Moneda:</span>
          <span>{p.moneda || 'PEN'}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">Forma Pago:</span>
          <span>{['CON', 'Contado'].includes(p.formaPago || 'CON') ? 'Contado' : 'Crédito'}</span>
        </p>
        
        {/* Client details */}
        <div className="border-t border-zinc-100 pt-1.5 mt-1.5 space-y-1">
          <p className="font-semibold text-zinc-900 text-[9px] truncate">
            {p.cliente?.razonSocial}
          </p>
          <p className="text-zinc-500 text-[9px]">
            {p.cliente?.tipoDoc === '6' ? 'R.U.C.' : 'D.N.I.'} {p.cliente?.numDoc}
          </p>
          {p.cliente?.direccion && (
            <p className="text-zinc-500 text-[8px] leading-tight mt-0.5 max-h-8 overflow-hidden line-clamp-2">
              {p.cliente.direccion}
            </p>
          )}
        </div>
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-zinc-300 my-2.5" />

      {/* Items List */}
      <div>
        <table className="w-full text-[9px]">
          <thead>
            <tr className="text-zinc-400 border-b border-zinc-100 pb-1 text-[8px] uppercase tracking-wider">
              <th className="text-center font-semibold pb-1 w-6">Cant</th>
              <th className="text-left font-semibold pb-1">Descripción</th>
              <th className="text-right font-semibold pb-1 w-12">P.U.</th>
              <th className="text-right font-semibold pb-1 w-14">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-800">
            {isSummarized ? (
              <tr className="align-top py-1.5">
                <td className="text-center py-1.5">1</td>
                <td className="text-left font-semibold py-1.5 uppercase leading-tight text-zinc-900">
                  DETALLADO POR SERVICIO
                </td>
                <td className="text-right py-1.5">
                  {calculatedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="text-right font-semibold py-1.5 text-zinc-950">
                  {calculatedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ) : (
              p.items?.map((item, idx) => (
                <tr key={idx} className="align-top py-1.5">
                  <td className="text-center py-1.5">{item.cantidad}</td>
                  <td className="text-left py-1.5 leading-tight text-zinc-900 font-medium">
                    {item.descripcion}
                  </td>
                  <td className="text-right py-1.5">
                    {(item.precioUnitario || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right font-semibold py-1.5 text-zinc-950">
                    {(item.cantidad * item.precioUnitario || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-zinc-300 my-2.5" />

      {/* Calculations */}
      <div className="space-y-1.5 text-zinc-800 text-[9px]">
        <div className="flex justify-between">
          <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">Op. Gravada:</span>
          <span>PEN {(p.totals?.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400 font-semibold uppercase text-[8px] tracking-wider">I.G.V. (18%):</span>
          <span>PEN {(p.totals?.igvTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-zinc-950 pt-1 border-t border-zinc-100">
          <span>TOTAL:</span>
          <span>PEN {(p.totals?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Dashed Separator */}
      <div className="border-t border-dashed border-zinc-300 my-3" />

      {/* QR Code and Printed Representation */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <QrCode className="w-16 h-16 text-zinc-850" />
        </div>
        <div className="text-[8px] text-zinc-450 leading-tight space-y-0.5">
          <p className="font-semibold text-zinc-700">Representación impresa</p>
          <p>Hash: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <p>SUNAT Estado: Aceptado</p>
        </div>
        <p className="text-[7.5px] text-zinc-400 leading-normal max-w-[200px] mx-auto">
          Autorizado mediante resolución de SUNAT. Consulte su CDR en nuestra web.
        </p>
        <p className="text-[9px] text-zinc-850 font-bold italic pt-1">
          ¡Gracias por su preferencia!
        </p>
      </div>
    </div>
  );
}
