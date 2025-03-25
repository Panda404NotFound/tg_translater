import express from 'express';
import * as expressModule from 'express';
import telegramRoutes from './telegram';
import translateRoutes from './translate';

const router = expressModule.Router();

// Информация о сервере
router.get('/', (req, res) => {
  res.json({
    name: 'Voice Translator API',
    version: '1.0.0',
    status: 'running'
  });
});

// Маршруты Telegram
router.use('/telegram', telegramRoutes);

// Маршруты перевода
router.use('/translate', translateRoutes);

export default router; 