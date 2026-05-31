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
    const cert = FileDb.findById('certificates', id);

    if (!cert || cert.company_id !== ctx.company.id) {
      return NextResponse.json({ message: 'Certificado no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: cert.id,
      company_id: cert.company_id,
      alias: cert.alias,
      filename: cert.filename,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      isActive: cert.isActive,
      hasPfxContent: !!cert.pfx_content,
      createdAt: cert.createdAt,
      updatedAt: cert.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving certificate details', error: error.message }, { status: 500 });
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
    const cert = FileDb.findById('certificates', id);

    if (!cert || cert.company_id !== ctx.company.id) {
      return NextResponse.json({ message: 'Certificado no encontrado' }, { status: 404 });
    }

    const updates: any = {};
    if (body.alias !== undefined) updates.alias = body.alias;
    if (body.pfxPassword !== undefined) updates.pfxPassword = body.pfxPassword;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    // If setting active, deactivate other certificates for the company
    if (body.isActive === true) {
      let certs = FileDb.getTable('certificates') || [];
      certs.forEach((c: any) => {
        if (c.company_id === ctx.company.id && c.id !== id) {
          c.isActive = false;
        }
      });
      FileDb.saveTable('certificates', certs);
    }

    const updated = FileDb.update('certificates', id, updates);

    logAudit(ctx.company.id, ctx.user.id, 'UPDATE_CERTIFICATE', 'CERTIFICATES', `Updated certificate ${cert.filename} (id: ${id})`);

    return NextResponse.json({
      id: updated.id,
      company_id: updated.company_id,
      alias: updated.alias,
      filename: updated.filename,
      validFrom: updated.validFrom,
      validTo: updated.validTo,
      isActive: updated.isActive,
      hasPfxContent: !!updated.pfx_content,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });

  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating certificate', error: error.message }, { status: 500 });
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
    const cert = FileDb.findById('certificates', id);

    if (!cert || cert.company_id !== ctx.company.id) {
      return NextResponse.json({ message: 'Certificado no encontrado' }, { status: 404 });
    }

    FileDb.delete('certificates', id);

    logAudit(ctx.company.id, ctx.user.id, 'DELETE_CERTIFICATE', 'CERTIFICATES', `Deleted certificate ${cert.filename} (id: ${id})`);

    return NextResponse.json({ success: true, message: 'Certificado eliminado correctamente.' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting certificate', error: error.message }, { status: 500 });
  }
}
