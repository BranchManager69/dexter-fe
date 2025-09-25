# DexterVision Web Broadcast

## Goal
Deliver a public, always-on DexterVision player on the Dexter FE homepage that mirrors the OBS overlay with minimal ops overhead.

## Output Criteria
- LiveKit produces an HLS playlist (`.m3u8`) accessible via HTTPS for browser playback.
- Dexter FE renders a responsive video module that autoplays the HLS feed with a live scene badge (On Air / Standby / Game Show) and fallback messaging when offline.
- Stream runner keeps the OBS RTMP feed intact while optionally pushing the same scene to the HLS output.

## Task List
1. **Enable LiveKit HLS egress**
   - Confirm the LiveKit project tier supports HLS output.
   - Generate or note the public HLS playback URL (may require enabling the egress hook or API call).
   - Document any auth tokens/headers needed.
2. **Update stream runner (dexter-fe/scripts/dexter-stream)**
   - Add config fields for an optional HLS target or reuse the existing LiveKit credentials.
   - Ensure the Playwright/FFmpeg pipeline can publish both OBS RTMP and HLS (sequentially or via LiveKit dual-output).
   - Emit a success log when HLS publishing is active.
3. **Frontend player component**
   - Add a reusable `<DexterVisionPlayer />` that mounts `hls.js` when the browser lacks native HLS.
   - Autoplay + mute by default, with a styled fallback slate for “stream offline.”
   - Read `/stream/scene` (or `dextervision/scene-state.json`) to display a live status badge and timestamp.
   - Embed on the Dexter FE landing page (or a dedicated DexterVision route) behind a feature flag.
4. **Configuration & secrets**
   - Introduce environment variables for the HLS playlist URL (e.g., `NEXT_PUBLIC_DEXTERVISION_HLS_URL`).
   - Update `.env.example`, onboarding docs, and the README to mention the new config.
5. **Operations & monitoring**
   - Extend the runbook with instructions for restarting the stream runner and verifying HLS playback.
   - Add a lightweight health probe (e.g., HEAD request to `.m3u8`) to alert if the feed is stale.
   - Capture basic viewer metrics (session count, playback errors) for Ops dashboards.

## Considerations / Stretch
- Scheduled scene playlists (e.g., cron-driven standby → live transitions, rotating channels) once streaming basics land.
- Alternate lower-third / ticker content (AI headlines, pumpstream deltas) after the core layout ships.
- highlight capture: auto-save still frames or short clips for marketing snapshots.
- If near-real-time latency becomes critical, revisit a WebRTC viewer using LiveKit’s React SDK after HLS launch.
- Reuse the scene-switch JSON (`dextervision/scene-state.json`) to display current scene status alongside the video.

## Estimated Effort
~½ day once the FE repo is clear (mix of LiveKit config, runner tweak, and frontend module work).
