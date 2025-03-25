import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import CallScreen from './components/CallScreen';
import HomeScreen from './components/HomeScreen';
import LanguageSelector from './components/LanguageSelector';
import { useWebRTC } from './hooks/useWebRTC';
import { useTranslation } from './hooks/useTranslation';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';

// Типы экранов в приложении
enum Screen {
  HOME = 'home',
  LANGUAGE_SELECT = 'language_select',
  CALL = 'call',
}

// Типы поддерживаемых языков
export interface Language {
  code: string;
  name: string;
}

const App: React.FC = () => {
  // Состояние приложения
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [sourceLanguage, setSourceLanguage] = useState<Language>({ code: 'ru', name: 'Русский' });
  const [targetLanguage, setTargetLanguage] = useState<Language>({ code: 'en', name: 'Английский' });
  const [callId, setCallId] = useState<string | null>(null);
  
  // Инициализация Telegram WebApp
  const { user, initData } = useTelegramWebApp();
  
  // Хуки для WebRTC и перевода
  const { 
    localStream,
    remoteStream, 
    connectionStatus,
    startCall,
    joinCall,
    endCall
  } = useWebRTC();
  
  const { 
    translatedText, 
    isTranslating, 
    translateAudio 
  } = useTranslation(sourceLanguage.code, targetLanguage.code);

  // Эффект для инициализации Telegram Mini App
  useEffect(() => {
    // Настройка Telegram Mini App
    WebApp.ready();
    WebApp.expand();
    
    // Настраиваем кнопку "назад"
    WebApp.BackButton.onClick(() => {
      if (currentScreen === Screen.LANGUAGE_SELECT) {
        setCurrentScreen(Screen.HOME);
        WebApp.BackButton.hide();
      } else if (currentScreen === Screen.CALL) {
        // Подтверждение выхода из звонка
        if (window.confirm('Вы уверены, что хотите завершить звонок?')) {
          endCall();
          setCurrentScreen(Screen.HOME);
          WebApp.BackButton.hide();
        }
      }
    });
  }, [currentScreen, endCall]);

  // Управление видимостью кнопки "назад"
  useEffect(() => {
    if (currentScreen === Screen.HOME) {
      WebApp.BackButton.hide();
    } else {
      WebApp.BackButton.show();
    }
  }, [currentScreen]);

  // Обработчики для навигации и действий
  const handleStartCall = () => {
    const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCallId(newCallId);
    startCall(newCallId);
    setCurrentScreen(Screen.CALL);
  };

  const handleJoinCall = (id: string) => {
    setCallId(id);
    joinCall(id);
    setCurrentScreen(Screen.CALL);
  };

  const handleEndCall = () => {
    endCall();
    setCallId(null);
    setCurrentScreen(Screen.HOME);
  };

  const handleLanguageSelect = () => {
    setCurrentScreen(Screen.LANGUAGE_SELECT);
  };

  // Рендеринг нужного экрана в зависимости от состояния
  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.HOME:
        return (
          <HomeScreen 
            onStartCall={handleStartCall}
            onJoinCall={handleJoinCall}
            onLanguageSelect={handleLanguageSelect}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        );
      case Screen.LANGUAGE_SELECT:
        return (
          <LanguageSelector
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceLanguageChange={setSourceLanguage}
            onTargetLanguageChange={setTargetLanguage}
            onDone={() => setCurrentScreen(Screen.HOME)}
          />
        );
      case Screen.CALL:
        return (
          <CallScreen 
            callId={callId || ''}
            localStream={localStream}
            remoteStream={remoteStream}
            connectionStatus={connectionStatus}
            translatedText={translatedText}
            isTranslating={isTranslating}
            onEndCall={handleEndCall}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        );
      default:
        return <HomeScreen 
          onStartCall={handleStartCall}
          onJoinCall={handleJoinCall}
          onLanguageSelect={handleLanguageSelect}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />;
    }
  };

  return (
    <div className="container">
      {renderScreen()}
    </div>
  );
};

export default App; 