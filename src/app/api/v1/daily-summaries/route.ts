import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { CloseDailySummaryRequest, DailySummarySubmitResponse } from '@/types/document.types';
import { SunatMockService } from '@/utils/sunat-mock';
import { todayPE } from '@/utils/date-pe';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const summaryType = searchParams.get('summaryType');
    const referenceDate = searchParams.get('referenceDate');
    const issueDate = searchParams.get('issueDate');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20') || 20, 100);

    let summaries = FileDb.getTable('daily_summaries');
    summaries = summaries.filter((s: any) => s.company_id === ctx.company.id);

    if (summaryType) {
      summaries = summaries.filter((s: any) => s.summary_type === summaryType);
    }
    if (referenceDate) {
      summaries = summaries.filter((s: any) => s.reference_date === referenceDate);
    }
    if (issueDate) {
      summaries = summaries.filter((s: any) => s.issue_date === issueDate);
    } else {
      if (from) {
        summaries = summaries.filter((s: any) => s.issue_date >= from);
      }
      if (to) {
        summaries = summaries.filter((s: any) => s.issue_date <= to);
      }
    }
    if (status) {
      summaries = summaries.filter((s: any) => s.status === status);
    }

    // Sort by created_at desc
    summaries.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Join document counts and map to camelCase API format
    const allDocs = FileDb.getTable('documents');
    const mapped = summaries.map((s: any) => {
      const linked = allDocs.filter((d: any) => d.daily_summary_id === s.id);
      return {
        id: s.id,
        summaryType: s.summary_type,
        summaryCode: s.summary_code,
        referenceDate: s.reference_date,
        issueDate: s.issue_date,
        correlativo: s.correlativo,
        ticket: s.ticket,
        status: s.status,
        statusCode: s.status_code,
        errorMessage: s.error_message,
        documentCount: linked.length,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });

    const total = mapped.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = mapped.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving summaries', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    let body: CloseDailySummaryRequest = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty body is fine, defaults will apply
    }
    
    const todayStr = todayPE();
    const referenceDate = body.referenceDate || todayStr;
    const issueDate = body.issueDate || todayStr;

    // Search for documents to close in this RC summary
    const allDocs = FileDb.getTable('documents');
    const matchedDocs = allDocs.filter(
      (doc: any) =>
        doc.company_id === ctx.company.id &&
        ['03', '07', '08'].includes(doc.doc_type) &&
        doc.status === 'signed' &&
        doc.daily_summary_id === null &&
        doc.issue_date === referenceDate
    );

    if (matchedDocs.length === 0) {
      return NextResponse.json(
        { statusCode: 400, message: `No hay boletas ni notas en estado 'firmado' (signed) para la fecha de emisión ${referenceDate}.` },
        { status: 400 }
      );
    }

    // Determine the next correlativo for RC summaries on the issueDate
    const allSummaries = FileDb.getTable('daily_summaries');
    const todaySummaries = allSummaries.filter(
      (s: any) =>
        s.company_id === ctx.company.id &&
        s.summary_type === 'RC' &&
        s.issue_date === issueDate
    );
    const nextCorrelativo = todaySummaries.length + 1;
    const cleanDateStr = issueDate.replace(/-/g, '');
    const summaryCode = `RC-${cleanDateStr}-${nextCorrelativo}`;

    // Request SUNAT ticket
    const ticket = SunatMockService.generateTicket();
    const summaryId = 'sum_' + Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);

    const summaryRecord = {
      id: summaryId,
      company_id: ctx.company.id,
      summary_type: 'RC',
      summary_code: summaryCode,
      reference_date: referenceDate,
      issue_date: issueDate,
      correlativo: nextCorrelativo,
      ticket,
      status: 'processing', // starts in processing so polling can be tested
      status_code: '98',
      error_message: null,
      xml_content: `<!-- Summary XML mock for ${summaryCode} with ${matchedDocs.length} items -->`,
      cdr_xml: null,
    };

    // Save summary record
    FileDb.insert('daily_summaries', summaryRecord);

    // Update matching documents with summary ID
    const updatedDocs = allDocs.map((doc: any) => {
      const match = matchedDocs.find((m: any) => m.id === doc.id);
      if (match) {
        return {
          ...doc,
          daily_summary_id: summaryId,
        };
      }
      return doc;
    });
    FileDb.saveTable('documents', updatedDocs);

    // Logs & notifications
    FileDb.insert('notifications', {
      company_id: ctx.company.id,
      title: 'Resumen Enviado',
      message: `Resumen de altas ${summaryCode} enviado a SUNAT. Ticket generado: ${ticket}.`,
      type: 'info',
      read: false,
    });

    logAudit(
      ctx.company.id,
      ctx.user.id,
      'SEND_RC_SUMMARY',
      'SUMMARIES',
      `Sent daily summary RC ${summaryCode} with ${matchedDocs.length} documents. Ticket: ${ticket}`,
      'success'
    );

    const response: DailySummarySubmitResponse = {
      id: summaryId,
      summaryType: 'RC',
      summaryCode,
      referenceDate: referenceDate as any,
      issueDate: issueDate as any,
      correlativo: nextCorrelativo,
      status: 'processing',
      ticket,
      statusCode: '98',
      sunat: {
        statusCode: '98',
        description: 'El resumen está siendo procesado por SUNAT.',
        processing: true,
        documentCount: matchedDocs.length,
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
