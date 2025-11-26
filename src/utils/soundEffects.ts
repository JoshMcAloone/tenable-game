// Simple sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private isPreloaded: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    // Initialize audio context on first interaction
    this.initAudioContext();
    // Preload audio context on user interaction
    this.preloadOnInteraction();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (e) {
        console.warn('Web Audio API not supported, sound effects disabled');
        this.isEnabled = false;
      }
    } else {
      this.isEnabled = false;
    }
  }



  private preloadOnInteraction() {
    const preload = () => {
      if (!this.isPreloaded && this.audioContext) {
        this.ensureAudioContext().catch(() => {
          this.isEnabled = false;
        });
        this.isPreloaded = true;
        // Remove listeners after first interaction
        document.removeEventListener('click', preload);
        document.removeEventListener('keydown', preload);
        document.removeEventListener('touchstart', preload);
      }
    };
    
    // Listen for first user interaction to preload audio
    document.addEventListener('click', preload, { once: true });
    document.addEventListener('keydown', preload, { once: true });
    document.addEventListener('touchstart', preload, { once: true });
  }

  private async ensureAudioContext() {
    if (!this.isEnabled || !this.audioContext) return false;
    
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return this.audioContext.state === 'running';
    } catch (e) {
      console.warn('Failed to resume audio context:', e);
      this.isEnabled = false;
      return false;
    }
  }

  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Create exponential decay with random noise
        const t = i / length;
        const envelope = Math.pow(1 - t, decay * 3);
        channelData[i] = (Math.random() * 2 - 1) * envelope * 0.3;
      }
    }
    
    return impulse;
  }

  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.isEnabled) return;
    
    const contextReady = await this.ensureAudioContext();
    if (!contextReady || !this.audioContext) return;

    try {
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
      
      // Clean up oscillator after it's done
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        gainNode.disconnect();
      });
    } catch (e) {
      console.warn('Failed to play tone:', e);
      // Disable sound effects if they're causing issues
      this.isEnabled = false;
    }
  }

  // Sound for each row being highlighted with progressive pitch increase
  async playRowHighlight(step: number = 0, totalSteps: number = 10) {
    if (!this.isEnabled) return;
    
    // Calculate ascending pitch progression - starts at 600Hz, rises to 1200Hz
    const baseFrequency = 600;
    const maxFrequency = 1200;
    
    // Ensure we have valid step progression (0 to totalSteps-1)
    const normalizedStep = Math.max(0, Math.min(step, totalSteps - 1));
    const progressRatio = normalizedStep / Math.max(1, totalSteps - 1);
    
    // Linear progression for clearer ascending effect
    const frequencyRange = maxFrequency - baseFrequency;
    const currentFreq = baseFrequency + (progressRatio * frequencyRange);
    
    const contextReady = await this.ensureAudioContext();
    if (!contextReady || !this.audioContext) return;

    try {
      // Create a more complex sound with harmonics that also rise in pitch
      const frequencies = [currentFreq, currentFreq * 1.5]; // Root note and fifth
      const oscillators: OscillatorNode[] = [];
      const gainNodes: GainNode[] = [];
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillators.push(oscillator);
        gainNodes.push(gainNode);

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
      
      // Clean up after sound finishes
      setTimeout(() => {
        oscillators.forEach((osc, i) => {
          try {
            osc.disconnect();
            gainNodes[i].disconnect();
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      }, 300);
      
    } catch (e) {
      console.warn('Failed to play row highlight sound:', e);
      this.isEnabled = false;
    }
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
    // Dramatic, emphatic failure sound - multi-layered for maximum impact
    await this.ensureAudioContext();
    if (!this.audioContext) return;

    // Layer 1: Main harsh buzzer with frequency drop
    const oscillator1 = this.audioContext.createOscillator();
    const gainNode1 = this.audioContext.createGain();
    const filter1 = this.audioContext.createBiquadFilter();

    oscillator1.connect(filter1);
    filter1.connect(gainNode1);
    gainNode1.connect(this.audioContext.destination);

    // Lower starting frequency, bigger drop for more drama
    oscillator1.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 1.2);
    oscillator1.type = 'sawtooth';

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(400, this.audioContext.currentTime);
    filter1.Q.setValueAtTime(10, this.audioContext.currentTime);

    gainNode1.gain.setValueAtTime(0.35, this.audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.2);

    oscillator1.start(this.audioContext.currentTime);
    oscillator1.stop(this.audioContext.currentTime + 1.2);

    // Layer 2: Secondary buzzer for harmony dissonance
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode2 = this.audioContext.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(this.audioContext.destination);

    oscillator2.frequency.setValueAtTime(170, this.audioContext.currentTime + 0.1);
    oscillator2.frequency.exponentialRampToValueAtTime(45, this.audioContext.currentTime + 1.0);
    oscillator2.type = 'square';

    gainNode2.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.1);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);

    oscillator2.start(this.audioContext.currentTime + 0.1);
    oscillator2.stop(this.audioContext.currentTime + 1.0);

    // Layer 3: Deep thud at the beginning for impact
    setTimeout(() => {
      const thudOsc = this.audioContext!.createOscillator();
      const thudGain = this.audioContext!.createGain();

      thudOsc.connect(thudGain);
      thudGain.connect(this.audioContext!.destination);

      thudOsc.frequency.setValueAtTime(50, this.audioContext!.currentTime);
      thudOsc.type = 'triangle';

      thudGain.gain.setValueAtTime(0.4, this.audioContext!.currentTime);
      thudGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.5);

      thudOsc.start(this.audioContext!.currentTime);
      thudOsc.stop(this.audioContext!.currentTime + 0.5);
    }, 50);

    // Layer 4: Additional "crash" thud for emphasis
    setTimeout(() => {
      const crashOsc = this.audioContext!.createOscillator();
      const crashGain = this.audioContext!.createGain();

      crashOsc.connect(crashGain);
      crashGain.connect(this.audioContext!.destination);

      crashOsc.frequency.setValueAtTime(35, this.audioContext!.currentTime);
      crashOsc.type = 'triangle';

      crashGain.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      crashGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.8);

      crashOsc.start(this.audioContext!.currentTime);
      crashOsc.stop(this.audioContext!.currentTime + 0.8);
    }, 400);
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

  // Public method to enable/disable sound effects
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Public method to check if sound effects are enabled
  getEnabled(): boolean {
    return this.isEnabled;
  }

  // Realistic heartbeat sound effect for high tension
  async playHeartbeat() {
    if (!this.isEnabled) return;
    
    try {
      const contextReady = await this.ensureAudioContext();
      if (!contextReady || !this.audioContext) return;

      const now = this.audioContext.currentTime;

      // Create a subtle but unsettling heartbeat with minimal reverb
      const createHeartBeat = (startTime: number, frequency: number, duration: number, volume: number) => {
        // Single oscillator for clean heart sound
        const heartOsc = this.audioContext!.createOscillator();
        
        // Very subtle sub-bass for body resonance
        const subOsc = this.audioContext!.createOscillator();
        
        // Gain nodes
        const heartGain = this.audioContext!.createGain();
        const subGain = this.audioContext!.createGain();
        
        // Gentle filter for organic sound
        const filter = this.audioContext!.createBiquadFilter();
        
        // Very subtle reverb
        const convolver = this.audioContext!.createConvolver();
        const wetGain = this.audioContext!.createGain();
        const dryGain = this.audioContext!.createGain();
        const masterGain = this.audioContext!.createGain();
        
        // Short, gentle reverb impulse
        const impulseResponse = this.createReverbImpulse(1.2, 1.0); // Much shorter reverb
        convolver.buffer = impulseResponse;
        
        // Configure heart oscillator - triangle wave for organic feel
        heartOsc.type = 'triangle';
        heartOsc.frequency.setValueAtTime(frequency, startTime);
        
        // Very quiet sub-bass for chest resonance
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(frequency * 0.4, startTime);
        
        // Gentle lowpass filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 3, startTime);
        filter.Q.setValueAtTime(1.5, startTime); // Gentle resonance
        
        // Connect audio graph simply
        heartOsc.connect(filter);
        filter.connect(heartGain);
        
        subOsc.connect(subGain);
        
        // Very minimal reverb
        heartGain.connect(convolver);
        convolver.connect(wetGain);
        heartGain.connect(dryGain);
        
        // Mix
        wetGain.connect(masterGain);
        dryGain.connect(masterGain);
        subGain.connect(masterGain);
        masterGain.connect(this.audioContext!.destination);
        
        // Subtle mix - mostly dry with hint of space
        wetGain.gain.setValueAtTime(0.15, startTime); // Very little reverb
        dryGain.gain.setValueAtTime(0.85, startTime); // Mostly dry
        
        // Realistic heart envelope - quick thump with gentle decay
        heartGain.gain.setValueAtTime(0, startTime);
        heartGain.gain.linearRampToValueAtTime(volume, startTime + 0.005); // Very quick attack
        heartGain.gain.exponentialRampToValueAtTime(volume * 0.2, startTime + duration * 0.3);
        heartGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        // Sub-bass with longer, gentle decay for chest feeling
        subGain.gain.setValueAtTime(0, startTime);
        subGain.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.01);
        subGain.gain.exponentialRampToValueAtTime(volume * 0.1, startTime + duration * 0.6);
        subGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 1.2);
        
        // Master volume - louder for better audibility
        masterGain.gain.setValueAtTime(1.8, startTime);
        
        // Start oscillators
        heartOsc.start(startTime);
        subOsc.start(startTime);
        
        // Stop after decay
        heartOsc.stop(startTime + duration);
        subOsc.stop(startTime + duration * 1.2);
      };

      // Realistic heartbeat timing - precisely synchronized with CSS animation
      // CSS animation: first shake at 1% of 2s = 20ms, second shake at 9% of 2s = 180ms
      // Add small compensation for browser timing variations
      
      // "Lub" - first heart sound (S1) - slightly before visual for natural feel
      createHeartBeat(now + 0.015, 45, 0.12, 1.0); // 15ms instead of 20ms
      
      // "Dub" - second heart sound (S2) - also slightly ahead
      createHeartBeat(now + 0.175, 65, 0.08, 0.8); // 175ms instead of 180ms

    } catch (e) {
      console.warn('Failed to play atmospheric heartbeat:', e);
      this.isEnabled = false;
    }
  }
}

export const soundEffects = new SoundEffects();