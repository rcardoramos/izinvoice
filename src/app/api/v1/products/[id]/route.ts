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
    const product = FileDb.findById('products', id);

    if (!product || product.company_id !== ctx.company.id || product.deleted_at) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving product details', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const product = FileDb.findById('products', id);

    if (!product || product.company_id !== ctx.company.id || product.deleted_at) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    const updated = FileDb.update('products', id, {
      nombre: body.nombre || product.nombre,
      descripcion: body.descripcion !== undefined ? body.descripcion : product.descripcion,
      categoria: body.categoria !== undefined ? body.categoria : product.categoria,
      unidad_medida: body.unidadMedida || product.unidad_medida,
      precio: body.precio !== undefined ? parseFloat(body.precio) : product.precio,
      igv_rate: body.igvRate !== undefined ? parseFloat(body.igvRate) : product.igv_rate,
      status: body.status || product.status,
    });

    logAudit(ctx.company.id, ctx.user.id, 'UPDATE_PRODUCT', 'PRODUCTS', `Updated product ${product.nombre} (${product.codigo})`);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating product', error: error.message }, { status: 500 });
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
    const product = FileDb.findById('products', id);

    if (!product || product.company_id !== ctx.company.id || product.deleted_at) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
    }

    // Soft delete
    FileDb.update('products', id, { deleted_at: new Date().toISOString() });

    logAudit(ctx.company.id, ctx.user.id, 'DELETE_PRODUCT', 'PRODUCTS', `Deleted product ${product.nombre} (${product.codigo})`);

    return NextResponse.json({ success: true, message: 'Producto eliminado correctamente.' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting product', error: error.message }, { status: 500 });
  }
}
