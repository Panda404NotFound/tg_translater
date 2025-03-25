// Объявления типов для серверных модулей
declare module 'express' {
  export interface Request {
    body: any;
    params: any;
    query: any;
  }
  
  export interface Response {
    status(code: number): Response;
    json(data: any): void;
    send(data: any): void;
    sendFile(path: string): void;
    sendStatus(code: number): void;
  }
  
  export interface Router {
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    use(path: string, router: any): void;
  }
  
  // Методы и свойства модуля express
  export const json: () => any;
  export const static: (path: string) => any;
  export const Router: () => Router;
  
  export interface Express {
    use(middleware: any): any;
    use(path: string, router: any): any;
    listen(port: number, callback?: () => void): any;
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
  }
  
  // Функция express
  export default function express(): Express;
}

declare module 'socket.io' {
  export interface Server {
    on(event: string, callback: (socket: Socket) => void): void;
    emit(event: string, data: any): void;
    to(room: string): { emit: (event: string, data: any) => void };
  }
  
  export interface Socket {
    id: string;
    on(event: string, callback: (data: any) => void): void;
    emit(event: string, data: any): void;
    join(room: string): void;
    leave(room: string): void;
    to(room: string): { emit: (event: string, data: any) => void };
    broadcast: { to: (room: string) => { emit: (event: string, data: any) => void } };
  }
  
  export interface SocketIoOptions {
    cors?: {
      origin: string | string[];
      methods?: string[];
    };
  }
  
  export default function io(server: any, options?: SocketIoOptions): Server;
}

declare module 'http' {
  import * as net from 'net';
  
  export interface Server extends net.Server {}
  export function createServer(requestListener?: (req: any, res: any) => void): Server;
}

declare module 'cors' {
  export default function cors(options?: any): (req: any, res: any, next: any) => void;
}

declare module 'path' {
  export function join(...paths: string[]): string;
}

declare module 'dotenv' {
  export function config(): void;
}

declare module 'crypto' {
  export function randomBytes(size: number): { toString(encoding: string): string };
} 