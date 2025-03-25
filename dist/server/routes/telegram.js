"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const expressModule = __importStar(require("express"));
const telegram_1 = require("../services/telegram");
const router = expressModule.Router();
/**
 * POST /api/telegram/webhook
 * Обработчик вебхуков от Telegram Bot API
 */
router.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield telegram_1.telegramService.handleUpdate(update);
        // Telegram ожидает HTTP 200 в ответ на вебхук
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('Ошибка обработки вебхука Telegram:', error);
        // Даже при ошибке лучше вернуть 200, чтобы Telegram не ретраил запрос
        return res.sendStatus(200);
    }
}));
/**
 * GET /api/telegram/init
 * Получение данных для инициализации Telegram Mini App
 */
router.get('/init', (req, res) => {
    try {
        // Проверка авторизации
        const botToken = process.env.BOT_TOKEN;
        const initData = req.query.initData;
        if (!initData) {
            return res.status(400).json({
                success: false,
                message: 'Отсутствуют данные инициализации Telegram'
            });
        }
        // Верификация initData (в реальном приложении здесь будет проверка подписи)
        const isValid = telegram_1.telegramService.verifyInitData(initData);
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
    }
    catch (error) {
        console.error('Ошибка инициализации Telegram Mini App:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
