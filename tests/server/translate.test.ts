import { translateService } from '../../src/server/services/translate';

// Мокаем axios для тестирования
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({
    data: {
      translations: [
        { translatedText: 'This is a test translation' }
      ]
    }
  }))
}));

describe('TranslateService', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });
  
  describe('translateText', () => {
    it('should translate text correctly', async () => {
      // Устанавливаем значение API ключа через рефлексию
      (translateService as any).apiKey = 'test_api_key';
      
      const result = await translateService.translateText(
        'Это тестовый текст',
        'ru',
        'en'
      );
      
      // Проверяем, что был возвращен ожидаемый результат
      expect(result).toBe('This is a test translation');
      
      // Проверяем, что axios.post был вызван с правильными параметрами
      const axios = require('axios');
      expect(axios.post).toHaveBeenCalledWith(
        'https://translation.googleapis.com/language/translate/v2?key=test_api_key',
        {
          q: 'Это тестовый текст',
          source: 'ru',
          target: 'en',
          format: 'text'
        }
      );
    });
    
    it('should use mock translation when API key is not set', async () => {
      // Устанавливаем пустой API ключ
      (translateService as any).apiKey = '';
      
      const result = await translateService.translateText(
        'Test text',
        'en',
        'ru'
      );
      
      // Проверяем, что был использована заглушка
      expect(result).toBe('Это тестовый перевод с английского на русский');
      
      // Проверяем, что axios.post не был вызван
      const axios = require('axios');
      expect(axios.post).not.toHaveBeenCalled();
    });
    
    it('should use mock translation when API call fails', async () => {
      // Устанавливаем API ключ
      (translateService as any).apiKey = 'test_api_key';
      
      // Мокаем ошибку при вызове API
      const axios = require('axios');
      axios.post.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
      
      const result = await translateService.translateText(
        'Test text',
        'en',
        'ru'
      );
      
      // Проверяем, что была использована заглушка при ошибке
      expect(result).toBe('Это тестовый перевод с английского на русский');
    });
  });
}); 