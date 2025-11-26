import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
import './styles/pyramid.css';
import './styles/team-panel.css';
import './styles/answer-input.css';
import './styles/status-panels.css';
import './styles/tooltip.css';
import { GameProvider } from './context/GameContext';
import { LanguageProvider } from './context/LanguageContext';

if ('serviceWorker' in navigator) {
  const swUrl = import.meta.env.BASE_URL + 'sw.js';
  navigator.serviceWorker.register(swUrl).catch((err) => console.error('SW registration failed', err));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </LanguageProvider>
  </React.StrictMode>
);
