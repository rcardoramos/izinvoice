import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

interface DbDocument {
  id: string;
  company_id: string;
  doc_type: string;
  serie: string;
  correlativo: number;
  status: string;
  issue_date: string;
  daily_summary_id: string | null;
  created_at: string;
  payload?: {
    cliente?: { razonSocial?: string; numDoc?: string };
  };
}

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    
    const getQueryArray = (key: string): string[] => {
      const vals = searchParams.getAll(key);
      if (vals.length === 0) return [];
      return vals.flatMap((v) => v.split(',')).filter(Boolean);
    };

    const docTypes = getQueryArray('docType');
    const statuses = getQueryArray('status');
    const dailySummaryId = searchParams.get('dailySummaryId');
    const issueDate = searchParams.get('issueDate') || searchParams.get('issue_date');
    const search = searchParams.get('q') || searchParams.get('search');

    let docs = FileDb.getTable('documents') as DbDocument[];
    
    // Filter by company (bypassed for super admin)
    if (ctx.company) {
      docs = docs.filter((d) => d.company_id === ctx.company.id);
    }

    // Apply query filters
    if (docTypes.length > 0) {
      docs = docs.filter((d) => docTypes.includes(d.doc_type));
    }
    if (statuses.length > 0) {
      docs = docs.filter((d) => statuses.includes(d.status));
    }
    if (issueDate) {
      docs = docs.filter((d) => d.issue_date === issueDate);
    }
    if (dailySummaryId === 'null') {
      docs = docs.filter((d) => d.daily_summary_id === null);
    } else if (dailySummaryId) {
      docs = docs.filter((d) => d.daily_summary_id === dailySummaryId);
    }

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => 
        d.serie.toLowerCase().includes(q) || 
        d.correlativo.toString().includes(q) ||
        (d.payload?.cliente?.razonSocial && d.payload.cliente.razonSocial.toLowerCase().includes(q)) ||
        (d.payload?.cliente?.numDoc && d.payload.cliente.numDoc.includes(q))
      );
    }

    // Sort by creation date descending
    docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(docs);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { statusCode: 500, message: 'Error listing documents', error: errMessage },
      { status: 500 }
    );
  }
}
