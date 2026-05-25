import { NextRequest, NextResponse } from 'next/server';
import { FileDb } from '@/lib/db';
import { LoginRequest, LoginResponse } from '@/types/auth.types';

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { username, password } = body;

    const users = FileDb.getTable('users');
    const user = users.find((u: any) => u.username === username && u.password_hash === password);

    if (!user) {
      return NextResponse.json(
        { statusCode: 400, message: 'Usuario o contraseña incorrectos.' },
        { status: 400 }
      );
    }

    let company: any = null;
    if (user.company_id) {
      company = FileDb.findById('companies', user.company_id);
      if (!company) {
        return NextResponse.json(
          { statusCode: 400, message: 'Empresa no encontrada.' },
          { status: 400 }
        );
      }
    }

    let token = 'mock-jwt-admin-token';
    if (username === 'invoiceflow') {
      token = 'mock-jwt-superadmin-token';
    } else if (username === 'operador') {
      token = 'mock-jwt-operator-token';
    }

    const responseData: LoginResponse = {
      accessToken: token,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      company: company ? {
        id: company.id,
        ruc: company.ruc,
        businessName: company.business_name,
        tradeName: company.trade_name,
        address: company.address,
        sunatEnvironment: company.sunat_environment,
        apiKey: company.api_key,
      } : null as any,
    };

    // Log login audit
    FileDb.insert('audit_logs', {
      company_id: company ? company.id : null,
      user_id: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      ip_address: '127.0.0.1',
      result: 'success',
      details: `User ${username} logged in successfully.`,
    });

    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json(
      { statusCode: 500, message: 'Error interno de servidor', error: error.message },
      { status: 500 }
    );
  }
}
