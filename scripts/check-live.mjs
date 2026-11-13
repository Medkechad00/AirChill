// Read-only n8n connectivity check. Never prints passwords, tokens, or request contents.
import { readFileSync } from 'node:fs';

function parseEnv(path) {
  let raw;
  try { raw=readFileSync(path, 'utf8'); }
  catch { throw new Error('Missing .env.local: copy .env.example and configure it locally.'); }
  const result={};
  for (const line of raw.split(/\r?\n/)) {
    const match=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || line.trim().startsWith('#')) continue;
    const value=match[2];
    result[match[1]]=value.startsWith('"') && value.endsWith('"') ? value.slice(1,-1) : value;
  }
  return result;
}

async function check() {
  const env=parseEnv('.env.local');
  const errors=[];
  const required=['N8N_GET_REQUESTS_URL','N8N_UPDATE_STATUS_URL','N8N_WEBHOOK_SECRET','DASHBOARD_PASSWORD','SESSION_SECRET'];
  for (const name of required) {
    const value=env[name] || '';
    if (!value || value.includes('YOUR-') || value.startsWith('REPLACE_')) errors.push(name+' is not configured');
  }
  if (env.DEMO_MODE!=='false') errors.push('DEMO_MODE must be false for live mode');
  if ((env.N8N_WEBHOOK_SECRET||'').length<24) errors.push('N8N_WEBHOOK_SECRET must be at least 24 characters');
  if ((env.SESSION_SECRET||'').length<32) errors.push('SESSION_SECRET must be at least 32 characters');
  if ((env.DASHBOARD_PASSWORD||'').length<12) errors.push('DASHBOARD_PASSWORD must be at least 12 characters');
  for(const name of ['N8N_GET_REQUESTS_URL','N8N_UPDATE_STATUS_URL']) {
    const v=env[name] || '';
    try {
      const u=new URL(v);
      if(u.protocol!=='https:' || !u.pathname.includes('/webhook/') || u.pathname.includes('/webhook-test/'))
        errors.push(name+' must be an HTTPS production /webhook/ URL (not /webhook-test/)');
    } catch { errors.push(name+' must contain a valid URL'); }
  }
  if(errors.length) {
    errors.forEach(e=>console.error('ERROR:',e));
    process.exitCode=1;
    return;
  }

  const url=env.N8N_GET_REQUESTS_URL;
  const fetchOpts={redirect:'manual', signal:AbortSignal.timeout(12000)};
  try {
    // Probe without credentials: the data endpoint must NOT be publicly accessible.
    const unauth=await fetch(url,fetchOpts);
    if(unauth.status>=200 && unauth.status<300) {
      console.error('SECURITY ERROR: GET endpoint returned HTTP '+unauth.status+' without authentication. Stop and enable Header Auth in n8n.');
      process.exitCode=1;return;
    }
    console.log('Unauthenticated GET: HTTP '+unauth.status+(unauth.status===401||unauth.status===403?' (blocked as expected)':' (check n8n webhook authentication and publication)'));
    // Probe with the server-only secret. Never print the secret or any customer record.
    const res=await fetch(url,{...fetchOpts,headers:{'x-airchill-key':env.N8N_WEBHOOK_SECRET}});
    if(!res.ok) {
      console.error('Authenticated GET failed: HTTP '+res.status+'. Check Header Auth credential, published workflow, and Google Sheets nodes.');
      process.exitCode=1;return;
    }
    const body=await res.json();
    if(!body || !Array.isArray(body.items)) {
      console.error('Invalid JSON response: expected an object with an items array. Check the Return request list / Respond to Webhook nodes.');
      process.exitCode=1;return;
    }
    console.log('Authenticated GET: HTTP '+res.status+' ✓');
    console.log('JSON shape: {items: [...]} ✓');
    console.log('Request count: '+body.items.length+' (record details intentionally hidden)');
    console.log('READ-ONLY CHECK PASSED. No status changes were sent.');
    console.log('Next: run npm run dev, sign in, and test one fictional row status change from the dashboard.');
  } catch(err) {
    console.error('GET request failed: '+(err instanceof Error ? err.message : 'Unknown error'));
    process.exitCode=1;
  }
}

check();
