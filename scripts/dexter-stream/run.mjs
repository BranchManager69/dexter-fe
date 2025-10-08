import { spawn } from 'node:child_process';
import { readFile, rm, access, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';
import livekitSdk from 'livekit-server-sdk';

const {
  EgressClient,
  SegmentedFileProtocol,
  EncodingOptionsPreset,
  IngressClient,
  IngressInput,
  IngressVideoEncodingPreset,
  IngressAudioEncodingPreset,
} = livekitSdk;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'config.json');
const localConfigPath = path.join(__dirname, 'config.local.json');

const DEFAULT_CONFIG = {
  overlayUrl: 'https://dexter.cash/overlay/live?layout=compact',
  display: ':99',
  width: 1920,
  height: 1080,
  fps: 30,
  videoBitrate: '5000k',
  audioBitrate: '128k',
  videoFilter: '',
};

const DEFAULT_AUDIO_CONFIG = {
  directory: '',
  playlist: [],
  extensions: ['.mp3', '.m4a', '.aac', '.wav', '.ogg'],
  shuffle: false,
  mode: 'playlist',
};

const DEFAULT_LIVEKIT_CONFIG = {
  enableHls: false,
  host: '',
  apiKey: '',
  apiSecret: '',
  roomName: 'dextervision',
  layout: '',
  encodingPreset: '',
  audioOnly: false,
  videoOnly: false,
  customBaseUrl: '',
  hls: {
    playlistName: 'dextervision.m3u8',
    filenamePrefix: 'dextervision',
    segmentDuration: 6,
    pathPrefix: '',
    directory: '',
    playbackUrl: '',
  },
  ingress: {
    name: 'DexterVision OBS',
    participantIdentity: 'dextervision-broadcast',
    participantName: 'DexterVision Broadcast',
    videoPreset: 'H264_1080P_30FPS_1_LAYER',
  },
};

function toAbsolutePath(targetPath) {
  if (!targetPath || typeof targetPath !== 'string') return null;
  const trimmed = targetPath.trim();
  if (!trimmed) return null;
  if (path.isAbsolute(trimmed)) return trimmed;
  return path.resolve(__dirname, trimmed);
}

function escapeForConcat(filePath) {
  return filePath.replace(/'/g, "'\\''");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function normalizeAudioConfig(base = {}, override = {}) {
  if (!base && !override) return null;

  const baseList = Array.isArray(base?.playlist) ? base.playlist : [];
  const overrideList = Array.isArray(override?.playlist) ? override.playlist : [];

  const merged = {
    ...DEFAULT_AUDIO_CONFIG,
    ...(base ?? {}),
    ...(override ?? {}),
  };

  merged.mode = typeof merged.mode === 'string' ? merged.mode.trim().toLowerCase() : DEFAULT_AUDIO_CONFIG.mode;

  merged.playlist = [...baseList, ...overrideList]
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);

  if (!Array.isArray(merged.extensions) || merged.extensions.length === 0) {
    merged.extensions = [...DEFAULT_AUDIO_CONFIG.extensions];
  }
  merged.extensions = merged.extensions
    .map((ext) => {
      const normalized = String(ext || '').trim().toLowerCase();
      if (!normalized) return null;
      return normalized.startsWith('.') ? normalized : `.${normalized}`;
    })
    .filter(Boolean);

  merged.shuffle = Boolean(merged.shuffle);
  merged.directory = typeof merged.directory === 'string' ? merged.directory.trim() : '';

  if (
    merged.mode === 'silence'
    || (merged.playlist.length === 0 && !merged.directory)
  ) {
    return null;
  }

  return merged;
}

