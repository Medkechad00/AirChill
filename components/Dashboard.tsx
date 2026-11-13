'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowDownUp, ArrowRight, Bell, CheckCheck, ChevronDown, ClipboardList, Clock3, Filter, LayoutDashboard, LockKeyhole, LogOut, MapPin, Menu, RefreshCcw, Search, ShieldCheck, Snowflake, X } from 'lucide-react';
import type { RequestRow, Status } from '@/lib/types';
import { statuses } from '@/lib/types';

type Session = {live:boolean; configured:boolean; authenticated:boolean};
export type DashboardView = 'overview' | 'all' | 'pending' | 'progress' | 'completed';
const pageMeta:Record<DashboardView,{ title:string; breadcrumb:string; description:string; tableTitle:string; tableDescription:string; filter:string }> = {
  overview:{title:'Service requests',breadcrumb:'Overview',description:'Review incoming AC service inquiries and coordinate next steps with your team.',tableTitle:'Incoming requests',tableDescription:'Recent customer service inquiries',filter:'All requests'},
  all:{title:'All requests',breadcrumb:'All requests',description:'A complete queue of customer inquiries and their latest statuses.',tableTitle:'All service requests',tableDescription:'Search and review every recorded request',filter:'All requests'},
  pending:{title:'Pending review',breadcrumb:'Pending review',description:'Requests waiting for staff to review the details and decide next steps.',tableTitle:'Awaiting staff review',tableDescription:'New requests that need attention',filter:'Pending staff review'},
  progress:{title:'In progress',breadcrumb:'In progress',description:'Requests currently being handled by the team.',tableTitle:'Active service requests',tableDescription:'Work currently marked as in progress',filter:'In progress'},
  completed:{title:'Completed',breadcrumb:'Completed',description:'Requests marked completed by staff.',tableTitle:'Completed requests',tableDescription:'Service intake requests closed by the team',filter:'Completed'},
};
const statusLabels:Record<Status,string> = { 'Pending staff review':'Pending review', 'In progress':'In progress', 'Completed':'Completed' };
const niceDate=(v:string)=> { if(!v)return '—'; const d=new Date(v); return Number.isNaN(d.getTime()) ? v : new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'}).format(d); };
const initials=(v:string)=>v.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase() || '??';

function StatusTag({status}:{status:Status}){return <span className={`status-chip ${status==='Completed'?'completed':status==='In progress'?'progress':'pending'}`}><span className="status-dot"/>{statusLabels[status]}</span>}

function Login({onLogin,error}:{onLogin:(pw:string)=>Promise<void>,error:string}) {
  const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false);
  return <main className="login-wrap"><form className="login-card" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await onLogin(password)}finally{setBusy(false)}}}>
    <div className="brand-mark login-mark"><Snowflake size={23}/></div><span className="eyebrow">STAFF ACCESS</span><h1>Welcome back.</h1><p>Sign in to review live service requests. Demo concept — not an official AirChill system.</p>
    <label htmlFor="dash-password">Dashboard password</label><input id="dash-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required/>
    {error&&<div className="error-msg">{error}</div>}
    <button className="primary-btn" disabled={busy}>{busy?'Signing in...':'Sign in'} <ArrowRight size={17}/></button>
  </form></main>;
}

