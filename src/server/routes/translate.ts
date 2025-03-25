import express from 'express';
import * as expressModule from 'express';
import { translateService } from '../services/translate';

const router = expressModule.Router();

/**
 * POST /api/translate
 * Маршрут для перевода текста
 */
router.post('/', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    
    // Проверка входных данных
    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствуют обязательные поля: text, sourceLanguage, targetLanguage'
      });
    }
    
    // Перевод текста
    const translatedText = await translateService.translateText(
      text,
      sourceLanguage,
      targetLanguage
    );
    
    return res.json({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage
    });
  } catch (error) {
    console.error('Ошибка при переводе текста:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при выполнении перевода',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/translate/audio
 * Маршрут для перевода аудио (заглушка для будущей реализации)
 */
router.post('/audio', (req, res) => {
  // В реальном приложении здесь будет обработка аудио
  // и отправка его на API перевода речи
  res.status(501).json({
    success: false,
    message: 'Перевод аудио пока не реализован'
  });
});

export default router; 