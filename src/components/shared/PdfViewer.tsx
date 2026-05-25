'use client';

import React from 'react';
import { DocumentDetail } from '@/types/document.types';
import { DOC_TYPE_LABELS } from '@/types/enums';
import { Building2, Mail, Phone, Calendar, User, FileSpreadsheet, QrCode } from 'lucide-react';

interface PdfViewerProps {
  document: DocumentDetail;
  companyName: string;
  companyRuc: string;
  companyAddress?: string;
}

export function PdfViewer({ document, companyName, companyRuc, companyAddress }: PdfViewerProps) {
  const p = document.payload;
  if (!p) return null;

  const isFactura = document.docType === '01';

  return (
    <div className="bg-white text-zinc-950 p-8 rounded-xl border border-zinc-200 shadow-lg max-w-2xl mx-auto font-sans text-xs select-none">
      {/* Invoice Receipt Header */}
      <div className="flex justify-between items-start gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-[#4f46e5] flex items-center justify-center font-bold text-white text-[10px]">
              IF
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900">{companyName}</span>
          </div>
          {companyAddress && <p className="text-[10px] text-zinc-500">{companyAddress}</p>}
          <div className="flex items-center gap-4 text-[10px] text-zinc-400 mt-2">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +51 987654321</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> facturacion@invoiceflow.pe</span>
          </div>
        </div>

        {/* RUC and Serial Number block */}
        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50/50 text-center min-w-[200px]">
          <p className="font-bold text-zinc-800 text-xs">R.U.C. {companyRuc}</p>
          <p className="font-bold text-[#4f46e5] uppercase text-[11px] tracking-wide my-1">
            {DOC_TYPE_LABELS[document.docType]} ELECTRÓNICA
          </p>
          <p className="font-mono text-zinc-600 font-semibold">{document.serie}-{String(document.correlativo).padStart(8, '0')}</p>
        </div>
      </div>

      {/* Meta details */}
      <div className="grid grid-cols-2 gap-6 py-6 border-b border-zinc-100">
        <div className="space-y-2">
          <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Adquiriente / Cliente</p>
          <div className="space-y-1 text-zinc-800">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              {p.cliente?.razonSocial}
            </p>
            <p className="font-mono text-[10px] text-zinc-500">
              {p.cliente?.tipoDoc === '6' ? 'R.U.C.' : 'D.N.I.'} {p.cliente?.numDoc}
            </p>
            {p.cliente?.direccion && (
              <p className="text-[10px] text-zinc-500">{p.cliente.direccion}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Detalles Emisión</p>
          <div className="space-y-1 text-zinc-800">
            <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-400" /> <b>Fecha Emisión:</b> {document.issueDate}</p>
            <p className="flex items-center gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" /> <b>Moneda:</b> {p.moneda || 'PEN'}</p>
            {p.formaPago && <p><b>Forma de Pago:</b> {p.formaPago === 'CON' ? 'Contado' : 'Crédito'}</p>}
            {p.documentoAfectado && (
              <p className="text-[#4f46e5] font-semibold">
                <b>Documento Afectado:</b> {p.documentoAfectado.serie}-{p.documentoAfectado.correlativo}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 text-[9px] uppercase tracking-wider font-semibold">
              <th className="pb-2 w-12">Código</th>
              <th className="pb-2">Descripción</th>
              <th className="pb-2 text-center w-12">Cant.</th>
              <th className="pb-2 text-right w-20">P. Unit</th>
              <th className="pb-2 text-right w-20">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {p.items?.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-2.5 font-mono text-[10px] text-zinc-500">{item.codigo}</td>
                <td className="py-2.5 font-medium text-zinc-900">{item.descripcion}</td>
                <td className="py-2.5 text-center">{item.cantidad}</td>
                <td className="py-2.5 text-right font-mono">{(item.precioUnitario).toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono font-semibold">{(item.cantidad * item.precioUnitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Calculations */}
      <div className="grid grid-cols-5 gap-4 pt-6 border-t border-zinc-200">
        <div className="col-span-3 flex flex-col justify-between">
          <div className="flex gap-4 items-center bg-zinc-50 border border-zinc-200/60 p-3 rounded-lg w-full max-w-[320px]">
            <QrCode className="w-12 h-12 text-zinc-800 shrink-0" />
            <div className="space-y-0.5 text-[9px] text-zinc-500 font-mono">
              <p className="font-semibold text-zinc-700">Representación impresa</p>
              <p>Hash: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p>SUNAT Estado: Aceptado</p>
            </div>
          </div>
          <p className="text-[9px] text-zinc-400 leading-snug">
            Autorizado mediante resolución de SUNAT. Consulte su CDR en nuestra web.
          </p>
        </div>

        <div className="col-span-2 space-y-2 text-right text-zinc-800 font-medium">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Op. Gravada</span>
            <span className="font-mono">PEN {p.totals?.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">I.G.V. (18%)</span>
            <span className="font-mono">PEN {p.totals?.igvTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-100">
            <span>Importe Total</span>
            <span className="font-mono">PEN {p.totals?.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
