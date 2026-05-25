import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get('docType');
    const status = searchParams.get('status');
    const dailySummaryId = searchParams.get('dailySummaryId');
    const search = searchParams.get('search');

    let docs = FileDb.getTable('documents');
    
    // Filter by company (bypassed for super admin)
    if (ctx.company) {
      docs = docs.filter((d: any) => d.company_id === ctx.company.id);
    }

    // Apply query filters
    if (docType) {
      docs = docs.filter((d: any) => d.doc_type === docType);
    }
    if (status) {
      docs = docs.filter((d: any) => d.status === status);
    }
    if (dailySummaryId === 'null') {
      docs = docs.filter((d: any) => d.daily_summary_id === null);
    } else if (dailySummaryId) {
      docs = docs.filter((d: any) => d.daily_summary_id === dailySummaryId);
    }

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d: any) => 
        d.serie.toLowerCase().includes(q) || 
        d.correlativo.toString().includes(q) ||
        (d.payload?.cliente?.razonSocial && d.payload.cliente.razonSocial.toLowerCase().includes(q)) ||
        (d.payload?.cliente?.numDoc && d.payload.cliente.numDoc.includes(q))
      );
    }

    // Sort by creation date descending
    docs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error listing documents', error: error.message },
      { status: 500 }
    );
  }
}
