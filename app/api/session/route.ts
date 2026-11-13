import { NextRequest, NextResponse } from 'next/server';
import { authenticated, liveMode, liveConfigured } from '@/lib/server';
export async function GET(req:NextRequest) {
  return NextResponse.json({live: liveMode(), configured: !liveMode() || liveConfigured(), authenticated: authenticated(req)}, {headers:{'Cache-Control':'no-store'}});
}
