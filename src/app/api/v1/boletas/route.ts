import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { CreateBoletaRequest, BoletaCreatedResponse } from '@/types/document.types';
import { SunatMockService } from '@/utils/sunat-mock';

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body: CreateBoletaRequest = await req.json();
    const { serie, cliente, items, moneda, tipoOperacion } = body;

    // Validate series
    const seriesList = FileDb.getTable('document_series');
    const seriesIndex = seriesList.findIndex(
      (s: any) => s.company_id === ctx.company.id && s.doc_type === '03' && s.serie === serie
    );

    if (seriesIndex === -1) {
      return NextResponse.json(
        { statusCode: 400, message: `La serie '${serie}' no está registrada para Boletas en esta empresa.` },
        { status: 400 }
      );
    }

    // Increment correlative
    const activeSeries = seriesList[seriesIndex];
    const nextCorrelativo = activeSeries.correlativo + 1;
    activeSeries.correlativo = nextCorrelativo;
    FileDb.saveTable('document_series', seriesList);

    // Calculate Totals
    let subtotal = 0;
    let igvTotal = 0;
    const computedItems = items.map((item) => {
      const lineTotal = item.cantidad * item.precioUnitario;
      const lineIgv = lineTotal * 0.18;
      subtotal += lineTotal;
      igvTotal += lineIgv;
      return {
        ...item,
        igv: parseFloat(lineIgv.toFixed(2)),
      };
    });
    const total = subtotal + igvTotal;
    const docTotalString = total.toFixed(2);

    // Create Document record (saved as 'signed', pending RC daily summary)
    const docId = Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);
    const documentRecord = {
      id: docId,
      company_id: ctx.company.id,
      doc_type: '03',
      serie,
      correlativo: nextCorrelativo,
      status: 'signed',
      issue_date: new Date().toISOString().split('T')[0],
      total: parseFloat(docTotalString),
      daily_summary_id: null,
      user_id: ctx.user.id,
      payload: {
        cliente,
        moneda,
        items: computedItems,
        tipoOperacion: tipoOperacion || '0101',
        totals: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          igvTotal: parseFloat(igvTotal.toFixed(2)),
          total: parseFloat(docTotalString),
        },
      },
    };

    // Store signed XML
    SunatMockService.generateAndStoreXml(docId, '03', serie, nextCorrelativo, documentRecord.payload);
    FileDb.insert('documents', documentRecord);

    // Create Notification and Audit Logs
    FileDb.insert('notifications', {
      company_id: ctx.company.id,
      title: 'Comprobante Emitido',
      message: `Boleta ${serie}-${nextCorrelativo} emitida. Pendiente de envío en Resumen Diario (RC).`,
      type: 'info',
      read: false,
    });

    logAudit(
      ctx.company.id,
      ctx.user.id,
      'EMIT_BOLETA',
      'BOLETAS',
      `Emitted boleta ${serie}-${nextCorrelativo} with total PEN ${docTotalString}. Status: signed`,
      'success'
    );

    const response: BoletaCreatedResponse = {
      id: docId,
      docType: '03',
      serie,
      correlativo: nextCorrelativo,
      status: 'signed',
      total: docTotalString,
      issueDate: documentRecord.issue_date,
      message: 'Boleta firmada localmente. Lista para ser incluida en el Resumen Diario.',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
