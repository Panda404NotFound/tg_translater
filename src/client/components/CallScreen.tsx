import React, { useRef, useEffect } from 'react';
import { Language } from '../App';

interface CallScreenProps {
  callId: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionStatus: string;
  translatedText: string;
  isTranslating: boolean;
  onEndCall: () => void;
  sourceLanguage: Language;
  targetLanguage: Language;
}

const CallScreen: React.FC<CallScreenProps> = ({
  callId,
  localStream,
  remoteStream,
  connectionStatus,
  translatedText,
  isTranslating,
  onEndCall,
  sourceLanguage,
  targetLanguage,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Настройка локального видео
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Настройка удаленного видео
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Копирование ID звонка в буфер обмена
  const copyCallId = () => {
    navigator.clipboard.writeText(callId)
      .then(() => alert('ID звонка скопирован в буфер обмена!'))
      .catch(() => alert('Не удалось скопировать ID звонка.'));
  };

  return (
    <div className="call-screen">
      <div className="call-info">
        <div className="call-id-container">
          <span className="call-id-label">ID звонка:</span>
          <span className="call-id-value">{callId}</span>
          <button className="button copy-button" onClick={copyCallId}>
            Копировать
          </button>
        </div>
        <div className="connection-status">
          Статус: <span className={`status-${connectionStatus.toLowerCase()}`}>{connectionStatus}</span>
        </div>
      </div>

      <div className="video-container">
        <div className="remote-video-wrapper">
          <video
            ref={remoteVideoRef}
            className="remote-video"
            autoPlay
            playsInline
          />
          {!remoteStream && (
            <div className="waiting-overlay">
              <p>Ожидание собеседника...</p>
            </div>
          )}
        </div>
        <div className="local-video-wrapper">
          <video
            ref={localVideoRef}
            className="local-video"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>

      <div className="translation-container card">
        <div className="translation-header">
          <h3>Перевод ({sourceLanguage.name} → {targetLanguage.name})</h3>
          {isTranslating && <span className="translating-indicator">Перевод...</span>}
        </div>
        <div className="translation-content">
          {translatedText || 'Говорите, чтобы увидеть перевод здесь...'}
        </div>
      </div>

      <div className="call-controls">
        <button className="button end-call-button" onClick={onEndCall}>
          Завершить звонок
        </button>
      </div>
    </div>
  );
};

export default CallScreen; 