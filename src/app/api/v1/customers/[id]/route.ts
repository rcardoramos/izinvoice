import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const customer = FileDb.findById('customers', id);

    if (!customer || customer.company_id !== ctx.company.id || customer.deleted_at) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    // Query historical billing info
    const allDocs = FileDb.getTable('documents');
    const customerDocs = allDocs.filter(
      (d: any) =>
        d.company_id === ctx.company.id &&
        d.payload?.cliente?.numDoc === customer.doc_number &&
        ['accepted', 'signed', 'submitted'].includes(d.status)
    );

    // Calculate metrics
    const invoices = customerDocs.filter((d: any) => d.doc_type === '01');
    const boletas = customerDocs.filter((d: any) => d.doc_type === '03');
    const totalBilled = customerDocs.reduce((sum: number, d: any) => sum + d.total, 0);

    let lastPurchaseDate = null;
    if (customerDocs.length > 0) {
      const dates = customerDocs.map((d: any) => d.issue_date || d.issueDate).filter(Boolean);
      if (dates.length > 0) {
        dates.sort();
        lastPurchaseDate = dates[dates.length - 1];
      }
    }

    // Purchase frequency calculation
    let frequency = 'Única vez';
    if (customerDocs.length > 1) {
      const dates = customerDocs.map((d: any) => new Date(d.issue_date).getTime()).sort((a, b) => a - b);
      const spanMs = dates[dates.length - 1] - dates[0];
      const spanDays = Math.ceil(spanMs / (1000 * 60 * 60 * 24));
      const avgGapDays = spanDays / (customerDocs.length - 1);
      
      if (avgGapDays <= 7) frequency = 'Semanal';
      else if (avgGapDays <= 15) frequency = 'Quincenal';
      else if (avgGapDays <= 31) frequency = 'Mensual';
      else frequency = 'Esporádica';
    }

    return NextResponse.json({
      customer,
      metrics: {
        totalDocsCount: customerDocs.length,
        invoicesCount: invoices.length,
        boletasCount: boletas.length,
        totalBilled: parseFloat(totalBilled.toFixed(2)),
        lastPurchaseDate,
        frequency,
        history: customerDocs.map((d: any) => ({
          id: d.id,
          docType: d.doc_type,
          serie: d.serie,
          correlativo: d.correlativo,
          issueDate: d.issue_date,
          total: d.total,
          status: d.status,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving customer details', error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const customer = FileDb.findById('customers', id);

    if (!customer || customer.company_id !== ctx.company.id || customer.deleted_at) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    const updates: any = {};
    if (body.razonSocial !== undefined) updates.razon_social = body.razonSocial;
    if (body.nombreComercial !== undefined) updates.nombre_comercial = body.nombreComercial;
    if (body.direccion !== undefined) updates.direccion = body.direccion;
    if (body.correo !== undefined) updates.correo = body.correo;
    if (body.telefono !== undefined) updates.telefono = body.telefono;
    if (body.status !== undefined) updates.status = body.status;
    
    if (body.isActive === false) {
      updates.deleted_at = new Date().toISOString();
      updates.status = 'inactive';
      logAudit(ctx.company.id, ctx.user.id, 'DELETE_CUSTOMER', 'CUSTOMERS', `Deleted customer ${customer.razon_social} (${customer.doc_number})`);
    } else if (body.isActive === true) {
      updates.deleted_at = null;
      updates.status = 'active';
      logAudit(ctx.company.id, ctx.user.id, 'ACTIVATE_CUSTOMER', 'CUSTOMERS', `Activated customer ${customer.razon_social} (${customer.doc_number})`);
    } else {
      logAudit(ctx.company.id, ctx.user.id, 'UPDATE_CUSTOMER', 'CUSTOMERS', `Updated customer ${customer.razon_social} (${customer.doc_number})`);
    }

    const updated = FileDb.update('customers', id, updates);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating customer', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const customer = FileDb.findById('customers', id);

    if (!customer || customer.company_id !== ctx.company.id || customer.deleted_at) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    // Soft delete
    FileDb.update('customers', id, { deleted_at: new Date().toISOString() });

    logAudit(ctx.company.id, ctx.user.id, 'DELETE_CUSTOMER', 'CUSTOMERS', `Deleted customer ${customer.razon_social} (${customer.doc_number})`);

    return NextResponse.json({ success: true, message: 'Cliente eliminado correctamente.' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting customer', error: error.message }, { status: 500 });
  }
}
