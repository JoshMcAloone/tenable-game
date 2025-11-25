# Tenable Style Quiz Game (MVP)

React + Vite + TypeScript + Tailwind prototype of a multi-team quiz game inspired by the Tenable TV format.

## Features (MVP)
* Configure 2–6 teams
* Display question then answer board with 10 slots
* **Fuzzy Answer Matching**: Intelligent answer validation that accepts close matches
  - Handles missing articles ("Winner Takes It All" matches "The Winner Takes It All")
  - Case-insensitive matching and whitespace normalization
  - Typo tolerance using Levenshtein distance ("Winer" matches "Winner")
  - **Abbreviation handling**: Smart matching for dotted abbreviations ("sos" matches "S.O.S")
  - Configurable similarity threshold (default 80% match required)
  - Smart punctuation and article removal for better matching
* **Progressive Reveal Animation**: Dramatic bottom-to-top scanning animation when answers are submitted
  - White throbbing highlight on each row with purple number text
  - **Ascending pitch progression**: Sound rises from 600Hz to 1200Hz as scanning progresses
  - Enhanced sound effects create building tension and drama
  - Quick success reveal with green pulsing animation
  - Dramatic red failure flash across entire pyramid
* **Undo Functionality**: Quality-of-life feature for mistake recovery
  - Undo incorrect answer submissions within 30 seconds
  - Restores team life and allows retry
  - Compact icon button integrated into answer input form
  - Available in both English and Swedish interfaces
* **Internationalization**: Full Swedish and English language support
  - Swedish as default language with English option
  - Complete UI translation including game interface
  - Language preference persistence across sessions
* Turn-based answer submission & validation
* Scores & lives tracking; elimination on 0 lives
* Round summary & multi-round progression
* Basic PWA manifest + service worker (offline shell)

## Getting Started
```bash
npm install
npm run dev
```

Visit: http://localhost:5173

## Scripts
* `npm run dev` – start dev server
* `npm run build` – production build
* `npm run preview` – preview production build
* `npm run test` – run unit tests (Vitest)
* `npm run validate:rounds` – validate rounds JSON structure

## Tailwind v4 Notes
Using `@tailwindcss/vite` plugin for zero-config setup. Styles imported via `src/styles/tailwind.css`.

## Domain Model
See `src/types/domain.ts`.

## Data
Sample rounds: `src/data/rounds.example.json`.

## Next Steps
Refer to `docs/action_plan_checklist.md` for phased improvements.

## Accessibility
Components aim for keyboard focus and aria-live feedback for answer results. Further audits pending.

## License
Internal prototype – no license specified.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
