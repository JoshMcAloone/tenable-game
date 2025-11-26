# Heartbeat System Documentation

## Overview
The heartbeat system creates immersive tension when teams reach critical state (1 life remaining) through synchronized audio-visual effects that simulate a racing heartbeat.

## Features

### Audio Component
- **Realistic Heartbeat Sound**: Two-part "lub-dub" pattern using Web Audio API
- **Atmospheric Processing**: Subtle reverb and filtering for organic feel
- **Sub-bass Resonance**: Low-frequency components for chest-felt sensation
- **Dynamic Timing**: 2-second intervals matching visual animations

### Visual Component
- **Team Panel Shake**: Synchronized trembling effect during heartbeat
- **Red Glow Effects**: Critical state visual indicators with drop shadows
- **ECG-style Animation**: Heart icon pulses matching audio timing
- **Smooth Transitions**: Fade-in/out when entering/leaving critical state

## Technical Implementation

### Audio Architecture (`src/utils/soundEffects.ts`)
```typescript
// Triangle wave oscillator for organic heart sound
heartOsc.type = 'triangle';
heartOsc.frequency.setValueAtTime(frequency, startTime);

// Sub-bass for chest resonance  
subOsc.type = 'sine';
subOsc.frequency.setValueAtTime(frequency * 0.4, startTime);

// Reverb processing for atmospheric effect
const impulseResponse = this.createReverbImpulse(1.2, 1.0);
```

### CSS Animation Timing (`src/styles/team-panel.css`)
```css
@keyframes criticalShake {
  /* First heartbeat "lub" - at 1% = 20ms */
  1% { transform: translate3d(1.4px, -0.7px, 0); }
  
  /* Second heartbeat "dub" - at 9% = 180ms */  
  9% { transform: translate3d(-1.4px, 0.9px, 0); }
  
  /* 2 second total cycle */
}
```

### State Management (`src/hooks/useProgressiveReveal.ts`)
- **Condition Detection**: `shouldPlayHeartbeat = activeTeam && livesRemaining === 1 && !animation?.isAnimating`
- **Animation Pausing**: Heartbeat automatically stops during answer submission and reveal animations
- **Automatic Resume**: Restarts after animation completes if team still has 1 life remaining
- **Interval Management**: 2000ms repeating cycles with cleanup
- **Memory Optimization**: Proper clearInterval on component unmount

### Component Integration (`src/components/TeamPanel.tsx`)
- **Critical State Logic**: `isCritical = livesRemaining === 1 && !eliminated && !isAnimating`
- **Synchronized Styling**: Visual effects pause when heartbeat pauses during animations
- **Animation State Prop**: Receives animation state from BoardView for perfect sync
- **Performance**: Minimal re-renders through memoization

## Synchronization Details

### Perfect Audio-Visual Sync
- **Unified State**: Both audio and visual effects use the same animation state
- **Synchronized Pausing**: CSS animations pause when heartbeat stops during reveal
- **Instant Resume**: Both effects restart simultaneously when animation completes
- **Zero Drift**: Visual and audio remain perfectly synchronized across pause/resume cycles

### Timing Precision
- **Audio Lead**: Sound plays 5ms before visual (15ms and 175ms vs 20ms and 180ms)
- **Browser Compensation**: Accounts for audio processing latency
- **Human Perception**: Audio-visual synchronization optimized for natural feel

### Performance Considerations
- **Web Audio Context**: Efficient oscillator cleanup and resource management
- **CSS Transforms**: Hardware-accelerated animations using `translate3d`
- **Memory Management**: Proper interval cleanup prevents memory leaks
- **Animation Pausing**: Heartbeat stops during answer submission to avoid audio conflict
- **Smart Resume**: Automatically restarts when animation ends if team still critical

## Configuration

### Volume Settings
```typescript
// Balanced for tension without overwhelming other sounds
masterGain.gain.setValueAtTime(1.8, startTime);
```

### Timing Constants
```typescript
HEARTBEAT_INTERVAL: livesRemaining === 1 ? 2000 : 1600
```

### Visual Effects
```css
/* Red glow with multiple shadow layers */
box-shadow: 
  inset 0 0 10px rgba(239, 68, 68, 0.4),
  0 0 8px rgba(239, 68, 68, 0.6),
  0 0 16px rgba(239, 68, 68, 0.3);
```

## Troubleshooting

### Common Issues
1. **Timing Drift**: Ensure proper interval cleanup and recreation
2. **Audio Latency**: Adjust lead times for different browsers
3. **Performance**: Monitor CPU usage during intensive animations

### Browser Compatibility
- **Web Audio API**: Modern browsers (Chrome 14+, Firefox 23+, Safari 6+)
- **CSS Animations**: Universal support with hardware acceleration
- **Transform3d**: GPU acceleration when available

## Future Enhancements

### Potential Improvements
- **Heart Rate Variation**: Slight timing irregularities for realism
- **Intensity Scaling**: Volume/shake intensity based on time pressure
- **Accessibility Options**: Optional disable for motion sensitivity
- **Mobile Optimization**: Touch vibration integration on supported devices