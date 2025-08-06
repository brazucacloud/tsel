/**
 * Exemplo de cliente JavaScript para dispositivos Android
 * Este código pode ser usado com React Native ou Cordova
 */

class ChipWarmupClient {
  constructor(serverUrl, deviceId) {
    this.serverUrl = serverUrl;
    this.deviceId = deviceId;
    this.token = null;
    this.socket = null;
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Registra o dispositivo no servidor
   */
  async registerDevice(deviceInfo) {
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/device/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          deviceName: deviceInfo.deviceName,
          androidVersion: deviceInfo.androidVersion,
          appVersion: deviceInfo.appVersion,
          manufacturer: deviceInfo.manufacturer,
          model: deviceInfo.model
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.token;
        console.log('Dispositivo registrado com sucesso');
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
      throw error;
    }
  }

  /**
   * Faz login do dispositivo
   */
  async loginDevice() {
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/device/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: this.deviceId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.token;
        console.log('Login realizado com sucesso');
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Conecta ao WebSocket
   */
  connectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Usar Socket.IO client
    this.socket = io(this.serverUrl, {
      auth: {
        token: this.token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Conectado ao servidor');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Entrar na sala do dispositivo
      this.socket.emit('join-device', this.deviceId);
      
      // Iniciar heartbeat
      this.startHeartbeat();
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do servidor');
      this.isConnected = false;
      this.stopHeartbeat();
      
      // Tentar reconectar
      this.attemptReconnect();
    });

    this.socket.on('new-task', (task) => {
      console.log('Nova tarefa recebida:', task);
      this.executeTask(task);
    });

    this.socket.on('ping', (data) => {
      console.log('Ping recebido:', data);
      this.sendPong();
    });

    this.socket.on('broadcast-message', (message) => {
      console.log('Mensagem broadcast:', message);
      this.handleBroadcast(message);
    });

    this.socket.on('restart-device', () => {
      console.log('Comando de reinicialização recebido');
      this.restartDevice();
    });

    this.socket.on('update-app', (data) => {
      console.log('Atualização de app recebida:', data);
      this.updateApp(data);
    });

    this.socket.on('clear-cache', () => {
      console.log('Comando de limpeza de cache recebido');
      this.clearCache();
    });

    this.socket.on('send-message', (data) => {
      console.log('Comando de envio de mensagem recebido:', data);
      this.sendMessage(data);
    });
  }

  /**
   * Inicia o heartbeat
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 60000); // A cada 1 minuto
  }

  /**
   * Para o heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Envia heartbeat
   */
  async sendHeartbeat() {
    try {
      await fetch(`${this.serverUrl}/api/auth/device/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          deviceId: this.deviceId
        })
      });
    } catch (error) {
      console.error('Erro ao enviar heartbeat:', error);
    }
  }

  /**
   * Tenta reconectar
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Tentativa de reconexão ${this.reconnectAttempts} em ${delay}ms`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      console.error('Máximo de tentativas de reconexão atingido');
    }
  }

  /**
   * Executa uma tarefa
   */
  async executeTask(task) {
    try {
      console.log(`Executando tarefa ${task.taskId}:`, task);
      
      // Atualizar status para running
      await this.updateTaskStatus(task.taskId, 'running');
      
      let result;
      
      switch (task.type) {
        case 'whatsapp_message':
          result = await this.executeWhatsAppMessage(task.parameters);
          break;
        case 'whatsapp_media':
          result = await this.executeWhatsAppMedia(task.parameters);
          break;
        case 'instagram_post':
          result = await this.executeInstagramPost(task.parameters);
          break;
        case 'screenshot':
          result = await this.executeScreenshot(task.parameters);
          break;
        case 'custom_script':
          result = await this.executeCustomScript(task.parameters);
          break;
        default:
          throw new Error(`Tipo de tarefa não suportado: ${task.type}`);
      }
      
      // Atualizar status para completed
      await this.updateTaskStatus(task.taskId, 'completed', result);
      
    } catch (error) {
      console.error(`Erro ao executar tarefa ${task.taskId}:`, error);
      
      // Atualizar status para failed
      await this.updateTaskStatus(task.taskId, 'failed', null, {
        message: error.message,
        code: error.code || 'EXECUTION_ERROR'
      });
    }
  }

  /**
   * Atualiza o status de uma tarefa
   */
  async updateTaskStatus(taskId, status, result = null, error = null) {
    try {
      const body = { status };
      
      if (result) body.result = result;
      if (error) body.error = error;
      
      await fetch(`${this.serverUrl}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(body)
      });
      
      // Emitir evento via WebSocket também
      if (this.socket && this.isConnected) {
        this.socket.emit('task-completed', {
          taskId,
          deviceId: this.deviceId,
          status,
          result,
          error
        });
      }
      
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  }

  /**
   * Executa tarefa de mensagem WhatsApp
   */
  async executeWhatsAppMessage(parameters) {
    // Implementar integração com WhatsApp
    console.log('Executando mensagem WhatsApp:', parameters);
    
    // Simular execução
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      phone: parameters.phone
    };
  }

  /**
   * Executa tarefa de mídia WhatsApp
   */
  async executeWhatsAppMedia(parameters) {
    console.log('Executando mídia WhatsApp:', parameters);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      messageId: `media_${Date.now()}`,
      timestamp: new Date().toISOString(),
      phone: parameters.phone,
      mediaUrl: parameters.mediaUrl
    };
  }

  /**
   * Executa tarefa de post Instagram
   */
  async executeInstagramPost(parameters) {
    console.log('Executando post Instagram:', parameters);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return {
      postId: `post_${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: parameters.imageUrl
    };
  }

  /**
   * Executa screenshot
   */
  async executeScreenshot(parameters) {
    console.log('Executando screenshot:', parameters);
    
    // Implementar captura de tela
    const screenshotData = await this.captureScreen();
    
    return {
      screenshotUrl: screenshotData.url,
      timestamp: new Date().toISOString(),
      quality: parameters.quality || 80
    };
  }

  /**
   * Executa script customizado
   */
  async executeCustomScript(parameters) {
    console.log('Executando script customizado:', parameters);
    
    // Implementar execução de script
    const result = await this.runScript(parameters.script, parameters.variables);
    
    return {
      result,
      timestamp: new Date().toISOString(),
      executionTime: Date.now()
    };
  }

  /**
   * Captura tela (implementar conforme plataforma)
   */
  async captureScreen() {
    // Implementar conforme a plataforma (React Native, Cordova, etc.)
    return {
      url: `screenshot_${Date.now()}.png`
    };
  }

  /**
   * Executa script (implementar conforme plataforma)
   */
  async runScript(script, variables) {
    // Implementar conforme a plataforma
    return {
      output: 'Script executed successfully',
      variables
    };
  }

  /**
   * Envia pong em resposta ao ping
   */
  sendPong() {
    if (this.socket && this.isConnected) {
      this.socket.emit('pong', {
        deviceId: this.deviceId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Manipula mensagens broadcast
   */
  handleBroadcast(message) {
    // Implementar lógica para exibir notificação
    console.log('Exibindo notificação:', message.message);
  }

  /**
   * Reinicia o dispositivo
   */
  restartDevice() {
    // Implementar reinicialização conforme plataforma
    console.log('Reiniciando dispositivo...');
  }

  /**
   * Atualiza o app
   */
  updateApp(data) {
    // Implementar atualização conforme plataforma
    console.log('Atualizando app:', data);
  }

  /**
   * Limpa cache
   */
  clearCache() {
    // Implementar limpeza de cache conforme plataforma
    console.log('Limpando cache...');
  }

  /**
   * Envia mensagem
   */
  sendMessage(data) {
    // Implementar envio de mensagem conforme plataforma
    console.log('Enviando mensagem:', data);
  }

  /**
   * Desconecta do servidor
   */
  disconnect() {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
  }
}

// Exemplo de uso
async function main() {
  const client = new ChipWarmupClient('http://localhost:3000', 'device-123');
  
  try {
    // Registrar dispositivo
    await client.registerDevice({
      deviceName: 'Meu Android',
      androidVersion: '13.0',
      appVersion: '1.0.0',
      manufacturer: 'Samsung',
      model: 'Galaxy S23'
    });
    
    // Conectar WebSocket
    client.connectWebSocket();
    
  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChipWarmupClient;
} 