import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../src/client/App';

// Мокаем WebApp API из Telegram
jest.mock('@twa-dev/sdk', () => ({
  WebApp: {
    ready: jest.fn(),
    expand: jest.fn(),
    BackButton: {
      onClick: jest.fn(),
      hide: jest.fn(),
      show: jest.fn(),
    },
    initDataUnsafe: {
      user: {
        id: 12345,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
      },
    },
    initData: 'test_init_data',
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#2481cc',
      button_color: '#2481cc',
      button_text_color: '#ffffff',
      secondary_bg_color: '#f0f0f0',
    },
    colorScheme: 'light',
    onEvent: jest.fn(),
  },
}));

// Мокаем пользовательские хуки
jest.mock('../../src/client/hooks/useWebRTC', () => ({
  useWebRTC: () => ({
    localStream: null,
    remoteStream: null,
    connectionStatus: 'Отключено',
    startCall: jest.fn(),
    joinCall: jest.fn(),
    endCall: jest.fn(),
  }),
}));

jest.mock('../../src/client/hooks/useTranslation', () => ({
  useTranslation: () => ({
    translatedText: '',
    isTranslating: false,
    translateAudio: jest.fn(),
  }),
}));

jest.mock('../../src/client/hooks/useTelegramWebApp', () => ({
  useTelegramWebApp: () => ({
    user: {
      id: 12345,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
    },
    initData: 'test_init_data',
    theme: {
      bg_color: '#ffffff',
      text_color: '#000000',
    },
  }),
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    
    // Проверяем, что компонент отрисовался успешно
    const headingElement = screen.getByText(/Голосовой Переводчик/i);
    expect(headingElement).toBeInTheDocument();
    
    // Проверяем наличие кнопок
    const startCallButton = screen.getByText(/Начать новый звонок/i);
    expect(startCallButton).toBeInTheDocument();
    
    const joinCallButton = screen.getByText(/Присоединиться к звонку/i);
    expect(joinCallButton).toBeInTheDocument();
  });
}); 