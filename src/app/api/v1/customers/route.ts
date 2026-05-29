import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const qParam = searchParams.get('q') || searchParams.get('search');
    const docNumber = searchParams.get('docNumber');
    const isActiveParam = searchParams.get('isActive');

    let customers = FileDb.getTable('customers');
    
    // Filter by company (bypassed for super admin)
    if (ctx.company) {
      customers = customers.filter((c: any) => c.company_id === ctx.company.id);
    }

    // Filter by isActive
    if (isActiveParam !== null) {
      const activeFilter = isActiveParam === 'true';
      customers = customers.filter((c: any) => {
        const isCurrentlyActive = !c.deleted_at && c.status !== 'inactive';
        return activeFilter ? isCurrentlyActive : !isCurrentlyActive;
      });
    }

    // Search filter
    if (docNumber) {
      customers = customers.filter((c: any) => c.doc_number === docNumber);
    } else if (qParam) {
      const q = qParam.toLowerCase();
      customers = customers.filter(
        (c: any) =>
          c.doc_number.includes(q) ||
          c.razon_social.toLowerCase().includes(q) ||
          (c.nombre_comercial && c.nombre_comercial.toLowerCase().includes(q))
      );
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = customers.length;
    const paginatedCustomers = customers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: paginatedCustomers,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving customers', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { docType, docNumber, razonSocial, nombreComercial, direccion, correo, telefono } = body;

    if (!docType || !docNumber || !razonSocial) {
      return NextResponse.json({ message: 'Faltan campos obligatorios: docType, docNumber y razonSocial.' }, { status: 400 });
    }

    // Uniqueness validation
    const customers = FileDb.getTable('customers');
    const exists = customers.some(
      (c: any) => c.company_id === ctx.company.id && c.doc_type === docType && c.doc_number === docNumber && !c.deleted_at
    );

    if (exists) {
      return NextResponse.json({ message: `El cliente con documento ${docNumber} ya se encuentra registrado.` }, { status: 400 });
    }

    const newCustomer = FileDb.insert('customers', {
      company_id: ctx.company.id,
      doc_type: docType,
      doc_number: docNumber,
      razon_social: razonSocial,
      nombre_comercial: nombreComercial || null,
      direccion: direccion || null,
      correo: correo || null,
      telefono: telefono || null,
      status: 'active',
    });

    logAudit(ctx.company.id, ctx.user.id, 'CREATE_CUSTOMER', 'CUSTOMERS', `Created customer ${razonSocial} (${docNumber})`);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating customer', error: error.message }, { status: 500 });
  }
}
