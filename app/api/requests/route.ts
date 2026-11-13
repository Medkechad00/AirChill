import { NextRequest, NextResponse } from 'next/server';
import { authenticated, liveMode, liveConfigured, callN8n } from '@/lib/server';
import { mockRequests } from '@/lib/mock';
import { normalizeRequest } from '@/lib/types';
export async function GET(req:NextRequest) {
  if (!authenticated(req)) return NextResponse.json({error:'Unauthorized'}, {status:401});
  if (!liveMode()) return NextResponse.json({items:mockRequests, mode:'demo'}, {headers:{'Cache-Control':'no-store'}});
  if (!liveConfigured()) return NextResponse.json({error:'Live mode is not configured'}, {status:503});
  try {
    const body=await callN8n(process.env.N8N_GET_REQUESTS_URL!, 'GET');
    if (!body || !Array.isArray(body.items)) throw new Error('Invalid JSON: expected {items: []}');
    return NextResponse.json({items:body.items.map(normalizeRequest).filter(Boolean), mode:'live'}, {headers:{'Cache-Control':'no-store'}});
  } catch(e) { console.error('Requests read error:',e); return NextResponse.json({error:'Unable to load requests from n8n'}, {status:502}); }
}
