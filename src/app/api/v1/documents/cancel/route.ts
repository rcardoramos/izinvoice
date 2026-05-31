import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

interface DbDocument {
  id: string;
  company_id: string;
  doc_type: string;
  serie: string;
  correlativo: number;
  status: string;
  daily_summary_id: string | null;
  payload: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { documentIds, cancelReason } = body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { statusCode: 400, message: 'Se requiere una lista de documentIds para cancelar.' },
        { status: 400 }
      );
    }

    const allDocs = FileDb.getTable('documents') as DbDocument[];
    const matchedDocs = allDocs.filter(
      (doc) => doc.company_id === ctx.company.id && documentIds.includes(doc.id)
    );

    if (matchedDocs.length !== documentIds.length) {
      return NextResponse.json(
        { statusCode: 400, message: 'Uno o más documentos no existen o no pertenecen a su empresa.' },
        { status: 400 }
      );
    }

    // Validation checks
    for (const doc of matchedDocs) {
      const docType = doc.doc_type;
      if (docType !== '03' && docType !== '07' && docType !== '08') {
        return NextResponse.json(
          {
            statusCode: 400,
            message: `El documento ${doc.serie}-${doc.correlativo} de tipo ${docType} no se puede cancelar. Solo se pueden cancelar boletas (03), notas de crédito (07) y notas de débito (08).`,
          },
          { status: 400 }
        );
      }
      if (doc.status !== 'signed') {
        return NextResponse.json(
          {
            statusCode: 400,
            message: `El documento ${doc.serie}-${doc.correlativo} tiene estado '${doc.status}'. Solo se pueden cancelar documentos en estado 'signed' (firmados localmente).`,
          },
          { status: 400 }
        );
      }
      if (doc.daily_summary_id) {
        return NextResponse.json(
          {
            statusCode: 400,
            message: `El documento ${doc.serie}-${doc.correlativo} ya ha sido enviado o asociado a un resumen diario.`,
          },
          { status: 400 }
        );
      }
    }

    const nowStr = new Date().toISOString();
    const cancellationData = {
      cancelledBy: ctx.user.id,
      cancelledAt: nowStr,
      cancelReason: cancelReason || null,
    };

    // Perform updates
    const updatedDocs = allDocs.map((doc) => {
      if (documentIds.includes(doc.id)) {
        return {
          ...doc,
          status: 'cancelled',
          updated_at: nowStr,
          payload: {
            ...doc.payload,
            cancellation: cancellationData,
          },
        };
      }
      return doc;
    });

    FileDb.saveTable('documents', updatedDocs);

    // Create notifications and audit logs for each document
    for (const doc of matchedDocs) {
      const typeLabel = doc.doc_type === '07' ? 'Nota de Crédito' : doc.doc_type === '08' ? 'Nota de Débito' : 'Boleta';
      
      FileDb.insert('notifications', {
        company_id: ctx.company.id,
        title: `${typeLabel} Cancelada`,
        message: `${typeLabel} ${doc.serie}-${doc.correlativo} ha sido cancelada localmente.`,
        type: 'info',
        read: false,
      });

      logAudit(
        ctx.company.id,
        ctx.user.id,
        'CANCEL_DOCUMENT',
        'DOCUMENTS',
        `Cancelled ${typeLabel.toLowerCase()} ${doc.serie}-${doc.correlativo}. Reason: ${cancelReason || 'N/A'}`,
        'success'
      );
    }

    const cancelledResponse = matchedDocs.map((doc) => ({
      id: doc.id,
      docType: doc.doc_type,
      serie: doc.serie,
      correlativo: doc.correlativo,
      status: 'cancelled',
      cancellation: cancellationData,
    }));

    return NextResponse.json({ cancelled: cancelledResponse });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: errMessage },
      { status: 500 }
    );
  }
}
