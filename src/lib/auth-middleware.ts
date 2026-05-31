import { NextRequest, NextResponse } from 'next/server';
import { FileDb } from './db';
import { CompanySession, UserSession } from '@/types/auth.types';

export interface AuthenticatedContext {
  company: CompanySession;
  user: UserSession;
}

export function getAuthContext(req: NextRequest): AuthenticatedContext | null {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const users = FileDb.getTable('users');

  // Handle platform super admin first (no company)
  if (token === 'mock-jwt-superadmin-token') {
    const user = users.find((u: any) => u.username === 'invoiceflow');
    if (!user) return null;
    return {
      company: null as any,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      }
    };
  }

  const apiKey = req.headers.get('X-Api-Key') || '';
  if (!apiKey) return null;
  
  // Find company by API Key
  const companies = FileDb.getTable('companies');
  const company = companies.find((c: any) => c.api_key === apiKey);
  if (!company) return null;
  
  // Find user based on Bearer Token simulation
  let user: any = null;
  if (token === 'mock-jwt-admin-token') {
    user = users.find((u: any) => u.username === 'admin');
  } else {
    // Default fallback to first admin user if token is simulated in demo UI
    user = users.find((u: any) => u.company_id === company.id);
  }
  
  if (!user || user.company_id !== company.id) return null;
  
  return {
    company: {
      id: company.id,
      ruc: company.ruc,
      businessName: company.business_name,
      tradeName: company.trade_name,
      address: company.address,
      ubigeo: company.ubigeo || null,
      sunatEnvironment: company.sunat_environment,
      apiKey: company.api_key,
    },
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    }
  };
}

export function unauthorizedResponse(message: string = 'Unauthorized API access') {
  return NextResponse.json({ statusCode: 401, message }, { status: 401 });
}

export function logAudit(companyId: string | null, userId: string, action: string, module: string, details: string, result: 'success' | 'failure' = 'success') {
  FileDb.insert('audit_logs', {
    company_id: companyId,
    user_id: userId,
    action,
    module,
    ip_address: '127.0.0.1',
    result,
    details,
  });
}
