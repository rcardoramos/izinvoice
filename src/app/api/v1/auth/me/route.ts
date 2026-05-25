import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, unauthorizedResponse } from '@/lib/auth-middleware';
import { MeResponse } from '@/types/auth.types';

export async function GET(req: NextRequest) {
  const ctx = getAuthContext(req);
  if (!ctx) return unauthorizedResponse();

  const responseData: MeResponse = {
    user: ctx.user,
    company: ctx.company,
  };

  return NextResponse.json(responseData);
}
