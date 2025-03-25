import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

// Определение интерфейса для SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// Расширение глобального Window для добавления SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Интерфейс для конфигурации распознавания речи
interface SpeechRecognitionConfig {
  sourceLanguage: string;
  continuous: boolean;
  interimResults: boolean;
}

export function useTranslation(sourceLanguage: string, targetLanguage: string) {
  // Состояния
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  
  // Ссылки для работы с распознаванием речи
  const recognitionRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string>('');
  
  // Настройка и запуск распознавания речи
  const setupSpeechRecognition = useCallback(() => {
    // Проверка поддержки браузера
    // @ts-ignore: В типах Window отсутствуют SpeechRecognition и webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Распознавание речи не поддерживается в этом браузере');
      return false;
    }
    
    // Инициализация распознавания речи
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Обработчик результатов распознавания
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Если есть финальный текст, переводим его
      if (finalTranscript) {
        translateText(finalTranscript);
        currentTranscriptRef.current = finalTranscript;
      }
    };
    
    // Обработчики ошибок и состояния
    recognition.onerror = (event: any) => {
      console.error('Ошибка распознавания речи:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      // Если все еще прослушиваем, перезапускаем
      if (isListening) {
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
    return true;
  }, [sourceLanguage, isListening]);
  
  // Функция для запуска перевода текста
  const translateText = useCallback(async (text: string) => {
    if (!text || sourceLanguage === targetLanguage) return;
    
    setIsTranslating(true);
    
    try {
      // Вызов API перевода через сервер
      const response = await axios.post('/api/translate', {
        text,
        sourceLanguage,
        targetLanguage
      });
      
      if (response.data && response.data.translatedText) {
        const translatedData = response.data.translatedText;
        setTranslatedText((prev: string) => {
          const prevText = prev || '';
          return prevText ? `${prevText}\n${translatedData}` : translatedData;
        });
      }
    } catch (error) {
      console.error('Ошибка перевода:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLanguage, targetLanguage]);
  
  // Функция для начала перевода аудио
  const startTranslating = useCallback(() => {
    if (setupSpeechRecognition()) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [setupSpeechRecognition]);
  
  // Функция для остановки перевода аудио
  const stopTranslating = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  }, []);
  
  // Перевод аудиопотока
  const translateAudio = useCallback((audioStream: MediaStream) => {
    // В реальности здесь будет более сложная логика для обработки аудиопотока
    // Например, используя Web Audio API для анализа и передачи аудио на сервер
    
    // Для простоты примера используем browser Speech Recognition API
    startTranslating();
    
    // Возвращаем функцию для остановки перевода
    return () => {
      stopTranslating();
    };
  }, [startTranslating, stopTranslating]);
  
  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  return {
    translatedText,
    isTranslating,
    translateAudio,
    startTranslating,
    stopTranslating,
    clearTranslation: () => setTranslatedText('')
  };
} 