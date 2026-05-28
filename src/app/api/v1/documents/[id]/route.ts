import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { DocumentDetail } from '@/types/document.types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const document = FileDb.findById('documents', id);

    if (!document || (ctx.user.role !== 'super_admin' && document.company_id !== ctx.company?.id)) {
      return NextResponse.json(
        { statusCode: 404, message: 'Documento no encontrado.' },
        { status: 404 }
      );
    }

    // Join SUNAT submission
    const submissions = FileDb.getTable('sunat_submissions');
    const submission = submissions.find((s: any) => s.document_id === id);

    const response: DocumentDetail = {
      id: document.id,
      docType: document.doc_type,
      serie: document.serie,
      correlativo: document.correlativo,
      status: document.status,
      total: document.total.toString(),
      issueDate: document.issue_date,
      dailySummaryId: document.daily_summary_id,
      payload: document.payload,
      createdAt: document.created_at,
      updatedAt: document.updated_at,
      sunat: submission
        ? {
            method: submission.method,
            statusCode: submission.status_code,
            errorMessage: submission.error_message,
            createdAt: submission.created_at,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
