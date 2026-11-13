# AirChill-style Service Intake Dashboard — Demo V1.1

**Status:** v1.1 navigation fix. Source package and importable n8n workflows prepared. Integration with your n8n Cloud account has **not** been tested here. Designed for a private sales demo with synthetic data; **not affiliated with AirChill**.

## What's included

- Next.js App Router dashboard with Tailwind CSS tooling and custom responsive styling
- Two operation modes: **Demo** (fake data) and **Live** (n8n + Google Sheets)
- Five functional sidebar routes: Overview, All requests, Pending review, In progress, Completed
- Request list, search, filtering, summary KPIs, detail drawer, staff status updates
- Live login gate with HttpOnly signed session cookie, server-only n8n API secret, and no client-side credential storage
- `n8n/AirChill_Dashboard_GET_Requests.json`: protected read API via Google Sheets
- `n8n/AirChill_Dashboard_POST_Update_Status.json`: protected update API for existing requests only

## Live Mode — n8n Cloud + Google Sheets

Follow the [Live Mode setup guide](docs/LIVE_MODE_SETUP.md) to import the two backend workflows, configure private Header Auth credentials, and connect the dashboard. After editing your local `.env.local`, run `npm run check:live` to perform a **read-only**, secret-safe connectivity check before making a test status update.

## A. Preview dashboard with safe demo data FIRST

Node.js 20.9+ required. On a terminal:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Sidebar links now have actual pages: `/`, `/requests`, `/requests/pending`, `/requests/in-progress`, and `/requests/completed`. Default `DEMO_MODE=true`. Dummy data is displayed, and status updates are temporary until refresh. No external API, actual customer, or Google Sheets access in this mode.

**Windows PowerShell:** use `Copy-Item .env.example .env.local` instead of `cp`.

## B. Import two backend workflows into n8n Cloud

Both are **new workflows**, separate from the AI Intake Agent and Staff Notifications that already work. Do not delete or modify the working workflows.

### Import Workflow 1 — GET requests

Import `n8n/AirChill_Dashboard_GET_Requests.json` from the n8n workflow menu. Configure:

1. `GET — Requests (header protected)`: set Authentication = `Header Auth`, create a *Header Auth* credential with name exactly `x-airchill-key` and a long random secret as its value.
2. `Google Sheets — Read Requests`: choose your existing Google Sheets credential; select document **AIRCHILL** and tab **Requests**. Operation = `Get Row(s)`.
3. Confirm the Code node and `Respond to Webhook` are connected; publish this new workflow.
4. Copy the **production URL**, which should end in `/webhook/airchill-demo-requests` (not `/webhook-test/...`).

### Import Workflow 2 — POST status update

Import `n8n/AirChill_Dashboard_POST_Update_Status.json` and configure:

1. `POST — Update Status (header protected)`: Authentication = `Header Auth`, **use the exact same header name and secret** as GET. It may reuse the same Header Auth credential.
2. `Google Sheets — Read For Existence`: choose document **AIRCHILL** and tab **Requests**.
3. `Google Sheets — Update Existing Row`: choose document **AIRCHILL** and tab **Requests**; operation must be `Update Row` (NOT Append or Update). Under manual column mapping, ensure matching column = **session_id**, and map ONLY `session_id`, `status`, `updated_at` from incoming JSON; make sure n8n shows their expressions, not plain text.
4. Publish workflow and copy its production URL, ending in `/webhook/airchill-demo-status`.

**Note:** n8n versions may refresh node options upon import. If an imported Google Sheets node shows incomplete column mappings, reselect the document and tab and refresh columns in its editor.

### Recommended preflight checks (before live mode)

Both workflows must have:
- Working Google Sheets credential and matching document/tab.
- Header Auth credential configured in the Webhook trigger. With no/incorrect credential, request must return 401/403, not data.
- Published status. Test URLs only work during editor tests; live mode uses production URLs.

