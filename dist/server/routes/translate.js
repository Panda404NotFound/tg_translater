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
const translate_1 = require("../services/translate");
const router = expressModule.Router();
/**
 * POST /api/translate
 * Маршрут для перевода текста
 */
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const translatedText = yield translate_1.translateService.translateText(text, sourceLanguage, targetLanguage);
        return res.json({
            success: true,
            translatedText,
            sourceLanguage,
            targetLanguage
        });
    }
    catch (error) {
        console.error('Ошибка при переводе текста:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка при выполнении перевода',
            error: error instanceof Error ? error.message : String(error)
        });
    }
}));
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
exports.default = router;
