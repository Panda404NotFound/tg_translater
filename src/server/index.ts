import express from 'express';
import * as expressModule from 'express';
import http from 'http';
import cors from 'cors';
import socketIo from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { setupSocket } from './socket';
import routes from './routes';

// Загружаем переменные окружения
dotenv.config();

// Определяем порт
const PORT = process.env.PORT || 8080;

// Создаем экземпляр приложения Express
const app = express();

// Middleware
app.use(cors());
app.use(expressModule.json());

// Раздача статических файлов в production
if (process.env.NODE_ENV === 'production') {
  app.use(expressModule.static(path.join(__dirname, '../../client')));
}

// API маршруты
app.use('/api', routes);

// Fallback для клиентских маршрутов в production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
  });
}

// Создаем HTTP сервер
const server = http.createServer(app as any);

// Настраиваем Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Настраиваем обработчики сокетов
setupSocket(server);

// Запускаем сервер
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT} в режиме ${process.env.NODE_ENV || 'development'}`);
}); 