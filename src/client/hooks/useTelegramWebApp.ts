import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function useTelegramWebApp() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>('');
  const [theme, setTheme] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      // Инициализируем экран
      WebApp.ready();
      WebApp.expand();
      
      // Получаем данные пользователя
      if (WebApp.initDataUnsafe.user) {
        setUser(WebApp.initDataUnsafe.user);
      }
      
      // Получаем init_data
      setInitData(WebApp.initData);
      
      // Получаем тему
      const colorScheme = WebApp.colorScheme;
      setTheme({
        bg_color: WebApp.themeParams.bg_color,
        text_color: WebApp.themeParams.text_color,
        hint_color: WebApp.themeParams.hint_color,
        link_color: WebApp.themeParams.link_color,
        button_color: WebApp.themeParams.button_color,
        button_text_color: WebApp.themeParams.button_text_color,
        secondary_bg_color: WebApp.themeParams.secondary_bg_color,
        colorScheme
      });
      
      // Добавляем слушатель изменения темы
      WebApp.onEvent('themeChanged', () => {
        setTheme({
          bg_color: WebApp.themeParams.bg_color,
          text_color: WebApp.themeParams.text_color,
          hint_color: WebApp.themeParams.hint_color,
          link_color: WebApp.themeParams.link_color,
          button_color: WebApp.themeParams.button_color,
          button_text_color: WebApp.themeParams.button_text_color,
          secondary_bg_color: WebApp.themeParams.secondary_bg_color,
          colorScheme: WebApp.colorScheme
        });
      });
    } catch (error) {
      console.error('Ошибка инициализации Telegram WebApp:', error);
    }
  }, []);

  // Функция для отправки данных обратно в Telegram
  const sendData = (data: any) => {
    WebApp.sendData(JSON.stringify(data));
  };

  // Функция для закрытия приложения
  const close = () => {
    WebApp.close();
  };

  // Функция для настройки кнопки главного меню
  const setupMainButton = (text: string, color?: string, textColor?: string) => {
    WebApp.MainButton.setText(text);
    
    if (color) {
      WebApp.MainButton.setBackgroundColor(color);
    }
    
    if (textColor) {
      WebApp.MainButton.setTextColor(textColor);
    }
    
    WebApp.MainButton.show();
    
    return {
      onClick: (callback: () => void) => {
        WebApp.MainButton.onClick(callback);
        return () => WebApp.MainButton.offClick(callback);
      },
      hide: () => WebApp.MainButton.hide(),
      show: () => WebApp.MainButton.show()
    };
  };

  return {
    user,
    initData,
    theme,
    sendData,
    close,
    setupMainButton,
    webApp: WebApp
  };
} 