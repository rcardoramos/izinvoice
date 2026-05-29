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

export async function PATCH(
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

    const updates: any = {};
    if (body.nombre !== undefined) updates.nombre = body.nombre;
    if (body.descripcion !== undefined) updates.descripcion = body.descripcion;
    if (body.categoria !== undefined) updates.categoria = body.categoria;
    if (body.unidadMedida !== undefined) updates.unidad_medida = body.unidadMedida;
    if (body.precio !== undefined) updates.precio = parseFloat(body.precio);
    if (body.igvRate !== undefined) updates.igv_rate = parseFloat(body.igvRate);
    if (body.status !== undefined) updates.status = body.status;

    if (body.isActive === false) {
      updates.deleted_at = new Date().toISOString();
      updates.status = 'inactive';
      logAudit(ctx.company.id, ctx.user.id, 'DELETE_PRODUCT', 'PRODUCTS', `Deleted product ${product.nombre} (${product.codigo})`);
    } else if (body.isActive === true) {
      updates.deleted_at = null;
      updates.status = 'active';
      logAudit(ctx.company.id, ctx.user.id, 'ACTIVATE_PRODUCT', 'PRODUCTS', `Activated product ${product.nombre} (${product.codigo})`);
    } else {
      logAudit(ctx.company.id, ctx.user.id, 'UPDATE_PRODUCT', 'PRODUCTS', `Updated product ${product.nombre} (${product.codigo})`);
    }

    const updated = FileDb.update('products', id, updates);

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
