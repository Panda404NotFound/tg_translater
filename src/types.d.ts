declare module 'react';
declare module 'react-dom/client';
declare module '@twa-dev/sdk' {
  interface WebApp {
    ready(): void;
    expand(): void;
    close(): void;
    sendData(data: string): void;
    MainButton: {
      setText(text: string): void;
      setBackgroundColor(color: string): void;
      setTextColor(color: string): void;
      show(): void;
      hide(): void;
      onClick(callback: () => void): void;
      offClick(callback: () => void): void;
    };
    BackButton: {
      show(): void;
      hide(): void;
      onClick(callback: () => void): void;
    };
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        is_premium?: boolean;
      };
    };
    initData: string;
    colorScheme: string;
    themeParams: {
      bg_color: string;
      text_color: string;
      hint_color: string;
      link_color: string;
      button_color: string;
      button_text_color: string;
      secondary_bg_color: string;
    };
    onEvent(eventName: string, callback: () => void): void;
  }
  const WebApp: WebApp;
  export default WebApp;
}

declare module 'socket.io-client';
declare module 'axios';

// Типы для React
import * as React from 'react';

declare global {
  namespace React {
    type FC<P = {}> = React.FunctionComponent<P>;
    type FormEvent<T = Element> = React.BaseSyntheticEvent<Event, EventTarget & T, EventTarget>;
  }
  
  // Типы для useState и других хуков React
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }
  
  // Типы для распознавания речи
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  
  // Типы для WebRTC и медиа устройств
  interface MediaDevices {
    getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }
}

// Декларация модулей
declare module '@twa-dev/sdk' {
  const WebApp: any;
  export default WebApp;
}

declare module 'socket.io-client' {
  export default function io(url?: string, options?: any): any;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    baseURL?: string;
    headers?: Record<string, string>;
  }
  
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
  }
  
  export interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }
  
  export function create(config?: AxiosRequestConfig): AxiosInstance;
  
  const axios: AxiosInstance & {
    create: typeof create;
  };
  
  export default axios;
}

// Хуки React
declare module 'react' {
  // useState
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  export function useState<T = undefined>(): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];

  // useEffect
  export function useEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;

  // useCallback
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T;

  // useRef
  export function useRef<T>(initialValue: T): React.MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): React.RefObject<T>;
  export function useRef<T = undefined>(): React.MutableRefObject<T | undefined>;

  // useMemo
  export function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T;
} 