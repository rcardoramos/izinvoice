import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { todayPE } from '@/utils/date-pe';

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body is fine, defaults will apply
    }

    const referenceDate = body.referenceDate || todayPE();
    const issueDate = body.issueDate || todayPE();
    const page = parseInt(body.page) || 1;
    const limit = Math.min(parseInt(body.limit) || 20, 100);

    const allDocs = FileDb.getTable('documents');
    const matchedDocs = allDocs.filter(
      (doc: any) =>
        doc.company_id === ctx.company.id &&
        ['03', '07', '08'].includes(doc.doc_type) &&
        doc.status === 'signed' &&
        doc.daily_summary_id === null &&
        doc.issue_date === referenceDate
    );

    const total = matchedDocs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedDocs = matchedDocs.slice(offset, offset + limit);

    // Map database documents to camelCase matching PreviewDoc interface
    const mappedDocs = paginatedDocs.map((doc: any) => {
      const billingReference = doc.payload?.documentoAfectado ? {
        id: `${doc.payload.documentoAfectado.serie}-${doc.payload.documentoAfectado.correlativo}`,
        documentTypeCode: doc.payload.documentoAfectado.docType,
        serie: doc.payload.documentoAfectado.serie,
        correlativo: doc.payload.documentoAfectado.correlativo,
      } : undefined;

      const payload = doc.payload ? {
        ...doc.payload,
        billingReference: doc.payload.billingReference || billingReference,
      } : undefined;

      return {
        id: doc.id,
        docType: doc.doc_type,
        serie: doc.serie,
        correlativo: doc.correlativo,
        issueDate: doc.issue_date,
        total: doc.total,
        status: doc.status,
        cliente: doc.payload?.cliente,
        billingReference,
        payload,
      };
    });

    return NextResponse.json({
      documentCount: total,
      referenceDate,
      issueDate,
      documents: {
        data: mappedDocs,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
