import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    let logs = FileDb.getTable('audit_logs');
    // Filter by company (bypassed for super admin)
    if (ctx.company) {
      logs = logs.filter((l: any) => l.company_id === ctx.company.id);
    }

    // Sort by created_at descending
    logs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Join username for display
    const users = FileDb.getTable('users');
    const result = logs.map((log: any) => {
      const u = users.find((user: any) => user.id === log.user_id);
      return {
        ...log,
        user_name: u ? u.full_name || u.username : 'Sistema',
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving audit logs', error: error.message }, { status: 500 });
  }
}
