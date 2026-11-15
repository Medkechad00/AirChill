# AirChill — Codex / Remotion / FFmpeg Post-Production Brief

## Task

Produce a **premium, minimalist, understated** 16:9 product-demo video for the working AirChill-style AC intake prototype. Use **Codex + Remotion + FFmpeg**. Output an approximately 75–90-second voice-over version and a 30–45-second sound-off version with readable section captions.

This is **an independent illustrative prototype, not the real AirChill product or a deployed WhatsApp integration**. Never claim that the workflow is used by AirChill or connected to its production systems.

## Existing source footage (reviewed)

Original camera-shot video: `IMG_6698.mp4`, approx. **149.3 s**, **3016×1696**, about **59.94 fps**, HEVC video with AAC audio. It films a laptop in a dark blue-lit room. Scenes show n8n chat, the request dashboard, and Gmail. The laptop text is small and hard to read; the recorded audio is extremely quiet.

**Critical creative constraint:** video post-processing cannot reliably restore tiny/unreadable laptop text. Preserve this original as a **1–3-second authentic establishing B-roll shot**. For the main demonstration, prefer **direct desktop screen captures** in 1920×1080 of n8n test chat, Google Sheets, staff Gmail notification and Next.js live dashboard. Request those captures locally if absent; do not fake dashboard actions or fabricate successfully completed automations.

The raw camera footage and any new screen recordings must remain **local and untracked**, not committed to the public GitHub repo. Never expose or embed API keys, n8n credentials, real user emails, full webhook URLs, passwords, phone numbers, or real customer records. Redact them in media BEFORE final rendering.

## Design system

- Canvas: **1920×1080**, **30 fps**, H.264 MP4, AAC audio.
- Clean, editorial, Swiss-style hierarchy; spacious typography.
- Background: warm off-white `#F5F6F3`, ink `#15251E`, restrained dark green `#1C684E`.
- Fonts: Inter (or system sans), simple bold section titles, unobtrusive lower thirds.
- No flashy zooms, neon, 3D, particles, glows, dramatic transitions, generic stock footage, or overdesigned effects.
- Subtle straight cuts / short 160–240 ms fades. Crop meaningful screen areas only where original text stays readable.
- Do not use unlicensed music. If licensed subtle music is available, keep it quiet under narration; otherwise omit music.
- **Mute original camera audio** (room noise only/very faint); use the new voice-over cleanly.
- Captions / short text overlays must remain readable on mute and not cover sensitive UI.

## Recommendation: use restrained English voice-over

Use a calm, natural English voice, around **115–130 words per minute**. Own recorded voice is ideal; if unavailable, use a licensed neutral AI TTS voice if an authorized synthesis tool is available. Do not assume a TTS API key exists. Keep the voice-over optional: render a silent caption-driven variant either way.

### Draft voice-over script (~145 words)

"An AC service request often starts with a simple message.

In this working demo, a customer explains that one AC unit is not cooling at a villa in Dubai Marina.

The assistant asks for the missing details, remembers information the customer already provided, and prepares a clear summary. Nothing is submitted until the customer confirms it.

Once confirmed, the request is saved in an organized Google Sheet. A staff notification is sent automatically so the team can review it.

In the dashboard, staff can search and open requests, then move them from pending review to in progress or completed. The status stays synchronized with the sheet.

This is an illustrative prototype built with n8n and a test chat, not a live WhatsApp deployment. It demonstrates how a service business could streamline incoming inquiries while keeping pricing, scheduling, and technical decisions with people."

Edit this script for accuracy against observed footage; do not claim anything not actually shown in the tested flow.

## Proposed timeline (adjust to actual footage)

| Timeline | Visual | Caption |
|---|---|---|
| 0–5s | Cinematic 1–3s camera footage, then clean title card | AI-Assisted Service Intake |
| 5–29s | Direct n8n test-chat screen capture; customer query, qualification | From inquiry to structured details |
| 29–42s | Summary and explicit customer confirmation | Confirmed by the customer |
| 42–54s | New row in Google Sheets (redact identifiers) | Saved automatically |
| 54–64s | Gmail staff notification (redact addresses) | Staff notified |
| 64–80s | Dashboard details and change Pending → In progress; refresh to show persistence | One clear staff queue |
| 80–87s | Clean end frame, no inflated sales claims | Structured intake. Human review. |

## Codex implementation instructions

1. Inspect the local raw source with `ffprobe` and extract a sparse contact sheet to identify actual scene timestamps. **Do not infer timings from the table**; align edits to the real footage.
2. Create an isolated `video/` Remotion project (do not overwrite the Next.js dashboard configuration). Follow current official Remotion APIs for `@remotion/media` video/audio elements.
3. Use FFmpeg for safe pre-trimming, scaling, denoise where beneficial, and H.264 encoding. Use Remotion for motion-graphics title cards, overlays, scene sequencing, and audio mixing.
4. Expect additional screen capture files in a local untracked `video/assets/raw/` folder. The existing `IMG_6698.mp4` alone is inadequate for detailed legibility; if additional footage is absent, create an honest camera-footage-only **draft** and explicitly mark legibility as a blocker. Do not recreate screens falsely as if they had been captured.
5. Produce a clean, calibrated narration track from provided owner audio or a permitted TTS tool; otherwise create a VO placeholder and a complete silent version. Never claim the VO was generated if a provider is unavailable.
6. Add a silent-friendly version with concise editorial callouts and no narration.
7. Run a preview, check readability, listen for clipping, inspect final frame, render to local `video/out/`, and report precise file paths, runtimes, and any missing media.
8. Include one clear disclaimer unobtrusively: `Illustrative prototype — not affiliated with AirChill. No live WhatsApp integration.`

### Expected outputs

- `video/out/AirChill_Executive_Demo_Voiceover.mp4` (when VO audio exists)
- `video/out/AirChill_Executive_Demo_Silent.mp4`
- `video/out/preview_contact_sheet.jpg`
- Reproducible video project source and render commands in `video/README.md`

**Do not commit media assets or exported videos to GitHub**; the repository is public. Commit only source code, reusable assets explicitly cleared for public use, and documentation.
