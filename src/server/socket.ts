import http from 'http';
import socketIo from 'socket.io';

// Интерфейс для комнат (звонков)
interface CallRoom {
  id: string;
  participants: string[];
  created: Date;
}

// Хранилище активных комнат
const activeRooms: Map<string, CallRoom> = new Map();

/**
 * Настройка обработчиков сокетов
 * @param server Экземпляр HTTP сервера
 */
export const setupSocket = (server: http.Server): void => {
  const io = socketIo(server);

  // Обработка подключения клиента
  io.on('connection', (socket) => {
    console.log(`Клиент подключен: ${socket.id}`);
    
    // Создание нового звонка
    socket.on('create-call', (data: { callId: string, sdp: RTCSessionDescriptionInit }) => {
      const { callId, sdp } = data;
      
      // Создаем новую комнату для звонка
      const room: CallRoom = {
        id: callId,
        participants: [socket.id],
        created: new Date()
      };
      
      activeRooms.set(callId, room);
      socket.join(callId);
      
      console.log(`Создан новый звонок: ${callId}`);
    });

    // Присоединение к существующему звонку
    socket.on('join-call', (data: { callId: string }) => {
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
    socket.on('offer', (data: { callId: string, sdp: RTCSessionDescriptionInit }) => {
      const { callId, sdp } = data;
      
      socket.to(callId).emit('offer', { callId, sdp });
      console.log(`Предложение отправлено в комнату ${callId}`);
    });
    
    // Передача SDP ответа
    socket.on('answer', (data: { callId: string, sdp: RTCSessionDescriptionInit }) => {
      const { callId, sdp } = data;
      
      socket.to(callId).emit('answer', { callId, sdp });
      console.log(`Ответ отправлен в комнату ${callId}`);
    });
    
    // Передача ICE кандидатов
    socket.on('ice-candidate', (data: { callId: string, candidate: RTCIceCandidate }) => {
      const { callId, candidate } = data;
      
      socket.to(callId).emit('ice-candidate', { callId, candidate });
    });
    
    // Завершение звонка
    socket.on('end-call', (data: { callId: string }) => {
      const { callId } = data;
      
      if (activeRooms.has(callId)) {
        // Отправляем уведомление всем участникам
        socket.to(callId).emit('call-ended', { callId, participantId: socket.id });
        
        // Удаляем комнату, если это был последний участник
        const room = activeRooms.get(callId)!;
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
} 