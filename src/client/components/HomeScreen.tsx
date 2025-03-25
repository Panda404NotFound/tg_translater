import React, { useState } from 'react';
import { Language } from '../App';

interface HomeScreenProps {
  onStartCall: () => void;
  onJoinCall: (callId: string) => void;
  onLanguageSelect: () => void;
  sourceLanguage: Language;
  targetLanguage: Language;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartCall,
  onJoinCall,
  onLanguageSelect,
  sourceLanguage,
  targetLanguage
}) => {
  const [callIdInput, setCallIdInput] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (callIdInput.trim()) {
      onJoinCall(callIdInput.trim());
    }
  };

  return (
    <div className="home-screen">
      <h1 className="app-title">Голосовой Переводчик</h1>
      
      <div className="language-display card">
        <h3>Текущие языки</h3>
        <div className="language-row">
          <div className="language-item">
            <span className="language-label">С языка:</span>
            <span className="language-value">{sourceLanguage.name}</span>
          </div>
          <div className="language-item">
            <span className="language-label">На язык:</span>
            <span className="language-value">{targetLanguage.name}</span>
          </div>
        </div>
        <button 
          className="button language-button" 
          onClick={onLanguageSelect}
        >
          Изменить языки
        </button>
      </div>

      <div className="call-actions">
        <button 
          className="button call-button" 
          onClick={onStartCall}
        >
          Начать новый звонок
        </button>
        
        {!showJoinForm ? (
          <button 
            className="button join-button" 
            onClick={() => setShowJoinForm(true)}
          >
            Присоединиться к звонку
          </button>
        ) : (
          <form className="join-form card" onSubmit={handleJoinCall}>
            <input
              type="text"
              placeholder="Введите ID звонка"
              value={callIdInput}
              onChange={(e) => setCallIdInput(e.target.value)}
              className="call-id-input"
            />
            <div className="join-form-buttons">
              <button 
                type="button" 
                className="button cancel-button"
                onClick={() => setShowJoinForm(false)}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="button confirm-button"
                disabled={!callIdInput.trim()}
              >
                Присоединиться
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HomeScreen; 