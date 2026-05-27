import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { FileDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const companyId = ctx.company?.id || null;
    let list = FileDb.getTable('notifications');
    list = list.filter((n: any) => n.company_id === companyId);
    
    // Sort by creation date desc
    list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving notifications', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { id } = body;
    const companyId = ctx.company?.id || null;

    let list = FileDb.getTable('notifications');

    if (id) {
      // Mark specific notification as read
      const index = list.findIndex((n: any) => n.id === id && n.company_id === companyId);
      if (index !== -1) {
        list[index].read = true;
      }
    } else {
      // Mark all as read
      list = list.map((n: any) => {
        if (n.company_id === companyId) {
          return { ...n, read: true };
        }
        return n;
      });
    }

    FileDb.saveTable('notifications', list);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating notifications', error: error.message }, { status: 500 });
  }
}
