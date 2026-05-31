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

    // A regular company user can only access their own company
    if (ctx.company && ctx.company.id !== id) {
      return NextResponse.json({ message: 'Empresa no encontrada o acceso denegado.' }, { status: 404 });
    }

    const company = FileDb.findById('companies', id);
    if (!company) {
      return NextResponse.json({ message: 'Empresa no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      id: company.id,
      ruc: company.ruc,
      businessName: company.business_name,
      tradeName: company.trade_name,
      address: company.address,
      ubigeo: company.ubigeo || '150101',
      phone: company.phone || '',
      email: company.email || '',
      sunatEnvironment: company.sunat_environment,
      solUsername: company.sol_username || '',
      hasSolPassword: !!company.sol_password,
      isActive: company.status !== 'inactive',
      createdAt: company.created_at,
      updatedAt: company.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving company profile', error: error.message }, { status: 500 });
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

    // A regular company user can only access their own company
    if (ctx.company && ctx.company.id !== id) {
      return NextResponse.json({ message: 'Empresa no encontrada o acceso denegado.' }, { status: 404 });
    }

    const body = await req.json();
    const { 
      businessName, 
      tradeName, 
      address, 
      ubigeo, 
      phone, 
      email,
      sunatEnvironment,
      solUsername,
      solPassword
    } = body;

    const companies = FileDb.getTable('companies');
    const idx = companies.findIndex((c: any) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ message: 'Empresa no encontrada.' }, { status: 404 });
    }

    // Update fields
    if (businessName !== undefined) companies[idx].business_name = businessName;
    if (tradeName !== undefined) companies[idx].trade_name = tradeName;
    if (address !== undefined) companies[idx].address = address;
    if (ubigeo !== undefined) companies[idx].ubigeo = ubigeo;
    if (phone !== undefined) companies[idx].phone = phone;
    if (email !== undefined) companies[idx].email = email;
    if (sunatEnvironment !== undefined) companies[idx].sunat_environment = sunatEnvironment;
    if (solUsername !== undefined) companies[idx].sol_username = solUsername;
    if (solPassword !== undefined) companies[idx].sol_password = solPassword;
    companies[idx].updated_at = new Date().toISOString();

    FileDb.saveTable('companies', companies);

    logAudit(id, ctx.user.id, 'UPDATE_COMPANY_PROFILE', 'SETTINGS', `Updated company profile details for ${companies[idx].business_name}`);

    const updated = companies[idx];
    return NextResponse.json({
      id: updated.id,
      ruc: updated.ruc,
      businessName: updated.business_name,
      tradeName: updated.trade_name,
      address: updated.address,
      ubigeo: updated.ubigeo || '',
      phone: updated.phone || '',
      email: updated.email || '',
      sunatEnvironment: updated.sunat_environment,
      solUsername: updated.sol_username || '',
      hasSolPassword: !!updated.sol_password,
      isActive: updated.status !== 'inactive',
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating company profile', error: error.message }, { status: 500 });
  }
}
