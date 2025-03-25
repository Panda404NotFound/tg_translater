import express from 'express';
import * as expressModule from 'express';
import { telegramService } from '../services/telegram';
import crypto from 'crypto';

const router = expressModule.Router();

/**
 * POST /api/telegram/webhook
 * Обработчик вебхуков от Telegram Bot API
 */
router.post('/webhook', async (req, res) => {
  try {
    // Проверка данных от Telegram
    const update = req.body;
    
    if (!update) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные запроса'
      });
    }
    
    // Обработка обновления от Telegram
    await telegramService.handleUpdate(update);
    
    // Telegram ожидает HTTP 200 в ответ на вебхук
    return res.sendStatus(200);
  } catch (error) {
    console.error('Ошибка обработки вебхука Telegram:', error);
    // Даже при ошибке лучше вернуть 200, чтобы Telegram не ретраил запрос
    return res.sendStatus(200);
  }
});

/**
 * GET /api/telegram/init
 * Получение данных для инициализации Telegram Mini App
 */
router.get('/init', (req, res) => {
  try {
    // Проверка авторизации
    const botToken = process.env.BOT_TOKEN;
    const initData = req.query.initData as string;
    
    if (!initData) {
      return res.status(400).json({
        success: false,
        message: 'Отсутствуют данные инициализации Telegram'
      });
    }
    
    // Верификация initData (в реальном приложении здесь будет проверка подписи)
    const isValid = telegramService.verifyInitData(initData);
    
    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: 'Неверные данные инициализации'
      });
    }
    
    // Возвращаем базовую информацию для мини-приложения
    return res.json({
      success: true,
      appName: 'Голосовой Переводчик',
      supportedLanguages: [
        { code: 'ru', name: 'Русский' },
        { code: 'en', name: 'Английский' },
        { code: 'es', name: 'Испанский' },
        { code: 'fr', name: 'Французский' },
        { code: 'de', name: 'Немецкий' }
      ]
    });
  } catch (error) {
    console.error('Ошибка инициализации Telegram Mini App:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 