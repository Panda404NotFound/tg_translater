# Голосовой Переводчик для Telegram

Telegram Mini App для перевода голоса в реальном времени во время звонков.

## Описание

Приложение позволяет совершать звонки через Telegram с функцией автоматического перевода речи собеседника в реальном времени. Идеально подходит для общения с людьми на других языках без необходимости знания их языка.

## Функциональность

- WebRTC звонки с видео и аудио
- Перевод речи в реальном времени
- Поддержка множества языков
- Интеграция с Telegram через Mini App
- Простой и интуитивно понятный интерфейс

## Технологии

- **Фронтенд:** React.js, TypeScript
- **Бэкенд:** Node.js, Express, Socket.IO
- **Перевод:** Google Cloud Speech-to-Text API, Translation API
- **Коммуникация:** WebRTC для P2P звонков
- **Деплой:** Доступно как Telegram Mini App

## Установка и запуск

### Предварительные требования

- Node.js 14.x или выше
- npm или yarn
- Зарегистрированный Telegram бот через @BotFather

### Установка

1. Клонировать репозиторий:
   ```bash
   git clone https://github.com/yourusername/tg-translator.git
   cd tg-translator
   ```

2. Установить зависимости:
   ```bash
   npm install
   ```

3. Создать файл `.env` на основе `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Заполнить `.env` файл своими данными:
   ```
   BOT_TOKEN=your_bot_token_here
   BOT_USERNAME=your_bot_username_here
   TRANSLATION_API_KEY=your_translation_api_key_here
   ```

### Запуск для разработки

1. Запустить сервер разработки:
   ```bash
   npm run dev
   ```

2. Открыть [http://localhost:3000](http://localhost:3000) в браузере для просмотра клиентской части.

### Сборка для продакшна

1. Собрать проект:
   ```bash
   npm run build
   ```

2. Запустить собранное приложение:
   ```bash
   npm start
   ```

## Тестирование

Запуск тестов:
```bash
npm test
```

## Структура проекта

```
tg-translator/
├── src/                  # Исходный код
│   ├── client/           # Клиентская часть (React)
│   │   ├── components/   # React компоненты
│   │   ├── hooks/        # Пользовательские хуки
│   │   ├── utils/        # Вспомогательные функции
│   │   ├── services/     # Сервисы для работы с API
│   │   ├── styles/       # CSS стили
│   │   └── assets/       # Статические ресурсы
│   └── server/           # Серверная часть (Node.js)
│       ├── controllers/  # Контроллеры
│       ├── routes/       # Маршруты API
│       ├── services/     # Бизнес-логика
│       ├── utils/        # Вспомогательные функции
│       ├── middleware/   # Промежуточное ПО Express
│       └── config/       # Конфигурация
├── tests/                # Тесты
├── dist/                 # Скомпилированный код
├── public/               # Публичные статические файлы
├── .env.example          # Пример переменных окружения
├── package.json          # Зависимости и скрипты
└── README.md             # Документация проекта
```

## Интеграция с Telegram

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Настройте мини-приложение через BotFather:
   - Выберите вашего бота
   - Выберите "Edit Bot" > "Menu Button" > "Configure menu button"
   - Установите URL вашего приложения

## Лицензия

MIT 