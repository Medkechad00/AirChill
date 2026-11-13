import { NextRequest, NextResponse } from 'next/server';
import { authenticated, liveMode, liveConfigured, liveConfigurationIssues } from '@/lib/server';

export async function GET(req: NextRequest) {
  const live = liveMode();
  const configured = !live || liveConfigured();
  // Only expose missing *setting names*, never their values, on local dev URLs.
  const localDebug = process.env.NODE_ENV === 'development' &&
    (req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1');
  return NextResponse.json({
    live,
    configured,
    authenticated: authenticated(req),
    ...(localDebug ? {
      diagnosticVersion: 'live-config-v1',
      configurationIssues: live && !configured ? liveConfigurationIssues() : []
    } : {})
  }, { headers: { 'Cache-Control': 'no-store' } });
}
