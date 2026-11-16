# AirChill Product Demo — V3 Edit Brief: Screen Recording Is the Hero

## Scope and reason for revision

The user **liked the general V2 edit**, but the footage choice was wrong: Codex only used the phone/camera shot of the laptop. The user has **already supplied direct screen recordings to the local Codex workspace** and wants the sharp real application screens used for the important moments. The camera-shot laptop video is **background/B-roll only**.

**Keep the restrained, premium V2 aesthetic and any pacing/motion that works. Rebuild the shot selection/compositing, NOT an entirely new slide concept.**

Do **not** interpret previous V2 instructions ("the real video is the hero") to mean the filmed-laptop footage must be the hero. The **direct desktop/screen recording** is the primary evidence; it is the real video to feature. This V3 brief supersedes any conflicting statements in older docs.

## Required input discovery BEFORE edit or render

1. **Find every user-supplied local screen recording**. Inspect the existing Codex chat attachments, workspace, and local `video/assets/raw/` as well as any exact paths already mentioned by the user. File naming is NOT reliable. Do not assume the only input is `IMG_6698.mp4`.
2. Inventory **ALL** video files, with absolute location, duration, resolution, audio tracks, and a visual contact sheet. Use `ffprobe`/FFmpeg; include a 3–10 second sampling and extra frames around interface changes. Inspect, do not classify solely by filename.
3. Identify each **direct screen recording** section showing:
   - n8n AI chat: customer request, 1–2 meaningful clarifying questions, summarized information, confirmation
   - Next.js staff dashboard: request list, selected request details, change of status (where present)
   - Gmail: received staff notification (where present)
   - Google Sheets ONLY if genuine direct screen footage exists. The original filmed-laptop video did not contain Sheets footage; do not invent a sheet shot.
4. Build a **source-to-output edit decision list (EDL)** with input file, source-in, source-out, scene description, target output window, and reason for inclusion. **Use timecodes from actual screen recordings, not the filmed-laptop camera timecodes.**
5. Before rendering, explicitly verify that all requested direct recordings have been discovered. If not, DO NOT silently fall back to the filmed-laptop-only video. Report the missing source file/scene and ask for its actual location. A preview should clearly say that a primary source is missing.
6. For comparison only, review the existing `AirChill_Footage_V2_Silent_1080p.mp4` if present locally. Keep what looks premium and remove the weak unreadable camera footage as the primary visual.

### Camera/B-roll source (secondary)
`IMG_6698.mp4` is a ~2:29 camera recording of laptop in a dark blue-lit room. In that filmed-laptop recording, chat occurred approximately 0–98s, dashboard 99–127s, Gmail 129–149s. Those approximate timings are **NOT the direct screen recording timestamps** and must **NOT be used to avoid searching for the separate screen recordings**.

## Visual hierarchy — non-negotiable

- **80–90% of the finished running time: direct computer screen recordings**, sharp and readable at full frame or nearly full frame (1920×1080 canvas).
- **10–20% maximum: the filmed-laptop camera clip**, as brief atmospheric intro/outro/background/B-roll between sections; optional subtle blur/darkening behind small editorial overlays, not as the source of tiny unreadable UI.
- Do not center a 400px UI screenshot inside an empty card; do not shrink readable screen content into a corner.
- When real screen captures have a different aspect ratio, use a minimal, neutral background only in side gutters; do not stretch. If the interface text is too small, use a smooth **subtle pan/crop toward actual relevant content**, not a fake re-render or a huge zoom.
- Keep the *real cursor, message progression, dashboard action and actual notification*. Cut long waits, irrelevant tab changes, excessive scroll, repeated responses, loading screens, and unnecessary typing. Never cut out the evidence so viewers cannot see the result.
- Respect actual sequence/events; if the recorded sequence differs, edit to a logically truthful order without pretending an action happened when it didn't.
- NO fake UI, invented message screenshots, generated Google Sheets scene, decorative illustrations, charts, flashy effects, artificial highlights/glows/neon/3D, or generic SaaS template cards.
- Aim for **70–95 seconds**, but don't force exact length when real evidence or narration requires more or less.
- **No excessive text**. Use **2–4 total concise 2–5-word labels** placed unobtrusively only when they communicate a workflow milestone not obvious from UI. Example labels (use only some):
  - `AI qualifies the inquiry`
  - `Customer confirms request`
  - `Staff reviews and updates`
  - `Team notified automatically`