async function resolveAudioInput(audioConfig, cleanupTasks = []) {
  if (!audioConfig) {
    return {
      args: ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'],
      description: 'silence',
    };
  }

  const tracks = [];
  const seen = new Set();

  const pushTrack = async (candidate) => {
    const absPath = toAbsolutePath(candidate);
    if (!absPath || seen.has(absPath)) return;
    try {
      const stats = await stat(absPath);
      if (stats.isFile()) {
        seen.add(absPath);
        tracks.push(absPath);
      }
    } catch (error) {
      console.warn('[dexter-stream] unable to include audio file', candidate, error.message || error);
    }
  };

  for (const entry of audioConfig.playlist || []) {
    await pushTrack(entry);
  }

  if (audioConfig.directory) {
    const absDir = toAbsolutePath(audioConfig.directory);
    if (absDir) {
      try {
        const entries = await readdir(absDir);
        const lowerExts = new Set(audioConfig.extensions);
        for (const entryName of entries) {
          const fullPath = path.join(absDir, entryName);
          const ext = path.extname(entryName).toLowerCase();
          if (lowerExts.has(ext)) {
            await pushTrack(fullPath);
          }
        }
      } catch (error) {
        console.warn('[dexter-stream] failed to read audio directory', audioConfig.directory, error.message || error);
      }
    }
  }

  if (!tracks.length) {
    return {
      args: ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'],
      description: 'silence',
    };
  }

  if (audioConfig.shuffle) {
    shuffleArray(tracks);
  }

  const playlistContent = tracks
    .map((filePath) => `file '${escapeForConcat(filePath)}'`)
    .join('\n');

  const playlistPath = path.join(
    os.tmpdir(),
    `dexter-audio-playlist-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`,
  );

  await writeFile(playlistPath, playlistContent, 'utf-8');
  cleanupTasks.push(async () => {
    try {
      await rm(playlistPath, { force: true });
    } catch {}
  });

  console.log(`[dexter-stream] audio playlist loaded (${tracks.length} tracks)`);

  return {
    args: ['-stream_loop', '-1', '-f', 'concat', '-safe', '0', '-i', playlistPath],
    description: `playlist (${tracks.length} tracks)`,
  };
}

function normalizeLivekitConfig(base = {}, override = {}) {
  const merged = {
    ...DEFAULT_LIVEKIT_CONFIG,
    ...base,
    ...override,
  };
  merged.hls = {
    ...DEFAULT_LIVEKIT_CONFIG.hls,
    ...(base?.hls ?? {}),
    ...(override?.hls ?? {}),
  };
  merged.ingress = {
    ...DEFAULT_LIVEKIT_CONFIG.ingress,
    ...(base?.ingress ?? {}),
    ...(override?.ingress ?? {}),
  };
  return merged;
}

function resolveEncodingPreset(preset) {
  if (!preset || typeof preset !== 'string') return undefined;
  const key = preset.trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(EncodingOptionsPreset, key)) {
    return EncodingOptionsPreset[key];
  }
  return undefined;
}

function resolveIngressVideoPreset(preset) {
  if (!preset || typeof preset !== 'string') return undefined;
  const key = preset.trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(IngressVideoEncodingPreset, key)) {
    return IngressVideoEncodingPreset[key];
  }
  return undefined;
}

function safeJoinUrl(base, suffix) {
  if (!base) return suffix;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedSuffix = suffix.startsWith('/') ? suffix.slice(1) : suffix;
  return `${normalizedBase}/${normalizedSuffix}`;
}

async function startLivekitHlsEgress(livekitConfig) {
  if (!livekitConfig?.enableHls) return null;
  const required = ['host', 'apiKey', 'apiSecret', 'roomName'];
  const missing = required.filter((key) => !livekitConfig[key]);
  if (missing.length) {
    console.warn('[dexter-stream] skipping HLS egress (missing config keys:', missing.join(', '), ')');
    return null;
  }

  const client = new EgressClient(livekitConfig.host, livekitConfig.apiKey, livekitConfig.apiSecret);

  const output = {
    protocol: SegmentedFileProtocol.HLS_PROTOCOL,
    playlistName: livekitConfig.hls.playlistName,
    filenamePrefix: livekitConfig.hls.filenamePrefix,
    segmentDuration: livekitConfig.hls.segmentDuration,
  };
  if (livekitConfig.hls.pathPrefix) output.pathPrefix = livekitConfig.hls.pathPrefix;
  if (livekitConfig.hls.directory) output.directory = livekitConfig.hls.directory;

  const opts = {
    layout: livekitConfig.layout || undefined,
    encodingOptions: resolveEncodingPreset(livekitConfig.encodingPreset),
    audioOnly: livekitConfig.audioOnly,
    videoOnly: livekitConfig.videoOnly,
    customBaseUrl: livekitConfig.customBaseUrl || undefined,
  };

  try {
    const info = await client.startRoomCompositeEgress(livekitConfig.roomName, output, opts);
    const playlistUrl = livekitConfig.hls.playbackUrl || info?.hls?.playlistUrl || '';
    const streamUrl = info?.hls?.streamUrl || '';
    return {
      client,
      egressId: info?.egressId || null,
      playlistUrl,
      streamUrl,
    };
  } catch (error) {
    console.error('[dexter-stream] failed to start LiveKit HLS egress', error);
    throw error;
  }
}

