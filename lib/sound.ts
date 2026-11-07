"use client";

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
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
    }
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isEnabled ? 0.9 : 0;

      // Filter & Compressor
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 20000;
      filter.Q.value = 0.3;

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 24;
      comp.ratio.value = 3;
      comp.attack.value = 0.05;
      comp.release.value = 0.4;

      this.masterGain.connect(filter).connect(comp).connect(this.ctx.destination);

      // Algorithmic convolver reverb
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createImpulse(this.ctx, 3.5, 2.2);

      // Audio element
      this.audioEl = new Audio(this.playlist[this.currentTrack]);
      this.audioEl.loop = false;
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

  public playSfx(type: "hover" | "click" | "open" | "card" | "door") {
    if (!this.isEnabled || !this.ctx || this.ctx.state === "suspended") return;
    const now = performance.now();
    if (now - (this.lastSfxTime[type] || 0) < 60) return;
    this.lastSfxTime[type] = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.masterGain || this.ctx.destination);

      const t = this.ctx.currentTime;
      switch (type) {
        case "hover":
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.start(t);
          osc.stop(t + 0.08);
          break;

        case "click":
          osc.type = "triangle";
          osc.frequency.setValueAtTime(950, t);
          osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.start(t);
          osc.stop(t + 0.12);
          break;

        case "card":
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(440, t + 0.2);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
          break;

        case "open":
          osc.type = "sine";
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.exponentialRampToValueAtTime(1040, t + 0.35);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
          break;

        case "door":
          osc.type = "sine";
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
      }
    } catch {
      // Audio node error
    }
  }
}

export const sound = new SoundManager();
