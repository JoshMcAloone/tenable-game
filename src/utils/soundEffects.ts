// Simple sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (e) {
        // Web Audio API not supported
      }
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Sound for each row being highlighted with progressive pitch increase
  async playRowHighlight(step: number = 0, totalSteps: number = 10) {
    // Calculate ascending pitch progression - starts at 600Hz, rises to 1200Hz
    const baseFrequency = 600;
    const maxFrequency = 1200;
    
    // Ensure we have valid step progression (0 to totalSteps-1)
    const normalizedStep = Math.max(0, Math.min(step, totalSteps - 1));
    const progressRatio = normalizedStep / Math.max(1, totalSteps - 1);
    
    // Linear progression for clearer ascending effect
    const frequencyRange = maxFrequency - baseFrequency;
    const currentFreq = baseFrequency + (progressRatio * frequencyRange);
    
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Create a more complex sound with harmonics that also rise in pitch
    const frequencies = [currentFreq, currentFreq * 1.5]; // Root note and fifth
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      oscillator.type = index === 0 ? 'square' : 'sine';

      // Slightly increase volume as pitch gets higher for more tension
      const baseVolume = index === 0 ? 0.15 : 0.08;
      const volumeMultiplier = 1 + (progressRatio * 0.3); // Up to 30% louder at the end
      const volume = baseVolume * volumeMultiplier;
      
      gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.25);

      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + 0.25);
    });
  }

  // Sound for successful answer
  async playSuccess() {
    // Epic success fanfare
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Triumphant chord progression: C-E-G-C (octave)
    const sequences = [
      { freq: 523, delay: 0, duration: 0.4 },     // C5
      { freq: 659, delay: 0.1, duration: 0.4 },   // E5
      { freq: 784, delay: 0.2, duration: 0.4 },   // G5
      { freq: 1047, delay: 0.3, duration: 0.6 },  // C6
    ];

    sequences.forEach(({ freq, delay, duration }) => {
      setTimeout(() => {
        // Create a richer sound with multiple oscillators
        [0, 1].forEach((harmonicIndex) => {
          const oscillator = this.audioContext!.createOscillator();
          const gainNode = this.audioContext!.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext!.destination);

          const harmonicFreq = harmonicIndex === 0 ? freq : freq * 1.5;
          oscillator.frequency.setValueAtTime(harmonicFreq, this.audioContext!.currentTime);
          oscillator.type = harmonicIndex === 0 ? 'sine' : 'triangle';

          const volume = harmonicIndex === 0 ? 0.2 : 0.1;
          gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

          oscillator.start(this.audioContext!.currentTime);
          oscillator.stop(this.audioContext!.currentTime + duration);
        });
      }, delay * 1000);
    });
  }

  // Sound for failure
  async playFailure() {
    // Dramatic failure sound - like a game show buzzer
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Create a harsh, dramatic buzzer sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Low, harsh buzzer frequency
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.8);
    oscillator.type = 'sawtooth';

    // Add a low-pass filter for a more muffled, dramatic effect
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.Q.setValueAtTime(8, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);

    // Add a secondary "thud" sound for extra drama
    setTimeout(() => {
      const thudOsc = this.audioContext!.createOscillator();
      const thudGain = this.audioContext!.createGain();

      thudOsc.connect(thudGain);
      thudGain.connect(this.audioContext!.destination);

      thudOsc.frequency.setValueAtTime(80, this.audioContext!.currentTime);
      thudOsc.type = 'triangle';

      thudGain.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.3);

      thudOsc.start(this.audioContext!.currentTime);
      thudOsc.stop(this.audioContext!.currentTime + 0.3);
    }, 200);
  }

  // Grand fanfare for completing the entire pyramid
  async playPyramidComplete() {
    // Epic orchestral-style completion fanfare
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Grand fanfare: Extended chord progression with multiple layers
    const fanfareSequence = [
      // Opening triumphant blast
      { freq: 523, delay: 0, duration: 1.0, volume: 0.3 },     // C5
      { freq: 659, delay: 0.1, duration: 1.0, volume: 0.25 },  // E5
      { freq: 784, delay: 0.2, duration: 1.0, volume: 0.2 },   // G5
      { freq: 1047, delay: 0.3, duration: 1.2, volume: 0.35 }, // C6 (emphasis)
      
      // Rising sequence for excitement
      { freq: 1175, delay: 1.2, duration: 0.4, volume: 0.2 },  // D6
      { freq: 1319, delay: 1.4, duration: 0.4, volume: 0.25 }, // E6
      { freq: 1568, delay: 1.6, duration: 0.6, volume: 0.3 },  // G6
      
      // Final triumphant resolution
      { freq: 2093, delay: 2.0, duration: 1.5, volume: 0.4 },  // C7 (octave higher)
    ];

    fanfareSequence.forEach(({ freq, delay, duration, volume }) => {
      setTimeout(() => {
        // Create rich orchestral sound with multiple harmonics
        [0, 1, 2].forEach((harmonicIndex) => {
          const oscillator = this.audioContext!.createOscillator();
          const gainNode = this.audioContext!.createGain();
          const filter = this.audioContext!.createBiquadFilter();

          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(this.audioContext!.destination);

          // Create harmonic series for richer sound
          const harmonicFreq = freq * (harmonicIndex === 0 ? 1 : harmonicIndex === 1 ? 1.5 : 2);
          oscillator.frequency.setValueAtTime(harmonicFreq, this.audioContext!.currentTime);
          oscillator.type = harmonicIndex === 0 ? 'sine' : harmonicIndex === 1 ? 'triangle' : 'sine';

          // Add slight filtering for warmth
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(harmonicFreq * 3, this.audioContext!.currentTime);
          filter.Q.setValueAtTime(1, this.audioContext!.currentTime);

          // Volume decreases for higher harmonics
          const harmonicVolume = volume * (harmonicIndex === 0 ? 1 : harmonicIndex === 1 ? 0.6 : 0.3);
          gainNode.gain.setValueAtTime(harmonicVolume, this.audioContext!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

          oscillator.start(this.audioContext!.currentTime);
          oscillator.stop(this.audioContext!.currentTime + duration);
        });
      }, delay * 1000);
    });

    // Add celebratory bell-like chimes
    const chimeDelays = [2.5, 2.7, 2.9, 3.1, 3.3];
    chimeDelays.forEach((delay, index) => {
      setTimeout(() => {
        const chimeOsc = this.audioContext!.createOscillator();
        const chimeGain = this.audioContext!.createGain();
        
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.audioContext!.destination);

        // Ascending bell tones
        const chimeFreq = 1047 * Math.pow(1.2, index); // Rising bells
        chimeOsc.frequency.setValueAtTime(chimeFreq, this.audioContext!.currentTime);
        chimeOsc.type = 'sine';

        chimeGain.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.8);

        chimeOsc.start(this.audioContext!.currentTime);
        chimeOsc.stop(this.audioContext!.currentTime + 0.8);
      }, delay * 1000);
    });
  }
}

export const soundEffects = new SoundEffects();