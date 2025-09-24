import { spawn } from 'node:child_process';
import { readFile, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config.json');
const localConfigPath = path.join(__dirname, 'config.local.json');

async function loadConfig() {
  let baseConfig = {};
  try {
    const raw = await readFile(configPath, 'utf-8');
    baseConfig = JSON.parse(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  let localConfig = {};
  try {
    const rawLocal = await readFile(localConfigPath, 'utf-8');
    localConfig = JSON.parse(rawLocal);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const merged = {
    overlayUrl: 'https://dexter.cash/overlay/live?layout=compact',
    display: ':99',
    width: 1920,
    height: 1080,
    fps: 30,
    videoBitrate: '5000k',
    audioBitrate: '128k',
    ...baseConfig,
    ...localConfig,
  };

  const rtmpUrl = merged.rtmpUrl
    ? merged.rtmpUrl
    : merged.rtmpBase && merged.streamKey
      ? `${merged.rtmpBase.replace(/\/$/, '')}/${merged.streamKey}`
      : null;

  if (!rtmpUrl || /YOUR-STREAM-KEY/i.test(rtmpUrl)) {
    throw new Error(
      `RTMP destination is not configured. Update ${localConfigPath} (preferred) or ${configPath}.`
    );
  }

  return {
    ...merged,
    rtmpUrl,
  };
}

function spawnProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    ...options,
  });
  child.on('error', (error) => {
    console.error(`[${command}] process error`, error);
  });
  return child;
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSocket(socketPath, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await access(socketPath);
      return true;
    } catch {}
    await wait(50);
  }
  return false;
}

async function main() {
  const config = await loadConfig();
  const screenSpec = `${config.width}x${config.height}x24`;

  const baseDisplay = Number.parseInt(String(config.display ?? '99').replace(/^:/, ''), 10) || 99;
  const maxAttempts = 10;
  let display;
  let xvfb;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = baseDisplay + attempt;
    display = `:${candidate}`;
    const lockPath = `/tmp/.X${candidate}-lock`;
    const socketPath = `/tmp/.X11-unix/X${candidate}`;

    try {
      await rm(lockPath, { force: true });
      await rm(socketPath, { force: true });
    } catch (error) {
      console.warn('[dexter-stream] warning cleaning X lock files', error.message || error);
    }

    console.log(`[dexter-stream] starting Xvfb on ${display}`);
    const candidateProcess = spawnProcess('Xvfb', [display, '-screen', '0', screenSpec, '-nolisten', 'tcp', '-ac']);

    const ready = await waitForSocket(socketPath, 1000);
    if (ready) {
      xvfb = candidateProcess;
      break;
    }

    console.warn(`[dexter-stream] Xvfb on ${display} did not start; trying next display`);
    try {
      candidateProcess.kill('SIGTERM');
    } catch {}
    await wait(250);
  }

  if (!xvfb || !display) {
    throw new Error('Failed to start Xvfb on any display');
  }

  let shuttingDown = false;
  const cleanupTasks = [];
  const cleanup = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('[dexter-stream] cleaning up');
    await Promise.allSettled(
      cleanupTasks.map(async (task) => {
        try {
          await task();
        } catch (error) {
          console.error('[dexter-stream] cleanup error', error);
        }
      })
    );
    try {
      xvfb.kill('SIGTERM');
    } catch {}
  };

  const handleFatalExit = async (label, code, signal) => {
    console.error(`[dexter-stream] ${label} exited (code=${code} signal=${signal})`);
    await cleanup();
    process.exit(code === null ? 1 : code);
  };

  xvfb.on('exit', (code, signal) => handleFatalExit('Xvfb', code, signal));

  process.env.DISPLAY = display;

  console.log('[dexter-stream] waiting for X display');
  await wait(750);

  console.log('[dexter-stream] launching Chromium');
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=swiftshader',
      `--window-size=${config.width},${config.height}`,
      `--app=${config.overlayUrl}`,
      '--disable-translate',
      '--disable-features=HardwareMediaKeyHandling,MediaRouter',
    ],
  });
  cleanupTasks.push(async () => {
    try {
      await browser.close();
    } catch {}
  });

  const contexts = browser.contexts();
  let page = contexts.length ? contexts[0].pages()[0] : null;
  if (!page) {
    page = await browser.newPage();
  }
  if (page) {
    await page.setViewportSize({ width: config.width, height: config.height });
    if (!page.url() || page.url() === 'about:blank') {
      await page.goto(config.overlayUrl, { waitUntil: 'networkidle' });
    } else {
      await page.waitForLoadState('networkidle');
    }
    console.log('[dexter-stream] overlay page loaded');
  } else {
    console.warn('[dexter-stream] unable to access page handle; continuing');
  }

  console.log('[dexter-stream] starting ffmpeg pipeline');
  const ffmpegArgs = [
    '-hide_banner',
    '-loglevel', 'info',
    '-nostats',
    '-f', 'x11grab',
    '-video_size', `${config.width}x${config.height}`,
    '-framerate', String(config.fps),
    '-i', display,
    '-f', 'lavfi',
    '-i', `anullsrc=channel_layout=stereo:sample_rate=44100`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-b:v', config.videoBitrate,
    '-maxrate', config.videoBitrate,
    '-bufsize', '2M',
    '-g', String(config.fps * 2),
    '-keyint_min', String(config.fps),
    '-c:a', 'aac',
    '-b:a', config.audioBitrate,
    '-ar', '44100',
    '-ac', '2',
    '-shortest',
    '-f', 'flv',
    config.rtmpUrl,
  ];

  const ffmpeg = spawnProcess('ffmpeg', ffmpegArgs, {
    env: { ...process.env },
  });
  ffmpeg.on('exit', (code, signal) => handleFatalExit('ffmpeg', code, signal));

  cleanupTasks.push(async () => {
    try {
      ffmpeg.kill('SIGTERM');
    } catch {}
  });

  const safeRtmp = (() => {
    if (config.rtmpBase) return `${String(config.rtmpBase).replace(/\/$/, '')}/•••`;
    const idx = config.rtmpUrl.lastIndexOf('/');
    return idx > -1 ? `${config.rtmpUrl.slice(0, idx)}/•••` : 'rtmp://•••';
  })();

  setTimeout(() => {
    if (!shuttingDown) {
      console.log(`[dexter-stream] ✅ streaming overlay → ${safeRtmp}`);
    }
  }, 4000);

  const handleSignal = async (signal) => {
    console.log(`[dexter-stream] received ${signal}`);
    await cleanup();
    process.exit(0);
  };

  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);

  console.log('[dexter-stream] streaming started');
}

main().catch(async (error) => {
  console.error('[dexter-stream] fatal error', error);
  process.exitCode = 1;
});
