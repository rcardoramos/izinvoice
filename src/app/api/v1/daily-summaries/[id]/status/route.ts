import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { DailySummarySubmitResponse } from '@/types/document.types';
import { SunatMockService } from '@/utils/sunat-mock';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const summary = FileDb.findById('daily_summaries', id);

    if (!summary || summary.company_id !== ctx.company.id) {
      return NextResponse.json(
        { statusCode: 404, message: 'Resumen diario no encontrado.' },
        { status: 404 }
      );
    }

    // If already finalized, return current status
    if (['accepted', 'rejected', 'failed'].includes(summary.status)) {
      const response: DailySummarySubmitResponse = {
        id: summary.id,
        summaryType: summary.summary_type,
        summaryCode: summary.summary_code,
        referenceDate: summary.reference_date,
        issueDate: summary.issue_date,
        correlativo: summary.correlativo,
        status: summary.status,
        ticket: summary.ticket,
        statusCode: summary.status_code,
        errorMessage: summary.error_message,
        sunat: {
          statusCode: summary.status_code,
          description: summary.status === 'accepted' ? 'El resumen ha sido ACEPTADO' : `El resumen ha fallado.`,
          accepted: summary.status === 'accepted',
          processing: false,
        },
      };
      return NextResponse.json(response);
    }

    // Increment poll attempts
    const attempts = (summary.poll_attempts || 0) + 1;
    FileDb.update('daily_summaries', id, { poll_attempts: attempts });

    // Poll SUNAT Mock
    const pollResult = SunatMockService.pollSummaryStatusMock(summary.ticket, attempts);

    if (pollResult.processing) {
      // Still processing, update database status
      FileDb.update('daily_summaries', id, {
        status: 'processing',
        status_code: '98',
      });

      const response: DailySummarySubmitResponse = {
        id: summary.id,
        summaryType: summary.summary_type,
        summaryCode: summary.summary_code,
        referenceDate: summary.reference_date,
        issueDate: summary.issue_date,
        correlativo: summary.correlativo,
        status: 'processing',
        ticket: summary.ticket,
        statusCode: '98',
        sunat: {
          statusCode: '98',
          description: pollResult.description,
          processing: true,
        },
      };
      return NextResponse.json(response);
    }

    if (pollResult.accepted) {
      // Transition to accepted in database
      FileDb.update('daily_summaries', id, {
        status: 'accepted',
        status_code: '0',
        cdr_xml: `<!-- Constancia de Recepcion (CDR) XML mock for summary ${summary.summary_code} -->`,
      });

      // Update all linked documents
      const allDocs = FileDb.getTable('documents');
      const linkedDocs = allDocs.filter((d: any) => d.daily_summary_id === id);

      const isVoidType =
        summary.summary_type === 'RA' ||
        (summary.summary_type === 'RC' && linkedDocs.some((d: any) => d.payload?._rcVoid?.voidSummaryId === id));

      const updatedDocs = allDocs.map((doc: any) => {
        if (doc.daily_summary_id === id) {
          const newStatus = isVoidType ? 'voided' : 'accepted';
          
          // Generate CDR for this document
          SunatMockService.generateAndStoreCdr(doc.id, doc.doc_type, doc.serie, doc.correlativo, true, '');

          // If accepted altas (non-void), clear void locks.
          // If voided, keep void information for audit trace
          return {
            ...doc,
            status: newStatus,
          };
        }
        return doc;
      });
      FileDb.saveTable('documents', updatedDocs);

      // Create Notification
      const title = isVoidType ? 'Comprobantes Anulados' : 'Comprobantes Aceptados';
      const msg = isVoidType
        ? `SUNAT aceptó la comunicación de baja ${summary.summary_code}. Los documentos vinculados se marcaron como ANULADOS.`
        : `SUNAT aceptó el resumen diario ${summary.summary_code}. Los documentos vinculados se marcaron como ACEPTADOS.`;

      FileDb.insert('notifications', {
        company_id: ctx.company.id,
        title,
        message: msg,
        type: 'success',
        read: false,
      });

      logAudit(
        ctx.company.id,
        ctx.user.id,
        'POLL_SUMMARY_SUCCESS',
        'SUMMARIES',
        `Summary ${summary.summary_code} (ticket ${summary.ticket}) processed successfully. Linked documents updated.`,
        'success'
      );

      const response: DailySummarySubmitResponse = {
        id: summary.id,
        summaryType: summary.summary_type,
        summaryCode: summary.summary_code,
        referenceDate: summary.reference_date,
        issueDate: summary.issue_date,
        correlativo: summary.correlativo,
        status: 'accepted',
        ticket: summary.ticket,
        statusCode: '0',
        sunat: {
          statusCode: '0',
          description: pollResult.description,
          accepted: true,
          processing: false,
        },
      };
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Estado desconocido de consulta' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
