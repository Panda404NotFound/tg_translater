"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Сервис для работы с Telegram API
 */
class TelegramService {
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
    handleUpdate(update) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Получено обновление от Telegram:', JSON.stringify(update));
                // Обработка сообщения
                if (update.message && update.message.text) {
                    yield this.handleMessage(update.message);
                }
                // Обработка callback query (кнопок)
                if (update.callback_query) {
                    yield this.handleCallbackQuery(update.callback_query);
                }
            }
            catch (error) {
                console.error('Ошибка обработки обновления Telegram:', error);
                throw error;
            }
        });
    }
    /**
     * Обработка текстового сообщения
     * @param message Сообщение от пользователя
     */
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = message.chat.id;
            const text = message.text || '';
            // Проверка команд
            if (text.startsWith('/start')) {
                yield this.sendMessage(chatId, 'Привет! Я бот для голосового перевода в реальном времени. Используйте мою мини-приложение для звонков с переводом.');
                yield this.sendAppLink(chatId);
            }
            else if (text.startsWith('/help')) {
                yield this.sendMessage(chatId, 'Я помогаю переводить голос в реальном времени во время звонков. Используйте мою мини-приложение для звонков с переводом.');
                yield this.sendAppLink(chatId);
            }
            else {
                // Простой ответ на любое другое сообщение
                yield this.sendMessage(chatId, 'Для использования переводчика, запустите мою мини-приложение.');
                yield this.sendAppLink(chatId);
            }
        });
    }
    /**
     * Обработка callback query (нажатия на кнопки)
     * @param callbackQuery Данные о нажатии кнопки
     */
    handleCallbackQuery(callbackQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            // В этой заглушке просто подтверждаем получение callback query
            yield axios_1.default.post(`${this.apiUrl}/answerCallbackQuery`, {
                callback_query_id: callbackQuery.id
            });
        });
    }
    /**
     * Отправка сообщения пользователю
     * @param chatId ID чата
     * @param text Текст сообщения
     */
    sendMessage(chatId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield axios_1.default.post(`${this.apiUrl}/sendMessage`, {
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'HTML'
                });
            }
            catch (error) {
                console.error('Ошибка отправки сообщения:', error);
                throw error;
            }
        });
    }
    /**
     * Отправка ссылки на мини-приложение
     * @param chatId ID чата
     */
    sendAppLink(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const botUsername = process.env.BOT_USERNAME || '';
                if (!botUsername) {
                    yield this.sendMessage(chatId, 'Ошибка: имя пользователя бота не настроено.');
                    return;
                }
                yield axios_1.default.post(`${this.apiUrl}/sendMessage`, {
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
            }
            catch (error) {
                console.error('Ошибка отправки ссылки на приложение:', error);
                throw error;
            }
        });
    }
    /**
     * Проверка данных инициализации Telegram Mini App
     * @param initData Строка с данными инициализации от Telegram
     * @returns true, если данные верны
     */
    verifyInitData(initData) {
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
        }
        catch (error) {
            console.error('Ошибка проверки initData:', error);
            return false;
        }
    }
}
exports.telegramService = new TelegramService();
