import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { VoidDailySummaryRequest, DailySummarySubmitResponse } from '@/types/document.types';
import { SunatMockService } from '@/utils/sunat-mock';

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body: VoidDailySummaryRequest = await req.json();
    const { documentIds, referenceDate, issueDate } = body;

    if (!documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { statusCode: 400, message: 'Se requiere una lista de documentIds para anular.' },
        { status: 400 }
      );
    }

    // Retrieve documents and validate void conditions
    const allDocs = FileDb.getTable('documents');
    const matchedDocs = allDocs.filter(
      (doc: any) =>
        doc.company_id === ctx.company.id &&
        documentIds.includes(doc.id)
    );

    if (matchedDocs.length !== documentIds.length) {
      return NextResponse.json(
        { statusCode: 400, message: 'Uno o más documentos no existen o no pertenecen a su empresa.' },
        { status: 400 }
      );
    }

    // Check each document for void eligibility
    const refDate = referenceDate || matchedDocs[0].issue_date;

    for (const doc of matchedDocs) {
      if (doc.doc_type !== '03') {
        return NextResponse.json(
          { statusCode: 400, message: `El documento ${doc.serie}-${doc.correlativo} no es una Boleta. Utilice resúmenes de bajas (RA) para Facturas.` },
          { status: 400 }
        );
      }
      if (doc.status !== 'accepted') {
        return NextResponse.json(
          { statusCode: 400, message: `El documento ${doc.serie}-${doc.correlativo} debe estar en estado 'Aceptado' para ser anulado.` },
          { status: 400 }
        );
      }
      if (!doc.daily_summary_id) {
        return NextResponse.json(
          { statusCode: 400, message: `El documento ${doc.serie}-${doc.correlativo} debe haber sido reportado en un resumen diario previo para ser anulado.` },
          { status: 400 }
        );
      }
      if (doc.payload?._rcVoid) {
        return NextResponse.json(
          { statusCode: 400, message: `El documento ${doc.serie}-${doc.correlativo} ya se encuentra en proceso de anulación.` },
          { status: 400 }
        );
      }
      if (doc.issue_date !== refDate) {
        return NextResponse.json(
          { statusCode: 400, message: 'Todos los documentos seleccionados en el resumen de bajas deben compartir la misma fecha de emisión original.' },
          { status: 400 }
        );
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalIssueDate = issueDate || todayStr;

    // Determine the next correlativo for RC summaries on the finalIssueDate
    const allSummaries = FileDb.getTable('daily_summaries');
    const todaySummaries = allSummaries.filter(
      (s: any) =>
        s.company_id === ctx.company.id &&
        s.summary_type === 'RC' &&
        s.issue_date === finalIssueDate
    );
    const nextCorrelativo = todaySummaries.length + 1;
    const cleanDateStr = finalIssueDate.replace(/-/g, '');
    const summaryCode = `RC-${cleanDateStr}-${nextCorrelativo}`;

    // Request SUNAT ticket
    const ticket = SunatMockService.generateTicket();
    const summaryId = 'sum_' + Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);

    const summaryRecord = {
      id: summaryId,
      company_id: ctx.company.id,
      summary_type: 'RC',
      summary_code: summaryCode,
      reference_date: refDate,
      issue_date: finalIssueDate,
      correlativo: nextCorrelativo,
      ticket,
      status: 'processing',
      status_code: '98',
      error_message: null,
      xml_content: `<!-- Summary Void XML mock for ${summaryCode} with ${matchedDocs.length} items voiding (Condition 3) -->`,
      cdr_xml: null,
    };

    FileDb.insert('daily_summaries', summaryRecord);

    // Update documents to flag _rcVoid and associate them with the new summary ID
    const updatedDocs = allDocs.map((doc: any) => {
      const match = matchedDocs.find((m: any) => m.id === doc.id);
      if (match) {
        return {
          ...doc,
          daily_summary_id: summaryId,
          payload: {
            ...doc.payload,
            _rcVoid: {
              voidSummaryId: summaryId,
              originalDailySummaryId: doc.daily_summary_id,
            },
          },
        };
      }
      return doc;
    });
    FileDb.saveTable('documents', updatedDocs);

    // Logs & notifications
    FileDb.insert('notifications', {
      company_id: ctx.company.id,
      title: 'Baja de Boleta Enviada',
      message: `Anulación de boletas ${summaryCode} enviada a SUNAT. Ticket generado: ${ticket}.`,
      type: 'info',
      read: false,
    });

    logAudit(
      ctx.company.id,
      ctx.user.id,
      'VOID_BOLETAS_RC',
      'SUMMARIES',
      `Sent daily summary RC void ${summaryCode} for ${matchedDocs.length} boletas. Ticket: ${ticket}`,
      'success'
    );

    const response: DailySummarySubmitResponse = {
      id: summaryId,
      summaryType: 'RC',
      summaryCode,
      referenceDate: refDate as any,
      issueDate: finalIssueDate as any,
      correlativo: nextCorrelativo,
      status: 'processing',
      ticket,
      statusCode: '98',
      sunat: {
        statusCode: '98',
        description: 'El resumen de bajas está siendo procesado por SUNAT.',
        processing: true,
        voidedCount: matchedDocs.length,
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
