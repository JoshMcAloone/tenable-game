# Internationalization (i18n) Documentation

## Overview
The Tenable game supports multiple languages with Swedish as the default and English as an option. The system uses a React Context-based approach for language switching and string management.

## Supported Languages
- **Swedish (sv)**: Default language
- **English (en)**: Secondary language

## Implementation

### Language Context
The `LanguageContext` provides:
- Current language state
- Language switching function
- Translated text retrieval function

### Usage
```typescript
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('game.title')}</h1>
      <button onClick={() => setLanguage('en')}>
        {t('ui.switchToEnglish')}
      </button>
    </div>
  );
}
```

### Translation Keys Structure

#### UI Elements
- `ui.switchToEnglish` - Switch to English button
- `ui.switchToSwedish` - Switch to Swedish button
- `ui.languageSelector` - Language selector label

#### Game Setup
- `setup.title` - Game setup title
- `setup.subtitle` - Configuration subtitle
- `setup.teamsRequired` - Teams requirement text
- `setup.teamNames` - Team names section
- `setup.teamPlaceholder` - Team name placeholder
- `setup.addTeam` - Add team button
- `setup.removeTeam` - Remove team button
- `setup.startGame` - Start game button
- `setup.newGame` - New game button
- `setup.resumeGame` - Resume game button
- `setup.gameRules` - Game rules text

#### Gameplay
- `game.title` - Game title "TENABLE"
- `game.round` - Round indicator
- `game.question` - Question label
- `game.submit` - Submit button
- `game.nextTeam` - Next team button
- `game.nextRound` - Next round button
- `game.endGame` - End game button

#### Team Panel
- `team.active` - Active team indicator
- `team.score` - Score label
- `team.lives` - Lives label
- `team.eliminated` - Elimination status

#### Round Summary
- `summary.roundComplete` - Round complete message
- `summary.finalScores` - Final scores header
- `summary.winner` - Winner announcement
- `summary.gameOver` - Game over message

## Adding New Languages

To add a new language:

1. Create a new language file in `src/locales/{languageCode}.ts`
2. Add the language code to the `Language` type in `src/context/LanguageContext.tsx`
3. Import and add the translations to the `translations` object
4. Update the language selector component

## Translation File Structure

Each language file exports a nested object structure:
```typescript
export const sv = {
  ui: {
    switchToEnglish: "Växla till engelska",
    switchToSwedish: "Växla till svenska"
  },
  setup: {
    title: "TENABLE",
    subtitle: "SPELINSTÄLLNINGAR"
  },
  // ... more translations
};
```

## Persistence

The selected language is stored in localStorage under the key `tenable-language` and persists across browser sessions.