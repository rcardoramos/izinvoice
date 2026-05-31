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
  isSummarized?: boolean;
}

export function PdfViewer({ document, companyName, companyRuc, companyAddress, isSummarized = false }: PdfViewerProps) {
  const p = document.payload;
  if (!p) return null;

  const isFactura = document.docType === '01';
  const calculatedSubtotal = p.totals?.subtotal || p.items?.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0) || 0;

  return (
    <div className="bg-white text-zinc-950 p-10 md:p-12 rounded-xl border border-zinc-200 shadow-lg max-w-2xl mx-auto font-sans text-xs select-none">
      {/* Invoice Receipt Header */}
      <div className="flex justify-between items-start gap-4 pb-8 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#4f46e5] flex items-center justify-center font-bold text-white text-[11px]">
              IF
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900">{companyName}</span>
          </div>
          {companyAddress && <p className="text-[11px] text-zinc-550 leading-relaxed">{companyAddress}</p>}
          <div className="flex items-center gap-5 text-[11px] text-zinc-500 mt-3">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +51 987654321</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> facturacion@invoiceflow.pe</span>
          </div>
        </div>

        {/* RUC and Serial Number block */}
        <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50/50 text-center min-w-[220px]">
          <p className="font-bold text-zinc-800 text-xs">R.U.C. {companyRuc}</p>
          <p className="font-bold text-[#4f46e5] uppercase text-[11px] tracking-wide my-1.5">
            {DOC_TYPE_LABELS[document.docType]} ELECTRÓNICA
          </p>
          <p className="font-mono text-zinc-700 font-bold text-sm tracking-wide">{document.serie}-{String(document.correlativo).padStart(8, '0')}</p>
        </div>
      </div>

      {/* Meta details */}
      <div className="grid grid-cols-2 gap-8 py-8 border-b border-zinc-150">
        <div className="space-y-3">
          <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Adquiriente / Cliente</p>
          <div className="space-y-1.5 text-zinc-800">
            <p className="font-bold text-zinc-900 flex items-center gap-1.5 text-sm">
              <User className="w-4 h-4 text-zinc-400" />
              {p.cliente?.razonSocial}
            </p>
            <p className="font-mono text-[11px] text-zinc-500">
              {p.cliente?.tipoDoc === '6' ? 'R.U.C.' : 'D.N.I.'} {p.cliente?.numDoc}
            </p>
            {p.cliente?.direccion && (
              <p className="text-[11px] text-zinc-500 leading-relaxed">{p.cliente.direccion}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-zinc-400 uppercase text-[9px] tracking-wider">Detalles Emisión</p>
          <div className="space-y-1.5 text-zinc-800">
            <p className="flex items-center gap-2 text-[11px]"><Calendar className="w-4 h-4 text-zinc-400" /> <b>Fecha Emisión:</b> {document.issueDate}</p>
            <p className="flex items-center gap-2 text-[11px]"><FileSpreadsheet className="w-4 h-4 text-zinc-400" /> <b>Moneda:</b> {p.moneda || 'PEN'}</p>
            {p.formaPago && <p className="text-[11px]"><b>Forma de Pago:</b> {['CON', 'Contado'].includes(p.formaPago) ? 'Contado' : 'Crédito'}</p>}
            {p.documentoAfectado && (
              <p className="text-[#4f46e5] font-semibold text-[11px]">
                <b>Documento Afectado:</b> {p.documentoAfectado.serie}-{p.documentoAfectado.correlativo}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 text-[9px] uppercase tracking-wider font-semibold">
              <th className="pb-3 w-12">Item</th>
              <th className="pb-3 text-center w-12">Cant.</th>
              <th className="pb-3">Descripción</th>
              <th className="pb-3 text-right w-24">P. Unit</th>
              <th className="pb-3 text-right w-24">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {isSummarized ? (
              <tr className="align-top border-b border-zinc-50 last:border-0">
                <td className="py-4 font-mono text-[11px] text-zinc-500">1</td>
                <td className="py-4 text-center text-[12px]">1</td>
                <td className="py-4 font-medium text-zinc-900 text-[12px] uppercase">DETALLADO POR SERVICIO</td>
                <td className="py-4 text-right font-mono text-[12px]">{calculatedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-4 text-right font-mono font-semibold text-[12px]">{calculatedSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ) : (
              p.items?.map((item, idx) => (
                <tr key={idx} className="align-top border-b border-zinc-50 last:border-0">
                  <td className="py-4 font-mono text-[11px] text-zinc-500">{idx + 1}</td>
                  <td className="py-4 text-center text-[12px]">{item.cantidad}</td>
                  <td className="py-4 font-medium text-zinc-900 text-[12px]">{item.descripcion}</td>
                  <td className="py-4 text-right font-mono text-[12px]">{(item.precioUnitario || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-4 text-right font-mono font-semibold text-[12px]">{(item.cantidad * item.precioUnitario || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Total Calculations */}
      <div className="grid grid-cols-5 gap-6 pt-8 border-t border-zinc-200">
        <div className="col-span-3 flex flex-col justify-between min-h-[90px]">
          <div className="flex gap-4 items-center bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl w-full max-w-[320px]">
            <QrCode className="w-12 h-12 text-zinc-800 shrink-0" />
            <div className="space-y-0.5 text-[9px] text-zinc-500 font-mono">
              <p className="font-semibold text-zinc-700">Representación impresa</p>
              <p>Hash: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p>SUNAT Estado: Aceptado</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 leading-snug mt-3">
            Autorizado mediante resolución de SUNAT. Consulte su CDR en nuestra web.
          </p>
        </div>

        <div className="col-span-2 space-y-3 text-right text-zinc-800 font-medium">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Op. Gravada</span>
            <span className="font-mono">PEN {(p.totals?.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">I.G.V. (18%)</span>
            <span className="font-mono">PEN {(p.totals?.igvTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-zinc-900 pt-3 border-t border-zinc-150">
            <span>Importe Total</span>
            <span className="font-mono text-base text-zinc-950">PEN {(p.totals?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
