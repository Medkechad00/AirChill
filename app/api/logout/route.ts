import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, sameOrigin } from '@/lib/server';
export async function POST(req:NextRequest){
  if(!sameOrigin(req)) return NextResponse.json({error:'Invalid origin'}, {status:403});
  const res=NextResponse.json({ok:true}); clearSessionCookie(res); return res;
}
