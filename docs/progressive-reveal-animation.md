# Progressive Reveal Animation Feature

The Progressive Reveal Animation system creates dramatic suspense when players submit answers, mimicking the excitement of TV game shows.

## How It Works

### Animation Sequence
1. **Submit Answer**: Player submits an answer
2. **Scanning Phase**: Animation starts from the bottom-most unrevealed row
3. **Row Highlighting**: Each row is highlighted with dramatic white throbbing effect
4. **Text Effects**: Row numbers turn purple and pulse during highlighting
5. **Progressive Sound Effects**: Rising pitch audio that builds tension with each step
6. **Resolution**: 
   - **Success**: Green pulsing animation when answer is found, triumphant fanfare
   - **Failure**: Red flash across entire pyramid, dramatic buzzer sound

### Visual Effects

#### Row Highlighting
- **Solid white throbbing** with scale transforms (up to 1.12x)
- **Purple number text** with glowing text shadows
- **Inset shadows** and glowing outer shadows for depth
- **0.6s animation cycle** for quick, dramatic pacing

#### Success Animation  
- **Bright green pulsing** effect (0.8s duration)
- **Scale transform** up to 1.2x for emphasis
- **Quick reveal** for immediate gratification
- **Glowing effects** with enhanced shadows

#### Failure Animation
- **Intense red flashing** across entire pyramid (1.5s duration)
- **Multiple flash cycles** for maximum drama
- **Scale transforms** and varying opacity
- **White text highlights** during flash

### Sound Design

#### Row Scanning
- **Harmonic tones**: 600Hz + 900Hz (root note + fifth)
- **Mixed waveforms**: Square wave (primary) + sine wave (harmony)
- **0.25s duration** per highlight

#### Success Fanfare
- **Chord progression**: C-E-G-C (octave)
- **Overlapping tones** with harmonics (1.5x frequency)
- **Rich timbre**: Sine + triangle wave combinations
- **Epic crescendo** building to high C

#### Failure Buzzer
- **Game show style buzzer**: 150Hz sawtooth, dropping to 100Hz
- **Low-pass filter** for muffled, dramatic effect
- **Secondary thud**: 80Hz triangle wave for impact
- **0.8s primary + 0.3s thud** for maximum drama

### Technical Implementation

#### State Management
```typescript
interface AnimationState {
  isAnimating: boolean;
  currentHighlightRow: number | null;
  submittedAnswer: string;
  animationType: 'scanning' | 'success' | 'failure' | null;
}
```

#### Key Components
- **useProgressiveReveal**: Hook managing animation timing and state transitions
- **CSS Keyframes**: Complex animations with multiple stages
- **Web Audio API**: Procedural sound generation for rich audio effects
- **State Machine**: Clean action-based state management

#### CSS Classes
- `.answer-tier--highlighting`: Applied to currently highlighted row
- `.answer-tier--success`: Applied when answer is found
- `.pyramid-container--failure`: Applied to entire pyramid for failure flash

## User Experience

### Timing
- **Scanning Speed**: 500ms per row (faster for drama)
- **Success Reveal**: 800ms (quick for emphasis)
- **Failure Duration**: 1500ms (extended for impact)

### Accessibility
- **Visual feedback**: High contrast animations
- **Audio cues**: Distinct sounds for each state
- **No motion sickness**: Controlled scale transforms
- **Clear state indicators**: Button text changes during animation

### UI States
- **Input disabled** during animation
- **Button text**: Changes to "CHECKING..." 
- **Turn advancement**: Automatic after animation completes
- **No double submissions**: Animation state prevents overlapping

## Configuration

### Animation Timing
Configured in `useProgressiveReveal.ts`:
```typescript
// Scanning: 500ms per row
// Success: 800ms reveal  
// Failure: 1500ms flash
```

### Visual Intensity
Adjustable via CSS keyframes in `pyramid.css`:
- Scale transforms (1.0x to 1.2x)
- Opacity variations (0.5 to 1.0)
- Shadow intensities (25px to 80px)
- Color saturations (0.3 to 1.0)

### Audio Levels
Gain values in `soundEffects.ts`:
- Row highlight: 0.15-0.195 (progressive volume increase)
- Success fanfare: 0.2 (melody) + 0.1 (harmony)  
- Failure buzzer: 0.25 (primary) + 0.3 (thud)

## Enhanced Audio System

### Progressive Pitch Scanning
The scanning sound effects now feature dramatic pitch progression:

**Frequency Range**: 600Hz → 1200Hz
- **Starting pitch**: 600Hz (bottom row, calm)
- **Linear progression**: Each step rises by ~67Hz
- **Final pitch**: 1200Hz (top row, maximum tension)
- **Direction**: Ascends as scanning moves from bottom to top
- **Step Inversion**: Since visual scanning goes bottom→top (index 9→0), audio step calculation is inverted for ascending pitch

**Volume Dynamics**: 
- Base volume increases up to 30% at higher pitches
- Creates building intensity that matches the rising frequency
- Maintains clarity while adding dramatic emphasis

**Psychological Effect**:
- **Bottom rows**: Calm confidence - "My answer is probably here"
- **Middle rows**: Growing concern - "Maybe it's further up?"
- **Top rows**: High tension - "Is my answer actually wrong?"
- **Maximum drama**: Players start doubting their answer as pitch rises

### Testing Progressive Audio
Use the testing utilities in `soundEffectsTesting.ts`:
```typescript
// Test full progression
testProgressivePitch(10);

// Visualize frequency curve  
showPitchProgression(10);

// Test dramatic moments
testDramaticMoments();
```

## Future Enhancements

### Possible Additions
- **Difficulty-based timing**: Faster scanning for harder questions
- **Team-specific effects**: Different colors per team
- **Combo animations**: Special effects for multiple correct answers
- **Sound themes**: Different audio styles (retro, orchestral, electronic)
- **Accessibility options**: Motion reduction settings

### Performance Considerations
- **Animation cleanup**: Automatic timeout clearing with improved race condition handling
- **Audio context management**: Proper resource disposal
- **State synchronization**: Enhanced prevention of race conditions and animation interruption
- **Memory efficiency**: No persistent animation objects
- **Rapid Click Protection**: Improved handling of rapid user interactions

### Animation State Management
Enhanced animation system includes robust state validation:

#### Race Condition Prevention
```typescript
// Triple-check animation state before dispatching actions
if (animation?.isAnimating && 
    animation.animationType === 'scanning' && 
    animation.currentHighlightRow === animation.currentHighlightRow) {
  dispatch({ type: 'HIGHLIGHT_ROW', rowIndex: animation.currentHighlightRow! });
}
```

#### Improved Cleanup
- **Processing flags**: Prevents overlapping animations with `isProcessingRef`
- **State validation**: Verifies animation state hasn't changed during timeouts
- **Better cleanup**: Resets processing flags when animations stop unexpectedly
- **Timeout management**: Proper clearing of all timeouts to prevent memory leaks