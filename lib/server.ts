import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

const cookieName = 'airchill_session';
function signingSecret(): string { return process.env.SESSION_SECRET ?? ''; }
function sign(payload: string): string { return createHmac('sha256', signingSecret()).update(payload).digest('hex'); }
export function liveMode(): boolean { return process.env.DEMO_MODE === 'false'; }
/**
 * Returns names of incomplete live-mode settings, never secret values.
 * Used by a localhost-only diagnostics view during development.
 */
export function liveConfigurationIssues(): string[] {
  const issues: string[] = [];
  const getUrl = process.env.N8N_GET_REQUESTS_URL || '';
  const updateUrl = process.env.N8N_UPDATE_STATUS_URL || '';
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET || '';
  const password = process.env.DASHBOARD_PASSWORD || '';
  const sessionSecret = signingSecret();

  if (!getUrl || getUrl.includes('YOUR-SUBDOMAIN'))
    issues.push('N8N_GET_REQUESTS_URL: missing or placeholder');
  if (!updateUrl || updateUrl.includes('YOUR-SUBDOMAIN'))
    issues.push('N8N_UPDATE_STATUS_URL: missing or placeholder');
  if (!webhookSecret || webhookSecret.startsWith('REPLACE_'))
    issues.push('N8N_WEBHOOK_SECRET: missing or placeholder');
  else if (webhookSecret.length < 24)
    issues.push('N8N_WEBHOOK_SECRET: minimum 24 characters');
  if (!password)
    issues.push('DASHBOARD_PASSWORD: missing');
  else if (password.length < 12)
    issues.push('DASHBOARD_PASSWORD: minimum 12 characters');
  if (!sessionSecret)
    issues.push('SESSION_SECRET: missing');
  else if (sessionSecret.length < 32)
    issues.push('SESSION_SECRET: minimum 32 characters');

  return issues;
}
export function liveConfigured(): boolean { return liveConfigurationIssues().length === 0; }
export function validPassword(given:string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD ?? '';
  const a = Buffer.from(given); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a,b);
}
export function createSession(): string {
  const timestamp = String(Date.now() + 8*60*60*1000);
  return `${timestamp}.${sign(timestamp)}`;
}
export function authenticated(req:NextRequest): boolean {
  if (!liveMode()) return true;
  if (!liveConfigured()) return false;
  const v = req.cookies.get(cookieName)?.value ?? '';
  const [stamp, signature, extra] = v.split('.');
  if (!stamp || !signature || extra || !/^\d+$/.test(stamp)) return false;
  const expiry = Number(stamp);
  if (!Number.isSafeInteger(expiry) || Date.now() >= expiry || expiry > Date.now() + 8*60*60*1000) return false;
  const a=Buffer.from(signature,'hex'), b=Buffer.from(sign(stamp),'hex');
  return a.length === b.length && timingSafeEqual(a,b);
}
export function setSessionCookie(response:Response, token:string): void {
  response.headers.append('Set-Cookie', `${cookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
export function clearSessionCookie(response:Response): void {
  response.headers.append('Set-Cookie', `${cookieName}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
export function sameOrigin(req:NextRequest): boolean {
  const origin=req.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === req.nextUrl.host; } catch { return false; }
}
export async function callN8n(url:string, method:'GET'|'POST', body?:unknown) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol==='http:' && parsed.hostname==='localhost')) throw new Error('Webhook URL must use HTTPS');
  const res = await fetch(url, { method, cache:'no-store', signal:AbortSignal.timeout(12000),
    headers: { 'x-airchill-key': process.env.N8N_WEBHOOK_SECRET ?? '', 'Content-Type':'application/json' },
    ...(body ? { body:JSON.stringify(body) } : {}) });
  if (!res.ok) throw new Error(`n8n returned HTTP ${res.status}`);
  return res.json();
}
