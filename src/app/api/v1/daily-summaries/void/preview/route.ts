import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { todayPE } from '@/utils/date-pe';

interface DbDocument {
  id: string;
  company_id: string;
  doc_type: string;
  serie: string;
  correlativo: number;
  status: string;
  issue_date: string;
  total: number;
  daily_summary_id: string | null;
  payload?: {
    cliente?: { razonSocial?: string; numDoc?: string; tipoDoc?: string };
    documentoAfectado?: {
      docType: string;
      serie: string;
      correlativo: number;
    };
    billingReference?: {
      id?: string;
      documentTypeCode?: string;
      serie?: string;
      correlativo?: number;
    };
    _rcVoid?: unknown;
  };
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    let body: {
      documentIds?: string[];
      referenceDate?: string;
      issueDate?: string;
      page?: string;
      limit?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      // Empty body is fine
    }

    const documentIds = body.documentIds || [];
    const referenceDate = body.referenceDate || todayPE();
    const issueDate = body.issueDate || todayPE();
    const page = parseInt(body.page || '1') || 1;
    const limit = Math.min(parseInt(body.limit || '20') || 20, 100);

    const allDocs = FileDb.getTable('documents') as DbDocument[];
    let matchedDocs: DbDocument[] = [];

    if (documentIds.length > 0) {
      matchedDocs = allDocs.filter(
        (doc) =>
          doc.company_id === ctx.company.id &&
          (doc.doc_type === '03' || doc.doc_type === '07' || doc.doc_type === '08') &&
          doc.status === 'accepted' &&
          documentIds.includes(doc.id)
      );
    } else {
      matchedDocs = allDocs.filter(
        (doc) =>
          doc.company_id === ctx.company.id &&
          (doc.doc_type === '03' || doc.doc_type === '07' || doc.doc_type === '08') &&
          doc.status === 'accepted' &&
          doc.daily_summary_id !== null &&
          !doc.payload?._rcVoid &&
          doc.issue_date === referenceDate
      );
    }

    const total = matchedDocs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedDocs = matchedDocs.slice(offset, offset + limit);

    const mappedDocs = paginatedDocs.map((doc) => {
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
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: errMessage },
      { status: 500 }
    );
  }
}