- Text is NOT a transcription of the voice-over. No paragraphs, no large headline beside tiny UI, no label every few seconds.
- Optional 2–3-second editorial opening title and 2–3-second end card. Use restrained motion, clean sans-serif type, well-balanced whitespace.
- Warm off-white/near-black/dark-green palette as V2 if needed; real app interface has visual priority.
- Mainly straight cuts, occasional short fades, modest purposeful zooms only when readability benefits.

## Audio

- Prefer approved natural **owner-recorded English voice-over**, or ElevenLabs audio already provided by the user. Do not regenerate generic robotic TTS.
- Find audio in local `video/assets/voice/` and any explicit local path from the user; if absent, create a silent preview only and flag that approved narration is missing.
- Pace cuts to the narration and key onscreen actions. Original camera-room audio should be muted; screen-recording click sounds muted or subtle.
- No music unless explicitly supplied/licensed. If used, it stays very quiet.

## Suggested edit rhythm: actual screen recordings + brief B-roll

The following is a **conceptual guide only**; derive final in/out timestamps from every direct-screen source:

| Beat | Primary footage | Explanation, if helpful |
|---|---|---|
| 0–4s | 1–2s camera-shot laptop + minimal editorial title | `AI Service Intake` |
| 4–32s | Direct **n8n chat screen record**, full frame: issue → relevant questions → summary | `AI qualifies the inquiry` only if needed |
| 32–43s | Direct chat: visible confirmation and submitted request | Optional `Request confirmed` |
| 43–70s | Direct **dashboard recording**: request list → open details → update status; show result | `Staff reviews and updates` |
| 70–83s | Direct **Gmail screen recording**: new notification opening; redact addresses | `Team notified automatically` |
| 83–88s | Short camera B-roll or clean title card | `Inquiry to staff handoff` |

If the screen recordings show a more natural order or much better scenes, prioritize them, not this rigid timing.

## Privacy and accuracy

- Work with **fictional/test customers only**. Redact passwords, credentials, webhook URLs, customer identifiers, email addresses, and unrelated browser UI.
- This is a prototype using n8n test chat, **not a live WhatsApp implementation**, and **not affiliated with AirChill**. Show a brief unobtrusive end-card disclaimer: `Illustrative prototype · Not affiliated with AirChill · No live WhatsApp integration`.
- Don't claim the business is losing leads, that requests are real clients, or that the bot confirms a repair appointment.
- Never commit raw recordings, rendered MP4, voice-over, emails or credentials to public GitHub.

## Codex execution checklist

1. Inventory media and build contact sheets for **all** sources, especially separately supplied screen recordings.
2. Write the EDL with precise source file paths and in/out times; prove **chat + dashboard + Gmail** are selected from the **DIRECT SCREEN RECORDINGS**.
3. Update the Remotion timeline to replace laptop camera footage in these principal scenes, preserving good V2 transitions and minimal style.
4. Remove text-heavy compositions, card-sized interfaces and unnecessary pauses; add 2–4 contextual labels maximum.
5. Sync with supplied voice-over if present, otherwise deliver silent preview, not a fake final narration.
6. Preview key frames with annotations showing **source file identity** for each main beat, verify actual on-screen activity and text legibility.
7. Render 1920×1080 30fps MP4 via Remotion/FFmpeg, inspect output for sound, frame crops, legibility and accidental sensitive-data exposure.
8. Show a final proof contact sheet including screenshots sourced from: (A) direct n8n chat recording, (B) direct dashboard recording, (C) direct Gmail recording.
9. Save result locally under `video/out/`. Commit **source-code/editing changes only**, never media.
10. Report the exact source file paths and used timestamps, runtime and output location. If any direct capture is unavailable, give explicit blocker instead of substituting the camera footage.

## Acceptance criteria

- [ ] Separate supplied screen-recording source files were actually identified and listed
- [ ] Main video prominently uses **direct n8n chat** — not filmed laptop
- [ ] Main video prominently uses **direct dashboard** — not filmed laptop
- [ ] Main video prominently uses **direct Gmail notification** — not filmed laptop
- [ ] Camera-shot video is B-roll only, **20% maximum**, often far less
- [ ] Real UI is sharp and fills frame instead of being a tiny crop
- [ ] Important automation results are shown; waiting and dead time are shortened
- [ ] Only 2–4 occasional short callouts, not paragraphs or repeated narration
- [ ] V2's restrained premium aesthetic remains, with no excessive effects
- [ ] Only authentic footage, no invented Sheets/demo UI, all private identifiers redacted
- [ ] Appropriate prototype/not-affiliated disclaimer
