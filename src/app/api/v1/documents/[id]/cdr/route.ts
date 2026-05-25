import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const document = FileDb.findById('documents', id);

    if (!document || document.company_id !== ctx.company.id) {
      return NextResponse.json({ statusCode: 404, message: 'Documento no encontrado' }, { status: 404 });
    }

    const cdrFilePath = path.join(process.cwd(), 'data', 'documents', id, 'cdr.xml');
    let cdrContent = '';

    if (fs.existsSync(cdrFilePath)) {
      cdrContent = fs.readFileSync(cdrFilePath, 'utf-8');
    } else {
      // Fallback generator if storage was reset
      cdrContent = `<?xml version="1.0" encoding="UTF-8"?>
<ApplicationResponse xmlns="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2">
  <cbc:ID>CDR-RESPALDO-${document.serie}-${document.correlativo}</cbc:ID>
  <cbc:Description>El comprobante ha sido ACEPTADO (Respaldo)</cbc:Description>
</ApplicationResponse>`;
    }

    const filename = `R-${document.serie}-${document.correlativo}.xml`;

    return new NextResponse(cdrContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
