import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { CreateInvoiceRequest, InvoiceCreatedResponse } from '@/types/document.types';
import { SunatMockService } from '@/utils/sunat-mock';

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body: CreateInvoiceRequest = await req.json();
    const { serie, cliente, items, moneda, tipoOperacion } = body;

    // Validate series
    const seriesList = FileDb.getTable('document_series');
    const seriesIndex = seriesList.findIndex(
      (s: any) => s.company_id === ctx.company.id && s.doc_type === '01' && s.serie === serie
    );

    if (seriesIndex === -1) {
      return NextResponse.json(
        { statusCode: 400, message: `La serie '${serie}' no está registrada para Facturas en esta empresa.` },
        { status: 400 }
      );
    }

    // Increment correlative (lock simulation)
    const activeSeries = seriesList[seriesIndex];
    const nextCorrelativo = activeSeries.correlativo + 1;
    activeSeries.correlativo = nextCorrelativo;
    FileDb.saveTable('document_series', seriesList);

    // Calculate Totals
    let subtotal = 0;
    let igvTotal = 0;
    const computedItems = items.map((item) => {
      const lineTotal = item.cantidad * item.precioUnitario;
      const lineIgv = lineTotal * 0.18; // 18% standard IGV
      subtotal += lineTotal;
      igvTotal += lineIgv;
      return {
        ...item,
        igv: parseFloat(lineIgv.toFixed(2)),
      };
    });
    const total = subtotal + igvTotal;

    const docTotalString = total.toFixed(2);

    // Create Document record
    const docId = Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);
    const documentRecord = {
      id: docId,
      company_id: ctx.company.id,
      doc_type: '01',
      serie,
      correlativo: nextCorrelativo,
      status: 'submitted',
      issue_date: new Date().toISOString().split('T')[0],
      total: parseFloat(docTotalString),
      daily_summary_id: null,
      user_id: ctx.user.id,
      payload: {
        cliente,
        moneda,
        items: computedItems,
        tipoOperacion,
        totals: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          igvTotal: parseFloat(igvTotal.toFixed(2)),
          total: parseFloat(docTotalString),
        },
      },
    };

    // Store signed XML
    SunatMockService.generateAndStoreXml(docId, '01', serie, nextCorrelativo, documentRecord.payload);

    // Send to SUNAT (simulated)
    const sunatResult = SunatMockService.sendBillMock('01', serie, nextCorrelativo, total);

    // Update document status based on SUNAT response
    documentRecord.status = sunatResult.accepted ? 'accepted' : 'rejected';
    FileDb.insert('documents', documentRecord);

    // Save CDR constancia
    SunatMockService.generateAndStoreCdr(docId, '01', serie, nextCorrelativo, sunatResult.accepted, sunatResult.errorMessage || '');

    // Insert SUNAT submission record
    FileDb.insert('sunat_submissions', {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      document_id: docId,
      method: 'sendBill',
      status_code: sunatResult.statusCode,
      error_message: sunatResult.errorMessage,
    });

    // Create Notification and Audit Logs
    const message = sunatResult.accepted
      ? `Factura ${serie}-${nextCorrelativo} aceptada con éxito por SUNAT.`
      : `Factura ${serie}-${nextCorrelativo} rechazada por SUNAT: ${sunatResult.description}`;
    
    FileDb.insert('notifications', {
      company_id: ctx.company.id,
      title: sunatResult.accepted ? 'Comprobante Aceptado' : 'Comprobante Rechazado',
      message,
      type: sunatResult.accepted ? 'success' : 'error',
      read: false,
    });

    logAudit(
      ctx.company.id,
      ctx.user.id,
      'EMIT_INVOICE',
      'INVOICES',
      `Emitted invoice ${serie}-${nextCorrelativo} with total PEN ${docTotalString}. SUNAT Status: ${documentRecord.status}`,
      sunatResult.accepted ? 'success' : 'failure'
    );

    const response: InvoiceCreatedResponse = {
      id: docId,
      docType: '01',
      serie,
      correlativo: nextCorrelativo,
      status: documentRecord.status as any,
      total: docTotalString,
      sunat: {
        statusCode: sunatResult.statusCode,
        description: sunatResult.description,
        accepted: sunatResult.accepted,
        errorMessage: sunatResult.errorMessage,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
