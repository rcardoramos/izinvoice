import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { DailySummaryDetail } from '@/types/document.types';

export async function GET(
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

    const allDocs = FileDb.getTable('documents');
    const linkedDocs = allDocs.filter((d: any) => d.daily_summary_id === id);
    const hasVoid = linkedDocs.some((d: any) => d.payload?._rcVoid?.voidSummaryId === id);
    let calculatedType = summary.summary_type;
    if (summary.summary_type === 'RC' && hasVoid) {
      calculatedType = 'RC_VOID';
    }

    const response: DailySummaryDetail & { documents: any[] } = {
      id: summary.id,
      summaryType: calculatedType as any,
      summaryCode: summary.summary_code,
      referenceDate: summary.reference_date,
      issueDate: summary.issue_date,
      correlativo: summary.correlativo,
      status: summary.status,
      ticket: summary.ticket,
      statusCode: summary.status_code,
      errorMessage: summary.error_message,
      documentCount: linkedDocs.length,
      createdAt: summary.created_at,
      updatedAt: summary.updated_at,
      documents: linkedDocs.map((d: any) => ({
        id: d.id,
        docType: d.doc_type,
        serie: d.serie,
        correlativo: d.correlativo,
        status: d.status,
        total: d.total,
        issueDate: d.issue_date,
        cliente: d.payload?.cliente || d.cliente,
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
