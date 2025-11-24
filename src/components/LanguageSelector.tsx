import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/language-selector.css';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-selector">
      <label className="language-selector__label">
        {t('ui.languageSelector')}
      </label>
      <div className="language-selector__buttons">
        <button
          onClick={() => setLanguage('sv')}
          className={`language-selector__button ${
            language === 'sv' ? 'language-selector__button--active' : ''
          }`}
        >
          Svenska
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`language-selector__button ${
            language === 'en' ? 'language-selector__button--active' : ''
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}