To check authenticated read from a terminal, replace `...` with *your own* secret and URL (don't send your secret to ChatGPT):

```bash
curl -H "x-airchill-key: YOUR_SECRET" "https://YOUR-SUBDOMAIN.app.n8n.cloud/webhook/airchill-demo-requests"
```

Expected JSON shape: `{"items":[...],"count":5,"source":"google_sheets"}`. Row count may vary.

Check status update with a **fictional test row** already in Sheets:

```bash
curl -X POST "https://YOUR-SUBDOMAIN.app.n8n.cloud/webhook/airchill-demo-status" \
  -H "Content-Type: application/json" -H "x-airchill-key: YOUR_SECRET" \
  -d '{"session_id":"TEST_SESSION_ID","status":"In progress"}'
```

Expected `{"ok":true,"session_id":"...","status":"In progress"}`. Check that *same* row is updated in Google Sheets, with `updated_at`, and no extra row created. This update is separate from your existing Row Added notification trigger.

## C. Connect the Next.js dashboard to n8n

Edit `.env.local`:

```dotenv
DEMO_MODE=false
N8N_GET_REQUESTS_URL=https://YOUR-SUBDOMAIN.app.n8n.cloud/webhook/airchill-demo-requests
N8N_UPDATE_STATUS_URL=https://YOUR-SUBDOMAIN.app.n8n.cloud/webhook/airchill-demo-status
N8N_WEBHOOK_SECRET=YOUR_EXACT_HEADER_AUTH_SECRET
DASHBOARD_PASSWORD=LONG_UNIQUE_DASHBOARD_PASSWORD
SESSION_SECRET=DIFFERENT_RANDOM_STRING_AT_LEAST_32_CHARS
```

Restart `npm run dev`. Browser now shows a password-protected login. After login:
- Dashboard fetches rows through the **Next.js server**, not directly from n8n in the browser.
- Status changes are validated by the backend, sent to n8n, then written to Google Sheets.
- Data refreshes automatically every 30 seconds, and manually with Refresh.

Never put the secret in a `NEXT_PUBLIC_` variable or expose webhook URLs/credentials in browser code. Keep `.env.local` uncommitted.

## D. What NOT to claim in the sales demo

- This is **not** connected to the actual AirChill company or its real customer WhatsApp.
- Contact/booking/photo fields displayed in the demo may be **illustrative**.
- The system does not diagnose faults, determine repair pricing, dispatch technicians, or confirm booking availability.
- The dashboard contains only requests from your test spreadsheet in Live mode.

## E. Acceptance tests

1. Default demo mode loads six synthetic requests. Search/filter and detail drawer work.
2. An unauthorized request to production n8n webhook is rejected.
3. Correctly authenticated GET returns the existing `Requests` rows.
4. Live dashboard login requires the set password.
5. Mark a fictional test request **In progress**; its *existing* Google Sheet row updates, no duplicate.
6. Refresh live dashboard and confirm status persists.
7. After another fictional intake request is confirmed, it appears in the dashboard and your existing **Staff Notifications** workflow still emails once.

## Limitations / production hardening

- This package is for a small **private prototype**; not for deployment using sensitive real customer data without additional safeguards, access policies, audit logs, retention rules, error handling, and business approval.
- Google Sheets makes a workable demo database but has limited concurrency and audit guarantees.
- No owner/staff multi-role permissions; one shared dashboard password is suitable only for private demo evaluation.
- The status update API uses a read-before-update guard; heavy-concurrency production deployments require atomic row controls or a proper database.
- Rate-limiting, monitoring, and CSRF origin checks behind reverse proxies should be reviewed before public deployment.
- Network access is needed for `npm install`. The source and workflow JSON were generated and structurally checked, but not run against your live n8n Cloud deployment here.


## Upgrade from dashboard V1 to V1.1 (Codex / VS Code)

1. Save your current `.env.local` and any custom edits before replacing files.
2. Copy this project over the existing source, preserving your own `.env.local`.
3. Stop and restart the development server (`npm run dev`).
4. Click each sidebar link: URL, breadcrumb, title, table contents and active highlight must change.
5. Test opening a request and updating status in Demo Mode. Note: Demo Mode edits reset on refresh/navigation; Live Mode writes updates to n8n.
6. Only after the UI is verified, connect the existing two n8n dashboard workflows following section B and enable `DEMO_MODE=false`.

Existing AI intake / Gmail notification workflows are unchanged.
