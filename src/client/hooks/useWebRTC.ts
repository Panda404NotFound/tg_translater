import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Статусы соединения
enum ConnectionStatus {
  DISCONNECTED = 'Отключено',
  CONNECTING = 'Подключение...',
  CONNECTED = 'Подключено',
  ERROR = 'Ошибка'
}

// Интерфейс для ледовых кандидатов
interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
}

export function useWebRTC() {
  // Состояния
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>(ConnectionStatus.DISCONNECTED);
  
  // Ссылки для сохранения объектов между рендерами
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const callIdRef = useRef<string | null>(null);

  // Конфигурация ICE серверов (STUN/TURN)
  const iceServers = JSON.parse(process.env.ICE_SERVERS || '[{"urls":"stun:stun.l.google.com:19302"}]');
  
  // Инициализация сокета для сигналинга
  useEffect(() => {
    // Подключаемся к серверу сигналинга
    const socket = io(process.env.CLIENT_URL || 'http://localhost:8080');
    
    socket.on('connect', () => {
      console.log('Соединение с сервером сигналинга установлено');
    });
    
    socket.on('disconnect', () => {
      console.log('Соединение с сервером сигналинга потеряно');
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
    });

    socketRef.current = socket;
    
    // Очистка при размонтировании
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Инициализация медиа-потока
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Ошибка доступа к медиа-устройствам:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
      throw error;
    }
  }, []);

  // Инициализация соединения WebRTC
  const initPeerConnection = useCallback((stream: MediaStream) => {
    // Создаем RTCPeerConnection с ICE серверами
    const peerConnection = new RTCPeerConnection({ iceServers });
    
    // Добавляем все треки из локального потока в соединение
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
    
    // Создаем поток для удаленного пользователя
    const remote = new MediaStream();
    setRemoteStream(remote);
    
    // Обработчик новых треков
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remote.addTrack(track);
      });
    };

    // Обработчик ICE кандидатов
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && callIdRef.current) {
        socketRef.current.emit('ice-candidate', {
          callId: callIdRef.current,
          candidate: event.candidate
        });
      }
    };

    // Обработчик изменения состояния ICE
    peerConnection.oniceconnectionstatechange = () => {
      switch (peerConnection.iceConnectionState) {
        case 'connected':
        case 'completed':
          setConnectionStatus(ConnectionStatus.CONNECTED);
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          setConnectionStatus(ConnectionStatus.DISCONNECTED);
          break;
        default:
          break;
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [iceServers]);

  // Обработчики событий сигналинга
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Обработка входящего предложения (SDP Offer)
    socket.on('offer', async (data: { callId: string, sdp: RTCSessionDescriptionInit }) => {
      if (data.callId !== callIdRef.current) return;
      
      try {
        if (!peerConnectionRef.current) {
          const stream = await initLocalStream();
          initPeerConnection(stream);
        }

        const peerConnection = peerConnectionRef.current!;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('answer', {
          callId: data.callId,
          sdp: answer
        });
        
        setConnectionStatus(ConnectionStatus.CONNECTING);
      } catch (error) {
        console.error('Ошибка обработки предложения:', error);
        setConnectionStatus(ConnectionStatus.ERROR);
      }
    });

    // Обработка входящего ответа (SDP Answer)
    socket.on('answer', async (data: { callId: string, sdp: RTCSessionDescriptionInit }) => {
      if (data.callId !== callIdRef.current || !peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setConnectionStatus(ConnectionStatus.CONNECTING);
      } catch (error) {
        console.error('Ошибка обработки ответа:', error);
        setConnectionStatus(ConnectionStatus.ERROR);
      }
    });

    // Обработка ICE кандидатов
    socket.on('ice-candidate', async (data: { callId: string, candidate: IceCandidate }) => {
      if (data.callId !== callIdRef.current || !peerConnectionRef.current) return;
      
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Ошибка добавления ICE кандидата:', error);
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [initLocalStream, initPeerConnection]);

  // Начать звонок (создать новую комнату)
  const startCall = useCallback(async (callId: string) => {
    try {
      callIdRef.current = callId;
      setConnectionStatus(ConnectionStatus.CONNECTING);

      // Инициализируем локальный поток и соединение
      const stream = await initLocalStream();
      const peerConnection = initPeerConnection(stream);
      
      // Создаем SDP предложение
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Отправляем предложение через сигнальный сервер
      socketRef.current?.emit('create-call', {
        callId,
        sdp: offer
      });
      
    } catch (error) {
      console.error('Ошибка при создании звонка:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
    }
  }, [initLocalStream, initPeerConnection]);

  // Присоединиться к существующему звонку
  const joinCall = useCallback(async (callId: string) => {
    try {
      callIdRef.current = callId;
      setConnectionStatus(ConnectionStatus.CONNECTING);

      // Инициализируем локальный поток
      await initLocalStream();
      
      // Отправляем запрос на присоединение
      socketRef.current?.emit('join-call', { callId });
      
    } catch (error) {
      console.error('Ошибка при присоединении к звонку:', error);
      setConnectionStatus(ConnectionStatus.ERROR);
    }
  }, [initLocalStream]);

  // Завершить звонок
  const endCall = useCallback(() => {
    // Закрываем соединение
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Освобождаем медиа-ресурсы
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    callIdRef.current = null;
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    
    // Уведомляем сервер о завершении звонка
    if (socketRef.current) {
      socketRef.current.emit('end-call', { callId: callIdRef.current });
    }
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    connectionStatus,
    startCall,
    joinCall,
    endCall
  };
} 