async function ensureLivekitIngress(livekitConfig) {
  if (!livekitConfig?.enableHls) return null;
  const required = ['host', 'apiKey', 'apiSecret'];
  const missing = required.filter((key) => !livekitConfig[key]);
  if (missing.length) {
    console.warn('[dexter-stream] skipping LiveKit ingress (missing config keys:', missing.join(', '), ')');
    return null;
  }

  const client = new IngressClient(livekitConfig.host, livekitConfig.apiKey, livekitConfig.apiSecret);
  try {
    const targetIdentity = livekitConfig.ingress?.participantIdentity || 'dextervision-broadcast';
    const list = await client.listIngress({ roomName: livekitConfig.roomName });
    let ingressInfo = list?.find((info) => info?.participantIdentity === targetIdentity);

    const createIngress = async () => {
      const createOpts = {
        name: livekitConfig.ingress?.name || 'DexterVision OBS',
        roomName: livekitConfig.roomName,
        participantIdentity: targetIdentity,
        participantName: livekitConfig.ingress?.participantName || 'DexterVision Broadcast',
      };

      const videoPreset = resolveIngressVideoPreset(livekitConfig.ingress?.videoPreset);
      if (videoPreset !== undefined) {
        createOpts.video = { preset: videoPreset };
      }

      const created = await client.createIngress(IngressInput.RTMP_INPUT, createOpts);
      console.log('[dexter-stream] created LiveKit ingress', created?.ingressId || '');
      return created;
    };

    if (!ingressInfo) {
      ingressInfo = await createIngress();
    } else if (!ingressInfo?.url) {
      console.warn('[dexter-stream] ingress missing push URL, recreating');
      if (ingressInfo.ingressId) {
        try {
          await client.deleteIngress(ingressInfo.ingressId);
        } catch (deleteError) {
          console.error('[dexter-stream] failed to delete stale ingress', deleteError);
        }
      }
      ingressInfo = await createIngress();
    }

    if (!ingressInfo?.url) {
      console.warn('[dexter-stream] ingress is still missing push URL after recreation');
      return { client, ingressInfo: null };
    }

    return { client, ingressInfo };
  } catch (error) {
    console.error('[dexter-stream] failed to prepare LiveKit ingress', error);
    return null;
  }
}

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

  const baseLivekit = baseConfig?.livekit;
  const localLivekit = localConfig?.livekit;
  const baseAudio = baseConfig?.audio;
  const localAudio = localConfig?.audio;
  delete baseConfig.livekit;
  delete localConfig.livekit;
  delete baseConfig.audio;
  delete localConfig.audio;

  const merged = {
    ...DEFAULT_CONFIG,
    ...baseConfig,
    ...localConfig,
  };

  merged.livekit = normalizeLivekitConfig(baseLivekit, localLivekit);
  merged.audio = normalizeAudioConfig(baseAudio, localAudio);

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
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-notifications',
      '--disable-component-update',
      '--disable-background-networking',
      '--disable-session-crashed-bubble',
      '--disable-extensions',
      '--kiosk',
      '--start-fullscreen',
      '--hide-scrollbars',
      `--window-size=${config.width},${config.height}`,
      `--app=${config.overlayUrl}`,
      '--disable-translate',
      '--disable-features=HardwareMediaKeyHandling,TranslateUI,AutomationControlled,MediaRouter',
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
    await page.bringToFront().catch(() => {});
    await page.setViewportSize({ width: config.width, height: config.height });
    if (!page.url() || page.url() === 'about:blank') {
      await page.goto(config.overlayUrl, { waitUntil: 'networkidle' });
    } else {
      await page.waitForLoadState('networkidle');
    }
    await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      if (html) {
        html.style.backgroundColor = '#000';
      }
      if (body) {
        body.style.backgroundColor = '#000';
        body.style.zoom = '1';
        body.style.margin = '0';
      }
      if (document.documentElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }).catch((error) => {
      console.warn('[dexter-stream] failed to apply overlay zoom', error);
    });
    await page.keyboard.press('F11').catch(() => {});
    console.log('[dexter-stream] overlay page loaded');
  } else {
    console.warn('[dexter-stream] unable to access page handle; continuing');
  }

  console.log('[dexter-stream] starting ffmpeg pipeline');
  const audioInput = await resolveAudioInput(config.audio, cleanupTasks);
  console.log(`[dexter-stream] audio source → ${audioInput.description}`);
  const ffmpegArgs = [
    '-hide_banner',
    '-loglevel', 'info',
    '-nostats',
    '-f', 'x11grab',
    '-video_size', `${config.width}x${config.height}`,
    '-framerate', String(config.fps),
    '-i', display,
    ...audioInput.args,
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
  ];

  const videoFilterChain =
    typeof config.videoFilter === 'string' && config.videoFilter.trim().length
      ? config.videoFilter.trim()
      : 'crop=in_w:in_h-240:0:200,scale=1920:1080';

  ffmpegArgs.push('-vf', videoFilterChain);
  ffmpegArgs.push('-map', '0:v:0', '-map', '1:a:0');

  const livekitIngress = await ensureLivekitIngress(config.livekit);

  const teeOutputs = [];
  const safeOutputs = [];

  const maskUrl = (rawUrl) => rawUrl.replace(/\/(?!.*\/).*/, '/•••');

  if (config.rtmpUrl) {
    teeOutputs.push(`[f=flv:onfail=ignore]${config.rtmpUrl}`);
    safeOutputs.push(`${maskUrl(config.rtmpUrl)} (pump)`);
  }

  if (livekitIngress?.ingressInfo?.url) {
    const ingestUrl = livekitIngress.ingressInfo.url;
    const streamKey = livekitIngress.ingressInfo.streamKey || '';
    const fullIngestUrl = streamKey ? safeJoinUrl(ingestUrl, streamKey) : ingestUrl;
    teeOutputs.push(`[f=flv:onfail=ignore]${fullIngestUrl}`);
    safeOutputs.push(`${maskUrl(fullIngestUrl)} (livekit)`);
  }

  if (!teeOutputs.length) {
    throw new Error('No streaming destinations configured');
  }

  if (teeOutputs.length === 1) {
    const single = teeOutputs[0].replace(/^\[[^\]]+\]/, '');
    ffmpegArgs.push('-f', 'flv', single);
  } else {
    ffmpegArgs.push('-f', 'tee', teeOutputs.join('|'));
  }

  const ffmpeg = spawnProcess('ffmpeg', ffmpegArgs, {
    env: { ...process.env },
  });
  ffmpeg.on('exit', (code, signal) => handleFatalExit('ffmpeg', code, signal));

  cleanupTasks.push(async () => {
    try {
      ffmpeg.kill('SIGTERM');
    } catch {}
  });

  let hlsHandle = null;
  const requestHlsEgress = async (attempt = 0) => {
    const scheduleRetry = (reason) => {
      const delay = Math.min(15000, 2000 * (attempt + 1));
      console.warn('[dexter-stream] HLS egress retry', reason, `retrying in ${delay}ms`);
      setTimeout(() => requestHlsEgress(attempt + 1), delay).unref?.();
    };

    try {
      hlsHandle = await startLivekitHlsEgress(config.livekit);
      if (hlsHandle?.egressId && hlsHandle.client) {
        cleanupTasks.push(async () => {
          try {
            await hlsHandle.client.stopEgress(hlsHandle.egressId);
          } catch (error) {
            console.error('[dexter-stream] failed to stop HLS egress', error);
          }
        });
      }
      if (hlsHandle?.playlistUrl) {
        console.log(`[dexter-stream] 🎯 HLS playlist → ${hlsHandle.playlistUrl}`);
      } else if (config.livekit?.enableHls) {
        console.log('[dexter-stream] 🎯 HLS egress requested (playlist URL pending)');
        scheduleRetry('playlist pending');
      }
    } catch (error) {
      if (config.livekit?.enableHls) {
        scheduleRetry(error?.message || error);
      }
    }
  };

  if (config.livekit?.enableHls) {
    setTimeout(() => requestHlsEgress(0), 5000).unref?.();
  }

  const safeRtmp = (() => {
    if (safeOutputs.length) return safeOutputs.join(', ');
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
