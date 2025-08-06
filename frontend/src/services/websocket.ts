import { io, Socket } from 'socket.io-client';
import { 
  WebSocketMessage, 
  TaskUpdateMessage, 
  DeviceStatusMessage, 
  SystemAlertMessage 
} from '../types';

type WebSocketEventHandler = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado, WebSocket não conectado');
        return;
      }

      this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('admin_connected', { timestamp: new Date().toISOString() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Reconexão manual se o servidor desconectou
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo de tentativas de reconexão atingido');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconectado na tentativa ${attemptNumber}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Erro na reconexão WebSocket:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Falha na reconexão WebSocket');
    });

    // Eventos específicos do sistema
    this.socket.on('task_update', (data: TaskUpdateMessage) => {
      this.handleEvent('task_update', data);
    });

    this.socket.on('device_status', (data: DeviceStatusMessage) => {
      this.handleEvent('device_status', data);
    });

    this.socket.on('analytics_update', (data: any) => {
      this.handleEvent('analytics_update', data);
    });

    this.socket.on('system_alert', (data: SystemAlertMessage) => {
      this.handleEvent('system_alert', data);
    });

    this.socket.on('device_connected', (data: any) => {
      this.handleEvent('device_connected', data);
    });

    this.socket.on('device_disconnected', (data: any) => {
      this.handleEvent('device_disconnected', data);
    });

    this.socket.on('task_started', (data: any) => {
      this.handleEvent('task_started', data);
    });

    this.socket.on('task_completed', (data: any) => {
      this.handleEvent('task_completed', data);
    });

    this.socket.on('task_failed', (data: any) => {
      this.handleEvent('task_failed', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('Erro WebSocket:', error);
      this.handleEvent('error', error);
    });
  }

  private handleEvent(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Erro no handler do evento ${eventType}:`, error);
        }
      });
    }
  }

  // Métodos públicos
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket não conectado, não foi possível emitir evento:', event);
    }
  }

  public on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler?: WebSocketEventHandler): void {
    if (!handler) {
      // Remove todos os handlers do evento
      this.eventHandlers.delete(event);
    } else {
      // Remove apenas o handler específico
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers.clear();
    }
  }

  public reconnect(): void {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Métodos específicos para o sistema
  public subscribeToDevice(deviceId: string): void {
    this.emit('subscribe_device', { deviceId });
  }

  public unsubscribeFromDevice(deviceId: string): void {
    this.emit('unsubscribe_device', { deviceId });
  }

  public subscribeToTask(taskId: string): void {
    this.emit('subscribe_task', { taskId });
  }

  public unsubscribeFromTask(taskId: string): void {
    this.emit('unsubscribe_task', { taskId });
  }

  public subscribeToAnalytics(): void {
    this.emit('subscribe_analytics');
  }

  public unsubscribeFromAnalytics(): void {
    this.emit('unsubscribe_analytics');
  }

  public sendMessage(deviceId: string, message: string): void {
    this.emit('send_message', { deviceId, message });
  }

  public broadcastMessage(message: string, deviceIds?: string[]): void {
    this.emit('broadcast_message', { message, deviceIds });
  }

  public pingDevice(deviceId: string): void {
    this.emit('ping_device', { deviceId });
  }

  public restartDevice(deviceId: string): void {
    this.emit('restart_device', { deviceId });
  }

  public stopDevice(deviceId: string): void {
    this.emit('stop_device', { deviceId });
  }

  public startDevice(deviceId: string): void {
    this.emit('start_device', { deviceId });
  }

  public cancelTask(taskId: string): void {
    this.emit('cancel_task', { taskId });
  }

  public retryTask(taskId: string): void {
    this.emit('retry_task', { taskId });
  }

  public pauseTask(taskId: string): void {
    this.emit('pause_task', { taskId });
  }

  public resumeTask(taskId: string): void {
    this.emit('resume_task', { taskId });
  }

  // Utilitários
  public getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  public getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

// Instância singleton
const webSocketService = new WebSocketService();
export default webSocketService; 