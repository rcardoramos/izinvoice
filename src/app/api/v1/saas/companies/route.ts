import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse, logAudit } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

// Verify that user is platform owner
function checkPlatformAdmin(ctx: any) {
  return ctx && ctx.user.role === 'super_admin' && ctx.company === null;
}

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx || !checkPlatformAdmin(ctx)) return unauthorizedResponse('Acceso restringido al Administrador de InvoiceFlow.');

  try {
    const companies = FileDb.getTable('companies');
    const subs = FileDb.getTable('subscriptions');
    const users = FileDb.getTable('users');

    const result = companies.map((c: any) => {
      const sub = subs.find((s: any) => s.company_id === c.id);
      const companyUsers = users.filter((u: any) => u.company_id === c.id);
      return {
        ...c,
        plan: sub ? sub.plan_name : 'starter',
        status: sub ? sub.status : 'active',
        usersCount: companyUsers.length,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving companies', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx || !checkPlatformAdmin(ctx)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { ruc, businessName, tradeName, address, email, phone, planName, adminPassword } = body;

    if (!ruc || !businessName || !email) {
      return NextResponse.json({ message: 'Faltan campos obligatorios: ruc, businessName y email.' }, { status: 400 });
    }

    // Check duplicate company
    const companies = FileDb.getTable('companies');
    if (companies.some((c: any) => c.ruc === ruc)) {
      return NextResponse.json({ message: `La empresa con RUC ${ruc} ya está registrada.` }, { status: 400 });
    }

    const companyId = 'comp_' + Math.random().toString(36).substring(2, 9) + '-' + Math.random().toString(36).substring(2, 9);
    const hexApiKey = 'mbak_live_' + Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // 1. Insert Company
    const newCompany = FileDb.insert('companies', {
      id: companyId,
      ruc,
      business_name: businessName,
      trade_name: tradeName || businessName,
      address: address || null,
      phone: phone || null,
      email,
      sunat_environment: 'beta',
      sol_username: `${ruc}MODDATOS`,
      sol_password: 'MODDATOS',
      api_key: hexApiKey,
    });

    // 2. Insert Subscription
    FileDb.insert('subscriptions', {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      company_id: companyId,
      plan_name: planName || 'starter',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
    });

    // 3. Insert default document series (Seeds F001, B001, credit/debit notes)
    const seriesSeeds = [
      { doc_type: '01', serie: 'F001', correlativo: 0 },
      { doc_type: '03', serie: 'B001', correlativo: 0 },
      { doc_type: '07', serie: 'FC01', correlativo: 0 },
      { doc_type: '07', serie: 'BC01', correlativo: 0 },
      { doc_type: '08', serie: 'FD01', correlativo: 0 },
      { doc_type: '08', serie: 'BD01', correlativo: 0 },
    ];
    
    for (const seed of seriesSeeds) {
      FileDb.insert('document_series', {
        company_id: companyId,
        ...seed,
      });
    }

    // 4. Insert Company Admin Default User
    const adminUsername = `admin_${ruc}`;
    const newAdminUser = FileDb.insert('users', {
      company_id: companyId,
      username: adminUsername,
      password_hash: adminPassword || 'admin123', // custom or default credentials
      full_name: `Admin ${businessName}`,
      email,
      role: 'admin',
      status: 'active',
    });

    logAudit(null, ctx.user.id, 'REGISTER_COMPANY', 'SaaS', `Registered client company ${businessName} (${ruc}). Admin: ${adminUsername}`);

    return NextResponse.json({
      company: newCompany,
      adminUser: {
        username: adminUsername,
        password_hash: adminPassword || 'admin123',
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error registering company', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx || !checkPlatformAdmin(ctx)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { 
      companyId, 
      status, 
      planName, 
      newPassword,
      tradeName,
      address,
      phone,
      email,
      sunatEnvironment,
      solUsername,
      solPassword
    } = body;

    if (!companyId) {
      return NextResponse.json({ message: 'Se requiere companyId.' }, { status: 400 });
    }

    // Find and update company table
    const companies = FileDb.getTable('companies');
    const compIdx = companies.findIndex((c: any) => c.id === companyId);
    if (compIdx !== -1) {
      if (tradeName !== undefined) companies[compIdx].trade_name = tradeName;
      if (address !== undefined) companies[compIdx].address = address;
      if (phone !== undefined) companies[compIdx].phone = phone;
      if (email !== undefined) companies[compIdx].email = email;
      if (sunatEnvironment !== undefined) companies[compIdx].sunat_environment = sunatEnvironment;
      if (solUsername !== undefined) companies[compIdx].sol_username = solUsername;
      if (solPassword !== undefined) companies[compIdx].sol_password = solPassword;
      FileDb.saveTable('companies', companies);
    }

    // Find and update subscription
    const subs = FileDb.getTable('subscriptions');
    const subIdx = subs.findIndex((s: any) => s.company_id === companyId);

    if (subIdx !== -1) {
      if (status) subs[subIdx].status = status;
      if (planName) subs[subIdx].plan_name = planName;
      FileDb.saveTable('subscriptions', subs);
    }

    // Reset password if provided
    let passwordUpdated = false;
    if (newPassword) {
      const users = FileDb.getTable('users');
      const adminUserIdx = users.findIndex((u: any) => u.company_id === companyId && u.role === 'admin');
      if (adminUserIdx !== -1) {
        users[adminUserIdx].password_hash = newPassword;
        FileDb.saveTable('users', users);
        passwordUpdated = true;
      }
    }

    // Log audit
    const company = FileDb.findById('companies', companyId);
    logAudit(
      null,
      ctx.user.id,
      'UPDATE_COMPANY_STATUS',
      'SaaS',
      `Updated company ${company?.business_name || companyId}. Status: ${status || 'no change'}, Plan: ${planName || 'no change'}, Password Reset: ${passwordUpdated ? 'yes' : 'no'}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating company settings', error: error.message }, { status: 500 });
  }
}
// Force SWC cache reload
