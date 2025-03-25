import React from 'react';
import { Language } from '../App';

// Список доступных языков (можно расширить)
const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'Английский' },
  { code: 'es', name: 'Испанский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'fr', name: 'Французский' },
  { code: 'it', name: 'Итальянский' },
  { code: 'zh', name: 'Китайский' },
  { code: 'ja', name: 'Японский' },
  { code: 'ko', name: 'Корейский' },
  { code: 'ar', name: 'Арабский' },
];

interface LanguageSelectorProps {
  sourceLanguage: Language;
  targetLanguage: Language;
  onSourceLanguageChange: (language: Language) => void;
  onTargetLanguageChange: (language: Language) => void;
  onDone: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onDone,
}) => {
  return (
    <div className="language-selector">
      <h2>Выберите языки</h2>
      
      <div className="language-section">
        <h3>Язык источника</h3>
        <div className="language-list">
          {AVAILABLE_LANGUAGES.map((language) => (
            <button
              key={language.code}
              className={`language-item ${language.code === sourceLanguage.code ? 'selected' : ''}`}
              onClick={() => onSourceLanguageChange(language)}
            >
              {language.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="language-section">
        <h3>Язык перевода</h3>
        <div className="language-list">
          {AVAILABLE_LANGUAGES.map((language) => (
            <button
              key={language.code}
              className={`language-item ${language.code === targetLanguage.code ? 'selected' : ''}`}
              disabled={language.code === sourceLanguage.code}
              onClick={() => onTargetLanguageChange(language)}
            >
              {language.name}
            </button>
          ))}
        </div>
      </div>
      
      <button className="button done-button" onClick={onDone}>
        Готово
      </button>
    </div>
  );
};

export default LanguageSelector; 