import { spawn } from 'node:child_process';
import { readFile, rm, access, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';
import FFT from 'fft.js';
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
      analysis: null,
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
      analysis: null,
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

  const inputArgs = ['-stream_loop', '-1', '-f', 'concat', '-safe', '0', '-i', playlistPath];

  return {
    args: inputArgs,
    description: `playlist (${tracks.length} tracks)`,
    analysis: {
      command: 'ffmpeg',
      args: [
        '-hide_banner',
        '-loglevel', 'error',
        '-re',
        ...inputArgs,
        '-vn',
        '-ac', '1',
        '-ar', '44100',
        '-af', 'aformat=sample_rates=44100:channel_layouts=mono',
        '-f', 'f32le',
        'pipe:1',
      ],
      sampleRate: 44100,
      fftSize: 1024,
      barCount: 48,
    },
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

const AUDIO_DEFAULTS = {
  bars: 48,
  fftSize: 1024,
  sampleRate: 44100,
};

function createLogBands(sampleRate, fftSize, barCount) {
  const nyquist = sampleRate / 2;
  const minFreq = 30;
  const maxFreq = Math.min(16000, nyquist);
  const minLog = Math.log10(minFreq);
  const maxLog = Math.log10(maxFreq);
  const resolution = sampleRate / fftSize;

  const bands = [];
  for (let index = 0; index < barCount; index += 1) {
    const startFreq = 10 ** (minLog + ((maxLog - minLog) * index) / barCount);
    const endFreq = 10 ** (minLog + ((maxLog - minLog) * (index + 1)) / barCount);
    let startBin = Math.max(1, Math.floor(startFreq / resolution));
    let endBin = Math.max(startBin + 1, Math.ceil(endFreq / resolution));
    if (endBin > fftSize / 2) {
      endBin = Math.floor(fftSize / 2);
    }
    if (index === barCount - 1) {
      endBin = Math.floor(fftSize / 2);
    }
    bands.push({ start: startBin, end: endBin });
  }

  return bands;
}

function createBandWeights(logBands, sampleRate, fftSize) {
  const nyquist = sampleRate / 2;
  const minWeight = 0.25;
  const maxWeight = 3.0;
  const logMin = Math.log10(80);
  const logMax = Math.log10(Math.max(8000, nyquist));

  return logBands.map(({ start, end }) => {
    const centerBin = (start + end) / 2;
    const centerFreq = (centerBin * sampleRate) / fftSize;
    const clampedFreq = Math.max(80, Math.min(centerFreq, nyquist));
    const normalized = Math.max(0, Math.min(1, (Math.log10(clampedFreq) - logMin) / (logMax - logMin)));
    const tilt = Math.pow(normalized, 1.05);
    return Math.min(maxWeight, minWeight + tilt * (maxWeight - minWeight));
  });
}

function barIndexToRatio(index, total) {
  if (total <= 1) return 0;
  return Math.max(0, Math.min(1, index / (total - 1)));
}

function startAudioReactive(page, analysisConfig, cleanupTasks = []) {
  if (!page) return;

  const barCount = analysisConfig?.barCount ?? AUDIO_DEFAULTS.bars;
  const fftSize = analysisConfig?.fftSize ?? AUDIO_DEFAULTS.fftSize;
  const sampleRate = analysisConfig?.sampleRate ?? AUDIO_DEFAULTS.sampleRate;

  const dispatchIntervalMs = 50;
  const fallbackBars = Array.from({ length: barCount }, () => 0);
  let active = true;

  const dispatchPayload = (payload) => {
    if (!page) return;
    if (typeof page.isClosed === 'function' && page.isClosed()) return;
    page.evaluate((data) => {
      window.dispatchEvent(new CustomEvent('dexter:audio-reactive', { detail: data }));
    }, payload).catch(() => {});
  };

  if (!analysisConfig) {
    const timer = setInterval(() => {
      dispatchPayload({
        bars: fallbackBars,
        level: 0,
        timestamp: Date.now(),
        stale: true,
      });
    }, 200);
    cleanupTasks.push(async () => clearInterval(timer));
    return;
  }

  const fft = new FFT(fftSize);
  const frameBytes = fftSize * Float32Array.BYTES_PER_ELEMENT;
  const windowShape = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i += 1) {
    windowShape[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const fftInput = new Float32Array(fftSize);
  const fftOut = fft.createComplexArray();
  const magnitudes = new Float32Array(fftSize / 2);
  const logBands = createLogBands(sampleRate, fftSize, barCount);
  const bandWeights = createBandWeights(logBands, sampleRate, fftSize);
  const smoothedBars = new Float32Array(barCount);
  let smoothedLevel = 0;
  let lastFrameAt = 0;
  let analyser = null;
  let buffer = Buffer.alloc(0);

  const handleChunk = (chunk) => {
    buffer = buffer.length ? Buffer.concat([buffer, chunk]) : chunk;
    while (buffer.length >= frameBytes) {
      const frame = buffer.subarray(0, frameBytes);
      buffer = buffer.slice(frameBytes);

      const samples = new Float32Array(frame.buffer, frame.byteOffset, fftSize);
      let sumSquares = 0;
      for (let i = 0; i < fftSize; i += 1) {
        const sample = samples[i];
        sumSquares += sample * sample;
        fftInput[i] = sample * windowShape[i];
      }

      fft.realTransform(fftOut, fftInput);
      const normFactor = 1 / (fftSize / 2);
      for (let bin = 0; bin < magnitudes.length; bin += 1) {
        const real = fftOut[2 * bin];
        const imag = fftOut[2 * bin + 1];
        const magnitude = Math.sqrt(real * real + imag * imag) * normFactor;
        magnitudes[bin] = magnitude;
      }

      for (let bandIndex = 0; bandIndex < barCount; bandIndex += 1) {
        const { start, end } = logBands[bandIndex];
        let sum = 0;
        for (let bin = start; bin < end; bin += 1) {
          sum += magnitudes[bin] || 0;
        }
        const width = Math.max(1, end - start);
        const average = sum / width;
        const position = barIndexToRatio(bandIndex, barCount);
        const balance = 0.42 + position * 1.45;
        const weighted = average * (bandWeights[bandIndex] ?? 1) * balance * 9.5;
        const exponent = 0.58 + position * 0.26;
        const shaped = Math.pow(Math.min(1, weighted), exponent);
        const release = smoothedBars[bandIndex] > shaped ? 0.22 : 0.62;
        smoothedBars[bandIndex] = smoothedBars[bandIndex] * (1 - release) + shaped * release;
      }

      const rms = Math.sqrt(sumSquares / fftSize);
      const instantLevel = Math.min(1, Math.pow(rms * 5.2, 0.95));
      const levelRelease = smoothedLevel > instantLevel ? 0.18 : 0.58;
      smoothedLevel = smoothedLevel * (1 - levelRelease) + instantLevel * levelRelease;
      lastFrameAt = Date.now();
    }
  };

  const launchAnalyser = (attempt = 0) => {
    if (!active) return;
    buffer = Buffer.alloc(0);
    try {
      analyser = spawn(analysisConfig.command, analysisConfig.args, {
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch (error) {
      console.error('[dexter-stream] audio analyzer spawn error', error);
      const delay = Math.min(2000, 250 * (attempt + 1));
      setTimeout(() => launchAnalyser(attempt + 1), delay).unref?.();
      return;
    }

    analyser.stdout.on('data', handleChunk);

    analyser.on('error', (error) => {
      console.error('[dexter-stream] audio analyzer error', error);
    });

    analyser.on('exit', (code, signal) => {
      if (!active) return;
      console.warn(`[dexter-stream] audio analyzer exited (code=${code} signal=${signal})`);
      buffer = Buffer.alloc(0);
      lastFrameAt = 0;
      for (let i = 0; i < barCount; i += 1) {
        smoothedBars[i] *= 0.4;
      }
      smoothedLevel *= 0.5;
      const decay = Math.min(2000, 250 * (attempt + 1));
      setTimeout(() => launchAnalyser(code === 0 ? 0 : attempt + 1), decay).unref?.();
    });
  };

  launchAnalyser(0);

  const sendInterval = setInterval(() => {
    const nowTs = Date.now();
    const delta = nowTs - lastFrameAt;

    if (delta > dispatchIntervalMs * 1.5) {
      const decay = delta > 700 ? 0.45 : 0.75;
      for (let i = 0; i < barCount; i += 1) {
        smoothedBars[i] *= decay;
      }
      smoothedLevel *= decay;
    }

    const payload = {
      bars: Array.from(smoothedBars, (value) => Number(Math.max(0, Math.min(1, value)).toFixed(4))),
      level: Number(Math.max(0, Math.min(1, smoothedLevel)).toFixed(4)),
      timestamp: nowTs,
      stale: delta > 600,
    };
    dispatchPayload(payload);
  }, dispatchIntervalMs);

  cleanupTasks.push(async () => clearInterval(sendInterval));
  cleanupTasks.push(async () => {
    active = false;
    try {
      analyser?.kill('SIGTERM');
    } catch {}
  });
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
      '--disable-desktop-notifications',
      '--cursor-blink-interval=0',
      '--noerrdialogs',
      '--overscroll-history-navigation=0',
      '--window-position=0,0',
      '--disable-popup-blocking',
      '--kiosk',
      '--start-fullscreen',
      '--hide-scrollbars',
      `--window-size=${config.width},${config.height}`,
      `--app=${config.overlayUrl}`,
      '--disable-translate',
      '--disable-features=BlockInsecurePrivateNetworkRequests,HardwareMediaKeyHandling,TranslateUI,AutomationControlled,MediaRouter',
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
        html.style.cursor = 'none';
      }
      if (body) {
        body.style.backgroundColor = '#000';
        body.style.zoom = '1';
        body.style.margin = '0';
        body.style.cursor = 'none';
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
  try {
    startAudioReactive(page, audioInput.analysis, cleanupTasks);
    console.log('[dexter-stream] audio-reactive analyzer ready');
  } catch (error) {
    console.warn('[dexter-stream] failed to initialise audio-reactive analyzer', error);
  }
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
