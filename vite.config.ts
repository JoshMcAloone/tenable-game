import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

// Set base path for GitHub Pages deployment.
// Repository name: tenable-game -> hosted at /tenable-game/
export default defineConfig({
  base: '/tenable-game/',
  plugins: [react(), tailwind()]
});
