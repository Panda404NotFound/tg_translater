import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Интерфейс для ответа от API перевода
interface TranslationResponse {
  translations: {
    translatedText: string;
  }[];
}

/**
 * Сервис для обработки переводов текста и аудио
 */
class TranslateService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.TRANSLATION_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Внимание: API ключ для перевода не настроен. Используется заглушка вместо реального перевода.');
    }
  }
  
  /**
   * Перевод текста с одного языка на другой
   * @param text Текст для перевода
   * @param sourceLanguage Исходный язык
   * @param targetLanguage Целевой язык
   * @returns Переведенный текст
   */
  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      // Если API ключ не настроен, используем заглушку (для тестирования)
      if (!this.apiKey) {
        return this.mockTranslate(text, sourceLanguage, targetLanguage);
      }
      
      // В реальном приложении здесь будет запрос к Google Translate API или другому сервису перевода
      const response = await axios.post<TranslationResponse>(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }
      );
      
      if (response.data && response.data.translations && response.data.translations.length > 0) {
        return response.data.translations[0].translatedText;
      }
      
      throw new Error('Нет данных в ответе API перевода');
    } catch (error) {
      console.error('Ошибка при переводе текста:', error);
      
      // В случае ошибки возвращаем заглушку
      return this.mockTranslate(text, sourceLanguage, targetLanguage);
    }
  }
  
  /**
   * Заглушка для перевода (для тестирования без API)
   * @param text Текст для перевода
   * @param sourceLanguage Исходный язык
   * @param targetLanguage Целевой язык
   * @returns Имитация переведенного текста
   */
  private mockTranslate(text: string, sourceLanguage: string, targetLanguage: string): string {
    // Псевдо-перевод для тестирования
    const mockTranslations: Record<string, Record<string, string>> = {
      'ru': {
        'en': 'This is a mock translation from Russian to English',
        'es': 'Esta es una traducción simulada del ruso al español',
        'de': 'Dies ist eine Mock-Übersetzung vom Russischen ins Deutsche',
        'fr': 'Ceci est une traduction simulée du russe vers le français'
      },
      'en': {
        'ru': 'Это тестовый перевод с английского на русский',
        'es': 'Esta es una traducción simulada del inglés al español',
        'de': 'Dies ist eine Mock-Übersetzung vom Englischen ins Deutsche',
        'fr': 'Ceci est une traduction simulée de l\'anglais vers le français'
      }
    };
    
    // Если есть заготовленный перевод, используем его
    if (
      mockTranslations[sourceLanguage] && 
      mockTranslations[sourceLanguage][targetLanguage]
    ) {
      return mockTranslations[sourceLanguage][targetLanguage];
    }
    
    // Иначе просто добавляем метку перевода к исходному тексту
    return `[${sourceLanguage} → ${targetLanguage}] ${text}`;
  }
  
  /**
   * Метод для перевода аудио в реальном времени
   * @param audioBuffer Аудио-буфер для перевода
   * @param sourceLanguage Исходный язык
   * @param targetLanguage Целевой язык
   * @returns Текст, распознанный из аудио и переведенный
   */
  async translateAudio(audioBuffer: Buffer, sourceLanguage: string, targetLanguage: string): Promise<string> {
    // Заглушка для будущей реализации
    return `[Аудио-перевод ${sourceLanguage} → ${targetLanguage}] не реализован`;
  }
}

export const translateService = new TranslateService(); 