import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let products = FileDb.getTable('products');
    products = products.filter((p: any) => p.company_id === ctx.company.id && !p.deleted_at);

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p: any) =>
          p.codigo.toLowerCase().includes(q) ||
          p.nombre.toLowerCase().includes(q) ||
          (p.categoria && p.categoria.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving products', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { codigo, nombre, descripcion, categoria, unidadMedida, precio, igvRate } = body;

    if (!codigo || !nombre || precio === undefined) {
      return NextResponse.json({ message: 'Faltan campos obligatorios: codigo, nombre y precio.' }, { status: 400 });
    }

    // Uniqueness validation
    const products = FileDb.getTable('products');
    const exists = products.some(
      (p: any) => p.company_id === ctx.company.id && p.codigo === codigo && !p.deleted_at
    );

    if (exists) {
      return NextResponse.json({ message: `El producto con código '${codigo}' ya está registrado.` }, { status: 400 });
    }

    const newProduct = FileDb.insert('products', {
      company_id: ctx.company.id,
      codigo,
      nombre,
      descripcion: descripcion || null,
      categoria: categoria || null,
      unidad_medida: unidadMedida || 'NIU',
      precio: parseFloat(precio),
      igv_rate: igvRate !== undefined ? parseFloat(igvRate) : 18.00,
      status: 'active',
    });

    logAudit(ctx.company.id, ctx.user.id, 'CREATE_PRODUCT', 'PRODUCTS', `Created product ${nombre} (${codigo})`);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating product', error: error.message }, { status: 500 });
  }
}
