/**
 * Web Audio API procedural sound engine for THE COURT.
 * Generates realistic acoustic and physical desk sounds with zero external asset dependencies.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxOn: boolean = true;
  private musicOn: boolean = true;
  private ambientGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted || !this.musicOn ? 0 : 0.04, this.ctx.currentTime);
    }
  }

  public setSfx(on: boolean) {
    this.sfxOn = on;
  }

  public setMusic(on: boolean) {
    this.musicOn = on;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted || !on ? 0 : 0.04, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sound of wooden gavel striking a heavy sounding block
   */
  public playGavel() {
    if (this.isMuted || !this.sfxOn) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Initial sharp wooden impact transient
    const oscTransient = this.ctx.createOscillator();
    const gainTransient = this.ctx.createGain();
    oscTransient.type = 'triangle';
    oscTransient.frequency.setValueAtTime(480, t);
    oscTransient.frequency.exponentialRampToValueAtTime(80, t + 0.05);

    gainTransient.gain.setValueAtTime(0.7, t);
    gainTransient.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    oscTransient.connect(gainTransient);
    gainTransient.connect(this.ctx.destination);
    oscTransient.start(t);
    oscTransient.stop(t + 0.08);

    // 2. Heavy desk/sounding block resonance (low warm wood body)
    const oscWood = this.ctx.createOscillator();
    const gainWood = this.ctx.createGain();
    oscWood.type = 'sine';
    oscWood.frequency.setValueAtTime(140, t);
    oscWood.frequency.exponentialRampToValueAtTime(55, t + 0.35);

    gainWood.gain.setValueAtTime(0.65, t);
    gainWood.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    oscWood.connect(gainWood);
    gainWood.connect(this.ctx.destination);
    oscWood.start(t);
    oscWood.stop(t + 0.4);

    // 3. Crisp click noise of hardwood meeting hardwood
    const bufferSize = this.ctx.sampleRate * 0.04;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1600, t);
    noiseFilter.Q.setValueAtTime(2.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseNode.start(t);
  }

  /**
   * Sound of lamp switch click
   */
  public playLampSwitch(turnOn: boolean) {
    if (this.isMuted || !this.sfxOn) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(turnOn ? 880 : 660, t);
    osc.frequency.setValueAtTime(turnOn ? 1320 : 440, t + 0.015);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Paper / File rustle sound
   */
  public playPaperRustle() {
    if (this.isMuted || !this.sfxOn) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.18;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.linearRampToValueAtTime(1100, t + dur);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  /**
   * Microphone toggle chime / feedback click
   */
  public playMicClick() {
    if (this.isMuted || !this.sfxOn) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Subtle ambient courtroom room tone
   */
  public startAmbience() {
    if (this.ambientGain) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Soft brownian filtered background air
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted || !this.musicOn ? 0 : 0.035, t);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    noise.start(t);
  }
}

export const audioManager = new SoundEngine();

