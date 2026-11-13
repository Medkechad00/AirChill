import { NextRequest, NextResponse } from 'next/server';
import { authenticated, liveMode, liveConfigured, callN8n, sameOrigin } from '@/lib/server';
import { statuses } from '@/lib/types';
export async function PATCH(req:NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({error:'Invalid origin'}, {status:403});
  if (!authenticated(req)) return NextResponse.json({error:'Unauthorized'}, {status:401});
  if (!liveMode()) return NextResponse.json({error:'Demo mode has no persistent writes'}, {status:409});
  if (!liveConfigured()) return NextResponse.json({error:'Live mode is not configured'}, {status:503});
  let body:unknown; try {body=await req.json();}catch{return NextResponse.json({error:'Invalid body'}, {status:400});}
  const o=(body && typeof body==='object') ? body as Record<string,unknown> : {};
  const id= typeof o.session_id==='string' ? o.session_id : '';
  const status=typeof o.status==='string' ? o.status : '';
  if (!id || id.length>128 || !/^[a-zA-Z0-9_-]+$/.test(id) || !statuses.includes(status as typeof statuses[number]))
    return NextResponse.json({error:'Invalid request'}, {status:400});
  try {
    const result=await callN8n(process.env.N8N_UPDATE_STATUS_URL!, 'POST', {session_id:id,status});
    if (result?.ok !== true) return NextResponse.json({error:'Update rejected by n8n'}, {status:502});
    return NextResponse.json({ok:true,session_id:id,status});
  } catch(e) { console.error('Status update error:',e); return NextResponse.json({error:'Unable to update request'}, {status:502}); }
}
