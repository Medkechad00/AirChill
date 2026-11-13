# Codex handoff — AirChill-style staff dashboard V1.1

Use this **existing** Next.js project, not a new one. Preserve: App Router, Tailwind tooling, custom clean editorial interface, server-only n8n webhook credentials, signed-cookie login gate in Live mode, and compatibility with existing Google Sheet columns.

## Objective

Audit this code, run local build/lint/typechecks, fix any issues, and validate dashboard behavior in Demo Mode before live n8n integration. Do not change existing n8n intake or notification workflows. No external deployment or contacting the real business.

## UI direction

Light, premium operations dashboard. Deep evergreen sidebar, off-white main workspace, flat white cards with minimal corner rounding, disciplined spacing, legible status pills, responsive table, clear detail drawer. Avoid AI-themed glows, excessive gradients, mock phone, or decorative elements. Preserve disclosure "Demo concept / not affiliated with AirChill".

## Test plan

1. `npm install`, `npm run build`, and check TypeScript (use `npx tsc --noEmit`).
2. Run `npm run dev` with `DEMO_MODE=true`. Check search, filter, detail, local status changes and empty state.
3. Check small-screen layout.
4. Check login and backend routes in Live mode without exposing secrets client-side.
5. Validate API JSON shapes and helpful errors if n8n is unavailable.
6. Review accessibility: keyboard navigation, focus indication, contrast, labels.

Work with fictional data only. Never hardcode API keys, passwords, business phone numbers or real customer records.


## Navigation fix in V1.1

Dedicated App Router pages were added at `/requests`, `/requests/pending`, `/requests/in-progress`, `/requests/completed`. They share `components/Dashboard.tsx` with a `view` prop; the left navigation uses `next/link`. Verify that the active state, topbar breadcrumb, heading and filtered rows change with the selected page. Do not replace with cosmetic active tabs or route-less state. Preserve all login and n8n API behaviors.
