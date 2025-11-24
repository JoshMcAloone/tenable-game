# Tenable Game Board Design Specification

This document details the visual and structural components of the game board, based on the provided images, suitable for replication in a web application environment using React/TypeScript.

## 1. Overall Theme and Aesthetic

### Theme
High-contrast, futuristic, digital game show aesthetic

### Background
- **Primary**: Solid black (`#000000`) or very dark background
- **Effects**: Subtle, slow-moving digital particles or noise texture

### Typography
- **Font Family**: Clean, modern, slightly condensed sans-serif (Inter, Roboto, or futuristic equivalent)
- **Color**: Bright white (`#FFFFFF`) for all text

### Color Palette

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| **Dark Base** | Deep Violet/Purple | `#4B0082` | Empty/Background states |
| **Accent/Correct** | Vibrant Neon Green | `#39FF14` | Correct answers, highlights |
| **Outline/Neon** | Bright Cyan/Blue/Magenta | `#00FFFF` | Borders, flanking elements |
| **Error** | Neon Red/Orange | `#FF4500` | Incorrect answers |
| **Active** | Bright White/Cyan | `#00FFFF` | Current input state |

## 2. Central Pyramid Structure

The main interactive element is a large, inverted triangular pyramid containing 10 answer slots.

### 2.1 Geometry and Layout

- **Shape**: Inverted isosceles triangle, vertically centered
- **Outline**: Thick, glowing neon green border (`#39FF14`)
- **Interior**: Subtle diagonal line/lattice pattern overlay on deep violet

### 2.2 Answer Tiers (Slots 1-10)

- **Count**: 10 horizontal tiers, numbered 1 (top) to 10 (bottom)
- **Sizing**: Each tier spans 100% of available horizontal width at its vertical position
- **Progression**: Each tier slightly wider than the one above
- **Height**: Equal vertical height for all tiers
- **Special**: Tier 10 (bottom) may be visually distinct/wider
- **Alignment**: All text centered horizontally

### 2.3 Top and Bottom Terminals

- **Top Terminal**: Small, bright neon green triangular block above Tier 1
- **Bottom Terminal**: Wide, rounded-rectangle bar in solid neon green
  - Used for "TENABLE" logo or confirmation text ("SUBMIT")

## 3. Dynamic State Management

### Tier States

| State | Background | Text Color | Border/Glow | Content |
|-------|------------|------------|--------------|---------|
| **Empty/Unconfirmed** | Deep Violet (`#4B0082`) | White (`#FFFFFF`) | Subtle neon green glow | Sequential number (1-10) |
| **Correct Answer** | Solid Neon Green (`#39FF14`) | White (`#FFFFFF`) | Strong, pulsing green glow | User-submitted answer text |
| **Incorrect Answer** | Neon Red/Orange (`#FF4500`) | White (`#FFFFFF`) | Flashing red glow | Answer text or 'X' symbol |
| **Current/Active** | Bright White/Cyan (`#00FFFF`) | Black (`#000000`) | Strongest pulsing glow | User input text/cursor |

### Animation Effects

- **Pulse**: Gentle glow animation for active/correct states
- **Transitions**: Smooth state changes (500ms duration)
- **Reveal**: Flip or scale animation when answers are revealed

## 4. Flanking Status Displays

### Positioning
- **Location**: Far left and far right of screen (symmetrical)
- **Layout**: Mirrored panels flanking the central pyramid

### Structure
- **Shape**: Rectangular or trapezoidal boundaries
- **Borders**: Neon blue/cyan lines (`#00FFFF`)
- **Content**: Abstract bar graph visualization

### Visual Elements
- **Bars**: Parallel horizontal lines in different neon colors
- **Colors**: Magenta and Cyan/Green variants
- **Animation**: Subtle "live data" effects (length changes, color cycling)
- **Layout**: Tight vertical stack covering most of panel height

## 5. Implementation Notes

### CSS Properties
- Use CSS custom properties for color theming
- Implement glow effects with `box-shadow` and `filter: drop-shadow()`
- Utilize CSS animations for pulsing and transitions
- Apply `clip-path` for precise triangular shapes

### React Components
- `PyramidBoard`: Main triangle container
- `AnswerTier`: Individual answer slots with state management
- `StatusPanel`: Flanking display components
- `NeonButton`: Reusable styled button component

### Performance Considerations
- Use `transform` for animations (GPU acceleration)
- Implement `will-change` for animated elements
- Consider `useMemo` for expensive calculations