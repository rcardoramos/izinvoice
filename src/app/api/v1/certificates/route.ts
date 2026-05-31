import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';
import { formatDateOnlyPE } from '@/utils/date-pe';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const isActiveParam = searchParams.get('isActive');

    let certs = FileDb.getTable('certificates') || [];

    // Filter by company
    if (ctx.company) {
      certs = certs.filter((c: any) => c.company_id === ctx.company.id);
    }

    // Filter by isActive
    if (isActiveParam !== null) {
      const activeFilter = isActiveParam === 'true';
      certs = certs.filter((c: any) => c.isActive === activeFilter);
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = certs.length;
    const paginatedCerts = certs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: paginatedCerts.map((c: any) => ({
        id: c.id,
        company_id: c.company_id,
        alias: c.alias,
        filename: c.filename,
        validFrom: c.validFrom,
        validTo: c.validTo,
        isActive: c.isActive,
        hasPfxContent: !!c.pfx_content,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving certificates', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const pfxPassword = formData.get('pfxPassword') as string | null;
    const alias = formData.get('alias') as string | null;
    const setActiveParam = formData.get('setActive');
    const setActive = setActiveParam === 'true' || setActiveParam === '1' || setActiveParam === null || setActiveParam === '';

    if (!file || !pfxPassword) {
      return NextResponse.json({ message: 'Faltan campos obligatorios: file y pfxPassword.' }, { status: 400 });
    }

    const filename = file.name || 'certificado.pfx';
    if (!filename.endsWith('.pfx') && !filename.endsWith('.p12')) {
      return NextResponse.json({ message: 'El certificado debe ser un archivo con extensión .pfx o .p12' }, { status: 400 });
    }

    // Convert file to base64 to store in JSON DB
    const bytes = await file.arrayBuffer();
    const base64Content = Buffer.from(bytes).toString('base64');

    // Deactivate other certificates if setting this one active
    if (setActive) {
      let certs = FileDb.getTable('certificates') || [];
      certs.forEach((c: any) => {
        if (c.company_id === ctx.company.id) {
          c.isActive = false;
        }
      });
      FileDb.saveTable('certificates', certs);
    }

    // Calculate simulated validity dates: from today to 2 years in the future in Peru timezone
    const now = new Date();
    const validFrom = formatDateOnlyPE(now);
    
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const validTo = formatDateOnlyPE(futureDate);

    const newCert = FileDb.insert('certificates', {
      company_id: ctx.company.id,
      alias: alias || filename.split('.')[0] || 'Certificado',
      filename,
      validFrom,
      validTo,
      isActive: setActive,
      pfxPassword,
      pfx_content: base64Content,
    });

    logAudit(ctx.company.id, ctx.user.id, 'UPLOAD_CERTIFICATE', 'CERTIFICATES', `Uploaded certificate ${filename} (alias: ${alias})`);

    return NextResponse.json({
      id: newCert.id,
      company_id: newCert.company_id,
      alias: newCert.alias,
      filename: newCert.filename,
      validFrom: newCert.validFrom,
      validTo: newCert.validTo,
      isActive: newCert.isActive,
      hasPfxContent: true,
      createdAt: newCert.created_at,
      updatedAt: newCert.updated_at,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Error uploading certificate', error: error.message }, { status: 500 });
  }
}
