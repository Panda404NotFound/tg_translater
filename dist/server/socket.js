"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
// Хранилище активных комнат
const activeRooms = new Map();
/**
 * Настройка обработчиков сокетов
 * @param server Экземпляр HTTP сервера
 */
const setupSocket = (server) => {
    const io = (0, socket_io_1.default)(server);
    // Обработка подключения клиента
    io.on('connection', (socket) => {
        console.log(`Клиент подключен: ${socket.id}`);
        // Создание нового звонка
        socket.on('create-call', (data) => {
            const { callId, sdp } = data;
            // Создаем новую комнату для звонка
            const room = {
                id: callId,
                participants: [socket.id],
                created: new Date()
            };
            activeRooms.set(callId, room);
            socket.join(callId);
            console.log(`Создан новый звонок: ${callId}`);
        });
        // Присоединение к существующему звонку
        socket.on('join-call', (data) => {
            const { callId } = data;
            const room = activeRooms.get(callId);
            if (!room) {
                socket.emit('error', { message: 'Звонок не найден' });
                return;
            }
            // Добавляем пользователя в комнату
            room.participants.push(socket.id);
            socket.join(callId);
            // Запрашиваем SDP предложение у первого участника
            const hostId = room.participants[0];
            io.to(hostId).emit('request-offer', { callId, participantId: socket.id });
            console.log(`Пользователь ${socket.id} присоединился к звонку ${callId}`);
        });
        // Передача SDP предложения
        socket.on('offer', (data) => {
            const { callId, sdp } = data;
            socket.to(callId).emit('offer', { callId, sdp });
            console.log(`Предложение отправлено в комнату ${callId}`);
        });
        // Передача SDP ответа
        socket.on('answer', (data) => {
            const { callId, sdp } = data;
            socket.to(callId).emit('answer', { callId, sdp });
            console.log(`Ответ отправлен в комнату ${callId}`);
        });
        // Передача ICE кандидатов
        socket.on('ice-candidate', (data) => {
            const { callId, candidate } = data;
            socket.to(callId).emit('ice-candidate', { callId, candidate });
        });
        // Завершение звонка
        socket.on('end-call', (data) => {
            const { callId } = data;
            if (activeRooms.has(callId)) {
                // Отправляем уведомление всем участникам
                socket.to(callId).emit('call-ended', { callId, participantId: socket.id });
                // Удаляем комнату, если это был последний участник
                const room = activeRooms.get(callId);
                room.participants = room.participants.filter(id => id !== socket.id);
                if (room.participants.length === 0) {
                    activeRooms.delete(callId);
                    console.log(`Звонок ${callId} завершен и удален`);
                }
                // Покидаем комнату
                socket.leave(callId);
            }
        });
        // Обработка отключения клиента
        socket.on('disconnect', () => {
            console.log(`Клиент отключен: ${socket.id}`);
            // Находим все звонки, в которых участвовал пользователь
            for (const [callId, room] of activeRooms.entries()) {
                if (room.participants.includes(socket.id)) {
                    // Удаляем пользователя из комнаты
                    room.participants = room.participants.filter(id => id !== socket.id);
                    // Уведомляем остальных участников
                    socket.to(callId).emit('participant-left', { callId, participantId: socket.id });
                    // Удаляем комнату, если нет участников
                    if (room.participants.length === 0) {
                        activeRooms.delete(callId);
                        console.log(`Звонок ${callId} завершен и удален после отключения участника`);
                    }
                }
            }
        });
    });
};
exports.setupSocket = setupSocket;
