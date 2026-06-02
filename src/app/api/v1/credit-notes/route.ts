import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { CreateNoteRequest, NoteBillResponse, NoteSignedResponse } from '@/types/document.types';
import { SunatMockService } from '@/utils/sunat-mock';
import { todayPE } from '@/utils/date-pe';

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body: CreateNoteRequest = await req.json();
    const { serie, moneda, documentoAfectadoId, cliente, items, motivoCodigo, motivoDescripcion } = body;

    // Retrieve affected document
    const affectedDoc = FileDb.findById('documents', documentoAfectadoId);
    if (!affectedDoc || affectedDoc.company_id !== ctx.company.id) {
      return NextResponse.json(
        { statusCode: 404, message: 'El documento original afectado no existe.' },
        { status: 404 }
      );
    }

    // Verify series match
    const isFactura = affectedDoc.doc_type === '01';
    const expectedPrefix = isFactura ? 'FC' : 'BC';
    if (!serie.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { statusCode: 400, message: `Serie inválida. Las notas para ${isFactura ? 'Facturas' : 'Boletas'} deben comenzar con '${expectedPrefix}'.` },
        { status: 400 }
      );
    }

    // Validate series registration
    const seriesList = FileDb.getTable('document_series');
    const seriesIndex = seriesList.findIndex(
      (s: any) => s.company_id === ctx.company.id && s.doc_type === '07' && s.serie === serie
    );

    if (seriesIndex === -1) {
      return NextResponse.json(
        { statusCode: 400, message: `La serie '${serie}' no está registrada para Notas de Crédito.` },
        { status: 400 }
      );
    }

    // Increment correlative
    const activeSeries = seriesList[seriesIndex];
    const nextCorrelativo = activeSeries.correlativo + 1;
    activeSeries.correlativo = nextCorrelativo;
    FileDb.saveTable('document_series', seriesList);

    // Calculate totals
    let total = 0;
    const computedItems = items.map((item) => {
      const lineTotal = item.cantidad * item.precioUnitario;
      const lineSubtotal = parseFloat((lineTotal / 1.18).toFixed(2));
      const lineIgv = parseFloat((lineTotal - lineSubtotal).toFixed(2));
      total += lineTotal;
      return {
        ...item,
        igv: lineIgv,
      };
    });
    const subtotal = parseFloat((total / 1.18).toFixed(2));
    const igvTotal = parseFloat((total - subtotal).toFixed(2));
    const docTotalString = total.toFixed(2);

    const docId = Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);
    const documentRecord = {
      id: docId,
      company_id: ctx.company.id,
      doc_type: '07',
      serie,
      correlativo: nextCorrelativo,
      status: isFactura ? 'submitted' : 'signed',
      issue_date: todayPE(),
      total: parseFloat(docTotalString),
      daily_summary_id: null,
      user_id: ctx.user.id,
      payload: {
        cliente,
        moneda,
        items: computedItems,
        documentoAfectadoId,
        documentoAfectado: {
          docType: affectedDoc.doc_type,
          serie: affectedDoc.serie,
          correlativo: affectedDoc.correlativo,
        },
        billingReference: {
          id: `${affectedDoc.serie}-${affectedDoc.correlativo}`,
          documentTypeCode: affectedDoc.doc_type,
          serie: affectedDoc.serie,
          correlativo: affectedDoc.correlativo,
        },
        motivoCodigo: motivoCodigo || '01', // Catálogo 09: Anulación de la operación
        motivoDescripcion: motivoDescripcion || 'ANULACION DE LA VENTA',
        totals: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          igvTotal: parseFloat(igvTotal.toFixed(2)),
          total: parseFloat(docTotalString),
        },
      },
    };

    // Store signed UBL XML
    SunatMockService.generateAndStoreXml(docId, '07', serie, nextCorrelativo, documentRecord.payload);

    // Insert cross reference note link
    FileDb.insert('invoice_notes', {
      company_id: ctx.company.id,
      note_id: docId,
      affected_document_id: affectedDoc.id,
      motivo_codigo: motivoCodigo || '01',
      motivo_descripcion: motivoDescripcion || 'ANULACION DE LA VENTA',
    });

    if (isFactura) {
      // Synchronous path (sendBill)
      const sunatResult = SunatMockService.sendBillMock('07', serie, nextCorrelativo, total);
      documentRecord.status = sunatResult.accepted ? 'accepted' : 'rejected';
      FileDb.insert('documents', documentRecord);
      
      SunatMockService.generateAndStoreCdr(docId, '07', serie, nextCorrelativo, sunatResult.accepted, sunatResult.errorMessage || '');

      FileDb.insert('sunat_submissions', {
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        document_id: docId,
        method: 'sendBill',
        status_code: sunatResult.statusCode,
        error_message: sunatResult.errorMessage,
      });

      // Notification
      const message = sunatResult.accepted
        ? `Nota de Crédito ${serie}-${nextCorrelativo} aceptada con éxito por SUNAT.`
        : `Nota de Crédito ${serie}-${nextCorrelativo} rechazada: ${sunatResult.description}`;

      FileDb.insert('notifications', {
        company_id: ctx.company.id,
        title: sunatResult.accepted ? 'Nota Aceptada' : 'Nota Rechazada',
        message,
        type: sunatResult.accepted ? 'success' : 'error',
        read: false,
      });

      logAudit(
        ctx.company.id,
        ctx.user.id,
        'EMIT_CREDIT_NOTE',
        'CREDIT_NOTES',
        `Emitted NC ${serie}-${nextCorrelativo} (sync sendBill) affecting Factura ${affectedDoc.serie}-${affectedDoc.correlativo}. Status: ${documentRecord.status}`,
        sunatResult.accepted ? 'success' : 'failure'
      );

      const response: NoteBillResponse = {
        id: docId,
        docType: '07',
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
    } else {
      // Asynchronous path (signed, pending RC)
      FileDb.insert('documents', documentRecord);

      FileDb.insert('notifications', {
        company_id: ctx.company.id,
        title: 'Nota de Crédito Emitida',
        message: `Nota de Crédito ${serie}-${nextCorrelativo} emitida. Pendiente de envío en Resumen Diario (RC).`,
        type: 'info',
        read: false,
      });

      logAudit(
        ctx.company.id,
        ctx.user.id,
        'EMIT_CREDIT_NOTE',
        'CREDIT_NOTES',
        `Emitted NC ${serie}-${nextCorrelativo} (async) affecting Boleta ${affectedDoc.serie}-${affectedDoc.correlativo}. Status: signed`,
        'success'
      );

      const response: NoteSignedResponse = {
        id: docId,
        docType: '07',
        serie,
        correlativo: nextCorrelativo,
        status: 'signed',
        total: docTotalString,
        issueDate: documentRecord.issue_date,
        documentoAfectado: documentRecord.payload.documentoAfectado,
        message: 'Nota de Crédito firmada localmente. Lista para ser incluida en el Resumen Diario.',
      };
      return NextResponse.json(response);
    }
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
