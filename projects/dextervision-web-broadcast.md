# DexterVision Web Broadcast

## Roadmap Overview
1. **Phase 0 – Foundations**
   - Shared scene state (`dextervision/scene-state.json`) and `/stream/scene` endpoints in dexter-api (done).
   - OBS-style runner in `dexter-fe/scripts/dexter-stream/` with PM2 scripts (done).
   - Overlay UI available for Playwright/FFmpeg capture (done).

2. **Phase 1 – HLS Broadcast (current focus)**
   - Enable LiveKit HLS egress and capture the public `.m3u8` URL.
   - Update the stream runner to trigger HLS alongside the existing RTMP feed, logging a clear “HLS ✅” when publishing.
   - Build a `<DexterVisionPlayer />` that autoplays the HLS feed, displays scene badges via `/stream/scene`, and falls back to an offline slate.
   - Wire the player into the homepage (or dedicated route) behind a feature flag; add lightweight viewer/error telemetry.
   - Document build/restart steps (`npm run build`, `pm2 restart dexter-stream --update-env`) and add a simple `.m3u8` health probe.

3. **Phase 2 – Enhancements**
   - Scheduled scene playlists and nightly standby slates driven by a JSON schedule.
   - Scene-aware Ops dashboard plus viewer metrics (count, error rate, scene history).
   - Optional alternate tickers/headlines or highlight capture for marketing snapshots.

4. **Phase 3 – WebRTC Upgrade (low-latency future)**
   - Publish the stream into a LiveKit Room (WebRTC ingress) while retaining HLS as fallback.
   - Add a dexter-api token endpoint for viewer auth; integrate LiveKit’s React player for sub-second latency.
   - Layer on interactive features (chat, buzz-in, invite-to-stage) once the room path is stable.

## Phase 1 Task List
1. **Enable LiveKit HLS egress**
   - Confirm LiveKit project tier supports HLS.
   - Enable egress via console/API and record the playback URL plus any access controls.
2. **Update stream runner**
   - Extend `config.*` with optional HLS settings (room name, API key, etc.).
   - Trigger HLS egress at startup and log success alongside the RTMP announcement.
3. **Frontend player**
   - Implement `<DexterVisionPlayer />` with `hls.js` fallback, autoplay muted, and scene badge driven by `/stream/scene`.
   - Show an “offline” slate when the playlist fails; emit basic telemetry events.
   - Embed on the homepage or dedicated route behind a feature flag.
4. **Configuration & secrets**
   - Add `NEXT_PUBLIC_DEXTERVISION_HLS_URL` (and any related LiveKit settings) to `.env.example`.
   - Update docs/onboarding with the HLS setup steps.
5. **Operations & monitoring**
   - Document PM2 restart expectations and HLS health checks.
   - Add a periodic probe (curl/HEAD) and basic viewer metrics collection.

## Considerations / Stretch
- Alternate lower-third/ticker content after the core layout ships.
- Automated highlight capture (stills or short clips) for marketing.
- WebRTC path can be layered on later without ditching the HLS work.

## Estimated Effort
~½ day for Phase 1 once dexter-fe is free (LiveKit config + runner tweak + frontend module). Subsequent phases build incrementally on the same foundation.
