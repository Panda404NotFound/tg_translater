import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Интерфейс для обновления от Telegram
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: any;
  inline_query?: any;
}

// Интерфейс для сообщения Telegram
interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
}

/**
 * Сервис для работы с Telegram API
 */
class TelegramService {
  private token: string;
  private apiUrl: string;
  
  constructor() {
    this.token = process.env.BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    
    if (!this.token) {
      console.warn('Внимание: Токен Telegram бота не настроен.');
    }
  }
  
  /**
   * Обработка обновления от Telegram
   * @param update Обновление от Telegram
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    try {
      console.log('Получено обновление от Telegram:', JSON.stringify(update));
      
      // Обработка сообщения
      if (update.message && update.message.text) {
        await this.handleMessage(update.message);
      }
      
      // Обработка callback query (кнопок)
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error('Ошибка обработки обновления Telegram:', error);
      throw error;
    }
  }
  
  /**
   * Обработка текстового сообщения
   * @param message Сообщение от пользователя
   */
  private async handleMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text || '';
    
    // Проверка команд
    if (text.startsWith('/start')) {
      await this.sendMessage(chatId, 'Привет! Я бот для голосового перевода в реальном времени. Используйте мою мини-приложение для звонков с переводом.');
      await this.sendAppLink(chatId);
    } else if (text.startsWith('/help')) {
      await this.sendMessage(chatId, 'Я помогаю переводить голос в реальном времени во время звонков. Используйте мою мини-приложение для звонков с переводом.');
      await this.sendAppLink(chatId);
    } else {
      // Простой ответ на любое другое сообщение
      await this.sendMessage(chatId, 'Для использования переводчика, запустите мою мини-приложение.');
      await this.sendAppLink(chatId);
    }
  }
  
  /**
   * Обработка callback query (нажатия на кнопки)
   * @param callbackQuery Данные о нажатии кнопки
   */
  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    // В этой заглушке просто подтверждаем получение callback query
    await axios.post(`${this.apiUrl}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id
    });
  }
  
  /**
   * Отправка сообщения пользователю
   * @param chatId ID чата
   * @param text Текст сообщения
   */
  private async sendMessage(chatId: number, text: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      throw error;
    }
  }
  
  /**
   * Отправка ссылки на мини-приложение
   * @param chatId ID чата
   */
  private async sendAppLink(chatId: number): Promise<void> {
    try {
      const botUsername = process.env.BOT_USERNAME || '';
      
      if (!botUsername) {
        await this.sendMessage(chatId, 'Ошибка: имя пользователя бота не настроено.');
        return;
      }
      
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text: 'Нажмите на кнопку ниже, чтобы открыть приложение для голосового перевода:',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎤 Запустить переводчик',
                web_app: { url: `https://t.me/${botUsername}/app` }
              }
            ]
          ]
        }
      });
    } catch (error) {
      console.error('Ошибка отправки ссылки на приложение:', error);
      throw error;
    }
  }
  
  /**
   * Проверка данных инициализации Telegram Mini App
   * @param initData Строка с данными инициализации от Telegram
   * @returns true, если данные верны
   */
  verifyInitData(initData: string): boolean {
    try {
      // В реальном приложении здесь будет проверка подписи
      // Для простоты примера просто возвращаем true
      return true;
      
      // Реальная реализация проверки подписи:
      /*
      const secret = crypto.createHmac('sha256', 'WebAppData')
        .update(this.token)
        .digest();
      
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      params.delete('hash');
      
      const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      const hmac = crypto.createHmac('sha256', secret)
        .update(dataCheckString)
        .digest('hex');
      
      return hmac === hash;
      */
    } catch (error) {
      console.error('Ошибка проверки initData:', error);
      return false;
    }
  }
}

export const telegramService = new TelegramService(); 