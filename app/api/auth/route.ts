import { NextRequest, NextResponse } from 'next/server';
import { createSession, liveMode, liveConfigured, sameOrigin, setSessionCookie, validPassword } from '@/lib/server';
export async function POST(req:NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({error:'Invalid origin'}, {status:403});
  if (!liveMode() || !liveConfigured()) return NextResponse.json({error:'Live dashboard is not configured'}, {status:503});
  let body:unknown; try {body=await req.json();} catch {return NextResponse.json({error:'Invalid body'}, {status:400});}
  const password = (body && typeof body === 'object' && 'password' in body) ? (body as {password:unknown}).password : null;
  if (typeof password !== 'string' || !validPassword(password)) return NextResponse.json({error:'Invalid credentials'}, {status:401});
  const res=NextResponse.json({ok:true}); setSessionCookie(res,createSession()); return res;
}