export default function Dashboard({view='overview'}:{view?:DashboardView}){
  const page=pageMeta[view];
  const [session,setSession]=useState<Session|null>(null);
  const [rows,setRows]=useState<RequestRow[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [query,setQuery]=useState(''); const [filter,setFilter]=useState(page.filter);
  const [working,setWorking]=useState(false); const [saving,setSaving]=useState(false);
  const [error,setError]=useState(''); const [authError,setAuthError]=useState('');
  const [mobileOpen,setMobileOpen]=useState(false);
  async function getSession(){try{const res=await fetch('/api/session',{cache:'no-store'}); const data=await res.json();setSession(data)}catch{setError('Unable to check dashboard connection.')}}
  async function refresh(){setWorking(true);setError(''); try{const res=await fetch('/api/requests',{cache:'no-store'}); if(!res.ok)throw new Error('Could not load requests');const data=await res.json(); if(!Array.isArray(data.items))throw new Error('Invalid response');setRows(data.items)}catch(e){setError(e instanceof Error?e.message:'Unable to load requests')}finally{setWorking(false)}}
  useEffect(()=>{void getSession()},[]);
  useEffect(()=>{if(session?.authenticated)void refresh()},[session?.authenticated]);
  useEffect(()=>{if(!session?.authenticated)return;const timer=setInterval(()=>void refresh(),30000);return ()=>clearInterval(timer)},[session?.authenticated]);
  const totals=useMemo(()=>({total:rows.length,pending:rows.filter(r=>r.status==='Pending staff review').length,progress:rows.filter(r=>r.status==='In progress').length,complete:rows.filter(r=>r.status==='Completed').length}),[rows]);
  const visible=useMemo(()=>rows.filter(r=>{
    const matches=!query.trim() || [r.customer_name,r.location,r.service_type,r.issue_description,r.session_id].join(' ').toLowerCase().includes(query.trim().toLowerCase());
    return matches && (filter==='All requests' || r.status===filter);
  }).sort((a,b)=>new Date(b.updated_at||0).getTime()-new Date(a.updated_at||0).getTime()),[rows,filter,query]);
  const focused=rows.find(r=>r.session_id===selected)??null;
  async function updateStatus(id:string,newStatus:Status){const current=rows.find(r=>r.session_id===id);if(!current||current.status===newStatus)return;
    setSaving(true);setError('');
    try{
      if(session?.live){const res=await fetch('/api/requests/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:id,status:newStatus})});if(!res.ok)throw new Error('Could not save status');await refresh();}
      else setRows(prev=>prev.map(r=>r.session_id===id?{...r,status:newStatus,updated_at:new Date().toISOString()}:r));
    }catch(e){setError(e instanceof Error?e.message:'Status update failed')}finally{setSaving(false)}
  }
  async function login(password:string){setAuthError('');const res=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});if(!res.ok){setAuthError('Incorrect password or dashboard not configured');return;}await getSession()}
  async function logout(){await fetch('/api/logout',{method:'POST'});setRows([]);setSelected(null);await getSession()}

  if(!session)return <div className="loading-screen">Loading service desk...</div>;
  if(session.live&&!session.configured)return <div className="loading-screen">Live mode needs setup. Check <code>.env.local</code> and restart the server.</div>;
  if(!session.authenticated)return <Login onLogin={login} error={authError}/>;
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'side-open':''}`}>
      <div className="brand"><span className="brand-mark"><Snowflake size={22}/></span><div><strong>AIRCHILL</strong><span>SERVICE DESK · DEMO</span></div></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <Link href="/" className={`nav-item ${view==='overview'?'active':''}`} aria-current={view==='overview'?'page':undefined} onClick={()=>setMobileOpen(false)}><LayoutDashboard size={18}/> Overview {view==='overview'&&<span className="nav-active-dot"/>}</Link>
      <Link href="/requests" className={`nav-item ${view==='all'?'active':''}`} aria-current={view==='all'?'page':undefined} onClick={()=>setMobileOpen(false)}><ClipboardList size={18}/> All requests <span className="nav-count">{rows.length}</span>{view==='all'&&<span className="nav-active-dot"/>}</Link>
      <div className="sidebar-section-label lower">REQUEST STATUS</div>
      <Link href="/requests/pending" className={`nav-item ${view==='pending'?'active':''}`} aria-current={view==='pending'?'page':undefined} onClick={()=>setMobileOpen(false)}><Clock3 size={18}/> Pending review <span className="nav-count">{totals.pending}</span>{view==='pending'&&<span className="nav-active-dot"/>}</Link>
      <Link href="/requests/in-progress" className={`nav-item ${view==='progress'?'active':''}`} aria-current={view==='progress'?'page':undefined} onClick={()=>setMobileOpen(false)}><Activity size={18}/> In progress <span className="nav-count">{totals.progress}</span>{view==='progress'&&<span className="nav-active-dot"/>}</Link>
      <Link href="/requests/completed" className={`nav-item ${view==='completed'?'active':''}`} aria-current={view==='completed'?'page':undefined} onClick={()=>setMobileOpen(false)}><CheckCheck size={18}/> Completed <span className="nav-count">{totals.complete}</span>{view==='completed'&&<span className="nav-active-dot"/>}</Link>
      <div className="sidebar-bottom"><div className="system-label"><span className="system-dot"/>{session.live?'Live n8n connection':'Demo data mode'}</div><div className="sidebar-footnote">Internal concept · Not affiliated with AirChill</div>{session.live&&<button className="logout-btn" onClick={logout}><LogOut size={15}/> Sign out</button>}</div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setMobileOpen(v=>!v)} aria-label="Open menu"><Menu size={20}/></button><span>Workspace</span><span className="crumb-sep">/</span><b>{page.breadcrumb}</b></div><div className="topbar-actions"><span className="private-tag"><ShieldCheck size={14}/> INTERNAL DEMO</span><span className="vertical-separator"/><div className="avatar">AC</div></div></header>
      <div className="page-inner"><div className="page-heading"><div><div className="eyebrow">OPERATIONS DASHBOARD <span className="eyebrow-dot"/> DUBAI</div><h1>{page.title}<span className="heading-period">.</span></h1><p>{page.description}</p></div><button className="outline-btn" onClick={refresh} disabled={working}><RefreshCcw className={working?'spinning':''} size={16}/>{working?'Refreshing':'Refresh data'}</button></div>
      <div className={`mode-strip ${session.live?'is-live':'is-demo'}`}><div className="mode-icon"><Bell size={16}/></div><p><b>{session.live?'Connected to n8n + Google Sheets':'Preview mode — synthetic customer requests'}</b><span>{session.live?'Updates are saved to your connected spreadsheet.':'Status changes are temporary and reset on refresh. Connect your n8n workflows to enable live data.'}</span></p><span className="mode-indicator">{session.live?'LIVE':'DEMO'}</span></div>
      {error&&<div className="error-msg page-error">{error}</div>}
      {view==='overview'&&<div className="metric-grid"><div className="metric-card"><div className="metric-top"><span>Total requests</span><ClipboardList size={17}/></div><div className="metric-number">{totals.total.toString().padStart(2,'0')}</div><span className="metric-sub">All captured service inquiries</span></div><div className="metric-card"><div className="metric-top"><span>Pending review</span><Clock3 size={17}/></div><div className="metric-number">{totals.pending.toString().padStart(2,'0')}</div><span className="metric-sub"><span className="small-dot amber"/> Requires staff attention</span></div><div className="metric-card"><div className="metric-top"><span>In progress</span><Activity size={17}/></div><div className="metric-number">{totals.progress.toString().padStart(2,'0')}</div><span className="metric-sub"><span className="small-dot blue"/> Being handled by team</span></div><div className="metric-card"><div className="metric-top"><span>Completed</span><CheckCheck size={17}/></div><div className="metric-number">{totals.complete.toString().padStart(2,'0')}</div><span className="metric-sub"><span className="small-dot green"/> Marked complete by staff</span></div></div>}
      {view!=='overview'&&<div className="view-context"><span className="view-context-number">{visible.length.toString().padStart(2,'0')}</span><span>{page.tableTitle} <small>• Select a row to inspect details or update its status</small></span><Link href="/requests" className="view-context-link">All requests <ArrowRight size={14}/></Link></div>}
      <section className="requests-card"><div className="section-title"><div><h2>{page.tableTitle}</h2><span>{page.tableDescription}</span></div><span className="records-tag">{visible.length} RECORDS</span></div>
        <div className="table-toolbar"><div className="search-wrap"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by customer, area, or service..." aria-label="Search requests"/></div>{(view==='overview'||view==='all')?<label className="select-wrap"><Filter size={16}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All requests</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={15}/></label>:<span className="fixed-filter"><Filter size={15}/>{page.breadcrumb}</span>}</div>
        <div className="table-scroll"><table className="requests-table"><thead><tr><th>REQUEST / CUSTOMER</th><th>SERVICE TYPE</th><th>LOCATION</th><th>STATUS</th><th><span className="th-sort">UPDATED <ArrowDownUp size={13}/></span></th><th/></tr></thead><tbody>{visible.map(row=><tr key={row.session_id} onClick={()=>setSelected(row.session_id)} tabIndex={0} role="button" onKeyDown={e=>{if(e.key==='Enter')setSelected(row.session_id)}}><td><div className="customer-cell"><div className="customer-initials">{initials(row.customer_name)}</div><div><strong>{row.customer_name||'Unnamed customer'}</strong><span>#{row.session_id.slice(0,10)}</span></div></div></td><td><strong className="table-service">{row.service_type||'Service request'}</strong><span className="table-secondary">{row.unit_count?`${row.unit_count} AC units`:'Units unspecified'}</span></td><td><div className="loc-cell"><MapPin size={15}/>{row.location||'Not specified'}</div></td><td><StatusTag status={row.status}/></td><td><span className="table-date">{niceDate(row.updated_at)}</span></td><td><ArrowRight size={17} className="row-arrow"/></td></tr>)}</tbody></table></div>
        {visible.length===0&&<div className="empty-state">No requests match your filters.</div>}<div className="table-footer">Showing {visible.length} of {rows.length} requests <span>All times shown in Dubai (GST)</span></div>
      </section><div className="page-footer"><span>AirChill-style operational concept · Not an official AirChill product</span><span>Designed for human-reviewed service intake</span></div></div>
    </main>
    {focused&&<div className="modal-backdrop" onClick={()=>setSelected(null)}><aside className="detail-panel" onClick={e=>e.stopPropagation()}><div className="detail-header"><div><span className="eyebrow">SERVICE REQUEST DETAILS</span><h2>#{focused.session_id.slice(0,10)}</h2></div><button className="icon-btn" onClick={()=>setSelected(null)} aria-label="Close details"><X size={20}/></button></div><div className="detail-scroll"><div className="detail-customer"><div className="detail-avatar">{initials(focused.customer_name)}</div><div><strong>{focused.customer_name||'Unknown customer'}</strong><span>Created from AI intake conversation</span></div></div><div className="detail-segment"><div className="segment-title">STATUS & OWNERSHIP</div><label className="detail-label" htmlFor="change-status">Request status</label><select className="status-editor" id="change-status" value={focused.status} disabled={saving} onChange={e=>void updateStatus(focused.session_id,e.target.value as Status)}>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select><p className="helper-text">Status is changed by staff; no visit is automatically confirmed.</p></div><div className="detail-segment"><div className="segment-title">REQUEST INFORMATION</div><div className="detail-grid">{([['Service type',focused.service_type],['Location',focused.location],['Property type',focused.property_type],['AC units',focused.unit_count],['AC type',focused.ac_type],['Preferred window',focused.preferred_window],['Photo notes',focused.photo_note],['Last updated',niceDate(focused.updated_at)]] as [string,string][]).map(([k,v])=><div className="detail-field" key={k}><span>{k}</span><strong>{v||'Not specified'}</strong></div>)}</div></div><div className="detail-segment"><div className="segment-title">CUSTOMER ISSUE</div><p className="issue-text">{focused.issue_description||'No description provided.'}</p></div><div className="detail-segment"><div className="segment-title">AI INTAKE SUMMARY</div><div className="summary-box"><Snowflake size={17}/><p>{focused.summary||'No summary provided.'}</p></div></div></div><div className="detail-footer"><ShieldCheck size={16}/> Staff should confirm pricing, availability, and next steps.</div></aside></div>}
  </div>;
}
