# Dexter Stream Runner

Automates a headless 24/7 overlay stream by launching Xvfb, Chromium (Playwright), and FFmpeg, then pushing the rendered overlay to an RTMP endpoint. Intended to run under PM2 as the `dexter-stream` process. Optional LiveKit integration can mirror the feed to an HLS playlist for the public DexterVision player.

## Setup

1. Install dependencies (already done once):
   ```bash
   npm install --save-dev playwright
   npx playwright install chromium
   ```

2. Copy the template, then set your RTMP endpoint (and optional LiveKit settings):
   ```bash
   cp scripts/dexter-stream/config.template.json scripts/dexter-stream/config.local.json
   ```
   - Edit the new `config.local.json` and set either `rtmpUrl`, or `rtmpBase` + `streamKey`.
   - To enable HLS egress, flip `livekit.enableHls` to `true` and supply your LiveKit `host`, API credentials, `roomName`, and preferred playlist options. The runner will start a room-composite egress and log the playlist URL.
   - `config.json` stays in git with placeholders for reference; `config.local.json` (ignored) carries real secrets.
   - Adjust other fields (layout, fps, bitrate) only if you know you need to.

## Usage

Start the stream (registers with PM2 as `dexter-stream`):
```bash
npm run dexter-stream:start
```

Check status/logs:
```bash
npm run dexter-stream:status
pm2 logs dexter-stream --nostream
```

Restart or stop:
```bash
npm run dexter-stream:restart
npm run dexter-stream:stop
```

## Notes

- Overlay URL defaults to `https://dexter.cash/overlay/live?layout=compact`. Edit `config.json` if you prefer another layout.
- FFmpeg uses a silent audio source (`anullsrc`) so downstream players stay happy; swap in real audio later if needed.
- Process exits if any child (Xvfb, Chromium, FFmpeg) dies—PM2 restarts it automatically.
- When HLS is enabled the runner triggers a LiveKit room-composite egress. The log line `🎯 HLS playlist → …` surfaces the playback URL; stop the PM2 process to halt the egress (the runner calls `StopEgress` during shutdown).
- Keep an eye on the playlist via a simple probe (e.g. `curl -I <playlist>.m3u8`) if you need automated monitoring.
