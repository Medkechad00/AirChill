# Connect AirChill Dashboard to n8n Cloud (Live Mode)

This is a **private demonstration** connected only to the existing AIRCHILL / Requests test sheet, not to AirChill's real customers.

## 1. Import both existing backend workflows

The workflow JSON files are included in this repository:

- [Dashboard GET Requests](../n8n/AirChill_Dashboard_GET_Requests.json)
- [Dashboard POST Update Status](../n8n/AirChill_Dashboard_POST_Update_Status.json)

In n8n Cloud, create **two new workflows** and import each JSON. Do **not** replace the already-working AI Intake or Gmail Staff Notifications workflows.

### GET — Requests

- Webhook trigger: method **GET**, path `airchill-demo-requests`, Authentication **Header Auth**.
- Create a credential with Header Name **`x-airchill-key`** and a strong random Header Value, kept private.
- `Google Sheets — Read Requests`: connect the existing Google account, choose document `AIRCHILL` and sheet `Requests`, and ensure operation is **Get Row(s)**.
- `Return request list` should emit `{items:[...],count:...,source:'google_sheets'}` (even if the sheet contains zero rows).
- `Return JSON` responds using the Webhook response node.
- Publish and copy the **Production URL** ending in `/webhook/airchill-demo-requests`.

### POST — Update Status

- Webhook trigger: method **POST**, path `airchill-demo-status`, Authentication **Header Auth**.
- Reuse the exact same `x-airchill-key` credential.
- `Google Sheets — Read For Existence`: document `AIRCHILL`, sheet `Requests`, operation **Get Row(s)**.
- `Google Sheets — Update Existing Row`: operation **Update Row**, match on `session_id`, update **only** `status` and `updated_at` while providing the matching `session_id` in input. Do **not** choose Append or Update Row for staff updates.
- Valid status values are exactly `Pending staff review`, `In progress`, and `Completed`.
- Publish and copy the **Production URL** ending in `/webhook/airchill-demo-status`.

Re-select Document/Sheet and refresh column mappings when n8n imports a node with placeholders. n8n credentials are intentionally **not** stored in workflow JSON.

## 2. Configure the Next.js local server

In the AirChill repository on your computer:

```powershell
git pull origin main
npm install
Copy-Item .env.example .env.local
```

If `.env.local` already exists, **do not overwrite it**; edit that existing file instead.

Set these values in `.env.local`:

```dotenv
DEMO_MODE=false
N8N_GET_REQUESTS_URL=https://YOUR-N8N-SUBDOMAIN.app.n8n.cloud/webhook/airchill-demo-requests
N8N_UPDATE_STATUS_URL=https://YOUR-N8N-SUBDOMAIN.app.n8n.cloud/webhook/airchill-demo-status
N8N_WEBHOOK_SECRET=YOUR_PRIVATE_HEADER_AUTH_VALUE
DASHBOARD_PASSWORD=YOUR_UNIQUE_DASHBOARD_PASSWORD
SESSION_SECRET=ANOTHER_LONG_RANDOM_VALUE_AT_LEAST_32_CHARS
```

Use separate random values for `N8N_WEBHOOK_SECRET` and `SESSION_SECRET`; minimum 24 and 32 characters respectively. Your dashboard password should be a distinct strong password of at least 12 characters.

To generate random values **locally** (PowerShell terminal):

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Run the command twice for the two different secrets. **Never push `.env.local`**, paste credentials into a chat, or put secrets into variables beginning with `NEXT_PUBLIC_`.

## 3. Perform the read-only preflight

```powershell
npm run check:live
```

The check validates environment variables, rejects non-production webhook URLs, checks that unauthenticated GET does not expose data, and verifies the authenticated GET response contains `items`. It does **not** reveal any test customer records or change statuses.

If it says `Authenticated GET failed`, inspect both published Webhook credentials and the Google Sheets node. If it says `Invalid JSON response`, check `Return request list` and `Respond to Webhook`. If it warns `SECURITY ERROR`, stop and fix Header Auth before proceeding.

## 4. Open the dashboard

```powershell
npm run dev
```

Open `http://localhost:3000`. You should see a staff login (not Demo Mode). Sign in with the password from your local file. Dashboard requests should now show the test rows from Google Sheets.

### Test a status update

1. Open **All requests** and select a *fictional* test request.
2. Change `Pending staff review` to `In progress`.
3. Verify that the same row in Google Sheets changed, without any new row being added.
4. Refresh the dashboard: the status should remain `In progress`.
5. Create one new *fictional* intake request via the existing AI Chat workflow. Verify the request appears on dashboard refresh and one Gmail staff notification is sent.

Do not test updates using actual customer data.

## 5. Typical problems

| Symptom | Likely cause |
|---|---|
| Login unavailable / 503 | Missing environment value or placeholder secret; restart Next.js after changing `.env.local` |
| Dashboard 401 | Not logged in or session cookie expired |
| Live requests 502 | Production webhook unpublished, Header Auth mismatch, Google Sheets node error, or unexpected response JSON |
| Status change 502 | POST workflow unpublished, wrong `session_id` column mapping, or no matching row |
| No rows | Wrong document/tab; blank sheet; GET Code node filtering out rows with empty `session_id` |
| Changes aren't visible | Browser still in Demo Mode; check `DEMO_MODE=false` and restart Next.js |

## Security and limitations

- Use **fictional/demo records only** until a formal data processing agreement, access policy, and security assessment are in place.
- The n8n credentials and Google Sheets access stay in n8n, and webhook secrets remain server-side in Next.js.
- The prototype is not meant for public production use without stronger account security, auditing, rate limits, and backup/error recovery.
- Repo is public, so never commit personal customer data, private identifiers, or any secret.


## Diagnosing `configured: false` when `check:live` passes

The `npm run check:live` script reads `.env.local` directly, whereas the Next.js application reads the environment of the running server. A previous Next.js process on port 3000, a different working directory, or process-level environment overrides can cause different results.

The dashboard now includes a **localhost-only development diagnostics view** on `/api/session`. It shows names of settings that fail validation; it never includes their values.

1. Pull the newest code: `git pull origin main`.
2. Close **all** existing Next.js dev terminals with Ctrl+C.
3. Start this exact repo on a new, unused port: `npm run dev -- -p 3005`.
4. Open `http://localhost:3005/api/session` (not the older port 3000).
5. Confirm `diagnosticVersion` is `live-config-v1`.
6. Look at `configurationIssues` for missing setting names. Do not share the values of secrets.

If `diagnosticVersion` is absent, you are looking at an old dev server or you have not pulled the new code. If `configurationIssues` is empty and `configured` is true, the login page should load. Otherwise inspect only the settings named by the diagnostic, save `.env.local`, and restart the server.

If this still differs from `check:live`, inspect other environment files such as `.env.development.local` and any variables supplied by the launching shell. Do not print or share secret values.
