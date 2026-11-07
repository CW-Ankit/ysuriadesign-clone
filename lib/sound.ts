"use client";

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbWet: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private musicSource: MediaElementAudioSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private playlist: string[] = [
    "/media/audio/disrespectful.mp3",
    "/media/audio/come-n-go.mp3",
  ];
  private currentTrack: number = 0;
  private isEnabled: boolean = false;
  private lastSfxTime: Record<string, number> = {};

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ot-sound");
      this.isEnabled = stored === "on";

      window.addEventListener("sfx" as any, (e: CustomEvent<string>) => {
        if (e.detail) {
          this.playSfx(e.detail as any);
        }
      });
    }
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output stage: Master Gain -> Lowpass (20kHz) -> Compressor -> Destination
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isEnabled ? 0.9 : 0;

      const masterFilter = this.ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.value = 20000;
      masterFilter.Q.value = 0.3;

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 24;
      comp.ratio.value = 3;
      comp.attack.value = 0.05;
      comp.release.value = 0.4;

      this.masterGain.connect(masterFilter).connect(comp).connect(this.ctx.destination);

      // Algorithmic Impulse Reverb Convolver
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createImpulse(this.ctx, 4.2, 2.6);

      this.reverbWet = this.ctx.createGain();
      this.reverbWet.gain.value = 0.55;
      this.convolver.connect(this.reverbWet).connect(this.masterGain);

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.value = 0.7;
      this.dryGain.connect(this.masterGain);

      // SFX Bus (Sends to both dry gain and convolver)
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 1.0;
      this.sfxBus.connect(this.dryGain);
      this.sfxBus.connect(this.convolver);

      // Background Music Setup with Dynamic Filter and Ducking
      this.audioEl = new Audio(this.playlist[this.currentTrack]);
      this.audioEl.loop = false;
      this.audioEl.crossOrigin = "anonymous";

      try {
        this.musicSource = this.ctx.createMediaElementSource(this.audioEl);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.85;

        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = "lowpass";
        this.musicFilter.frequency.value = 16000;
        this.musicFilter.Q.value = 0.5;

        this.musicSource.connect(this.musicFilter).connect(this.musicGain).connect(this.masterGain);
      } catch {
        // Fallback if media element source fails
      }

      this.audioEl.addEventListener("ended", () => {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        if (this.audioEl) {
          this.audioEl.src = this.playlist[this.currentTrack];
          if (this.isEnabled) this.audioEl.play().catch(() => {});
        }
      });

      if (this.isEnabled) {
        this.audioEl.play().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
  }

  private createImpulse(ctx: AudioContext, duration: number, decay: number) {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const d = Math.pow(1 - i / length, decay);
      left[i] = (Math.random() * 2 - 1) * d;
      right[i] = (Math.random() * 2 - 1) * d;
    }
    return impulse;
  }

  public setModalDucking(isModalOpen: boolean) {
    if (!this.ctx || !this.musicFilter || !this.musicGain) return;
    const t = this.ctx.currentTime;
    if (isModalOpen) {
      this.musicFilter.frequency.setTargetAtTime(420, t, 0.4);
      this.musicGain.gain.setTargetAtTime(0.25, t, 0.4);
    } else {
      this.musicFilter.frequency.setTargetAtTime(16000, t, 0.6);
      this.musicGain.gain.setTargetAtTime(0.85, t, 0.6);
    }
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem("ot-sound", this.isEnabled ? "on" : "off");

    if (this.isEnabled) {
      this.enable();
    } else {
      this.disable();
    }
    return this.isEnabled;
  }

  public enable() {
    this.isEnabled = true;
    localStorage.setItem("ot-sound", "on");
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.9, this.ctx.currentTime, 1.2);
    }
    if (this.audioEl) {
      this.audioEl.play().catch(() => {});
    }
  }

  public disable() {
    this.isEnabled = false;
    localStorage.setItem("ot-sound", "off");
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
    setTimeout(() => {
      if (!this.isEnabled && this.audioEl) {
        this.audioEl.pause();
      }
    }, 600);
  }

  public get enabled(): boolean {
    return this.isEnabled;
  }

  public playSfx(type: "hover" | "click" | "open" | "close" | "card" | "door" | "title" | "tag") {
    if (!this.isEnabled || !this.ctx || this.ctx.state === "suspended") return;
    const now = performance.now();
    if (now - (this.lastSfxTime[type] || 0) < 50) return;
    this.lastSfxTime[type] = now;

    try {
      const t = this.ctx.currentTime;
      const bus = this.sfxBus || this.masterGain || this.ctx.destination;

      switch (type) {
        // Delicate 2100Hz high-frequency acoustic ping
        case "hover": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(2100, t);
          gain.gain.setValueAtTime(0.012, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
          osc.connect(gain).connect(bus);
          osc.start(t);
          osc.stop(t + 0.05);
          break;
        }

        // Falling 900 -> 600Hz click
        case "click": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(900, t);
          osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
          osc.connect(gain).connect(bus);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }

        // Dual layer work card label ping: 1320Hz triangle
        case "card": {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1320, t);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
          osc.connect(gain).connect(bus);
          osc.start(t);
          osc.stop(t + 0.09);
          break;
        }

        // Dual layer modal open: 420->840Hz sine sweep + noise whoosh
        case "open": {
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(420, t);
          osc.frequency.exponentialRampToValueAtTime(840, t + 0.35);
          oscGain.gain.setValueAtTime(0.07, t);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
          osc.connect(oscGain).connect(bus);
          osc.start(t);
          osc.stop(t + 0.35);

          // Bandpass noise whoosh
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(500, t);
          filter.frequency.linearRampToValueAtTime(3000, t + 0.12);
          filter.frequency.exponentialRampToValueAtTime(900, t + 0.35);
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.02, t);
          noiseGain.gain.linearRampToValueAtTime(0.06, t + 0.12);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
          whiteNoise.connect(filter).connect(noiseGain).connect(bus);
          whiteNoise.start(t);
          break;
        }

        // Dual layer modal close: 760->380Hz sweep + reverse noise sweep
        case "close": {
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(760, t);
          osc.frequency.exponentialRampToValueAtTime(380, t + 0.3);
          oscGain.gain.setValueAtTime(0.05, t);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
          osc.connect(oscGain).connect(bus);
          osc.start(t);
          osc.stop(t + 0.3);
          break;
        }

        // Door portal transition: deep sub boom 55->30Hz + heavy displacement
        case "door": {
          const sub = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          sub.type = "sine";
          sub.frequency.setValueAtTime(55, t);
          sub.frequency.exponentialRampToValueAtTime(30, t + 1.6);
          subGain.gain.setValueAtTime(0.3, t);
          subGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
          sub.connect(subGain).connect(bus);
          sub.start(t);
          sub.stop(t + 1.6);
          break;
        }

        // Chapter title musical chime: C5 (523.3Hz) + delayed G5 (784Hz)
        case "title": {
          const c5 = this.ctx.createOscillator();
          const c5Gain = this.ctx.createGain();
          c5.type = "sine";
          c5.frequency.setValueAtTime(523.25, t);
          c5Gain.gain.setValueAtTime(0.025, t);
          c5Gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
          c5.connect(c5Gain).connect(bus);
          c5.start(t);
          c5.stop(t + 1.1);

          const g5 = this.ctx.createOscillator();
          const g5Gain = this.ctx.createGain();
          g5.type = "sine";
          g5.frequency.setValueAtTime(783.99, t + 0.09);
          g5Gain.gain.setValueAtTime(0.0001, t);
          g5Gain.gain.setValueAtTime(0.018, t + 0.09);
          g5Gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
          g5.connect(g5Gain).connect(bus);
          g5.start(t + 0.09);
          g5.stop(t + 1.3);
          break;
        }

        // Pentatonic tag arpeggio
        case "tag": {
          const freqs = [880, 988, 1175, 1319, 1568];
          const pick = freqs[Math.floor(Math.random() * freqs.length)];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(pick, t);
          gain.gain.setValueAtTime(0.02, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
          osc.connect(gain).connect(bus);
          osc.start(t);
          osc.stop(t + 0.4);
          break;
        }
      }
    } catch {
      // Audio node failure
    }
  }
}

export const sound = new SoundManager();
