// Lightweight Web Audio helper — synthesises a subtle server-room hum and
// UI blip sounds on demand. No external audio files required. Muted by default.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let humNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let humRunning = false;
let enabled = false;

const STORE_KEY = "vm-sound";

const ensureContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.0;
    masterGain.connect(ctx.destination);
  }
  return ctx;
};

const startHum = () => {
  const c = ensureContext();
  if (!c || !masterGain || humRunning) return;
  humRunning = true;
  // Two detuned low oscillators + a faint high whine = "server room".
  const specs: { freq: number; type: OscillatorType; gain: number }[] = [
    { freq: 60, type: "sine", gain: 0.05 },
    { freq: 120, type: "sine", gain: 0.025 },
    { freq: 7200, type: "triangle", gain: 0.0016 },
  ];
  humNodes = specs.map((s) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = s.type;
    osc.frequency.value = s.freq;
    gain.gain.value = s.gain;
    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start();
    return { osc, gain };
  });
};

const stopHum = () => {
  humNodes.forEach(({ osc, gain }) => {
    try {
      gain.disconnect();
      osc.stop();
      osc.disconnect();
    } catch {
      /* noop */
    }
  });
  humNodes = [];
  humRunning = false;
};

export const isSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORE_KEY) === "on";
};

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
  const c = ensureContext();
  if (!c || !masterGain) return;
  if (c.state === "suspended") c.resume();
  if (on) {
    startHum();
    masterGain.gain.cancelScheduledValues(c.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, c.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.5, c.currentTime + 0.6);
    sessionStorage.setItem(STORE_KEY, "on");
  } else {
    masterGain.gain.cancelScheduledValues(c.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, c.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.4);
    sessionStorage.setItem(STORE_KEY, "off");
    window.setTimeout(() => {
      if (!enabled) stopHum();
    }, 500);
  }
};

// A short UI blip — used for clicks / hovers when sound is on.
export const playBlip = (
  freq = 660,
  duration = 0.06,
  volume = 0.12,
  type: OscillatorType = "square"
) => {
  if (!enabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  if (c.state === "suspended") c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
};

// Mechanical "click" (keyboard/power-switch feel).
export const playClick = () => {
  playBlip(2200, 0.03, 0.06, "square");
  window.setTimeout(() => playBlip(1400, 0.04, 0.05, "square"), 24);
};
