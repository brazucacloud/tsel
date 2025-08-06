#!/usr/bin/env node

/**
 * Script para testar a integração completa entre backend e cliente Android
 * Simula o comportamento de um APK Android real
 */

const AndroidClient = require('../examples/android-connection-example');
const axios = require('axios');

class IntegrationTest {
  constructor() {
    this.apiUrl = 'http://localhost:3000';
    this.adminToken = null;
    this.deviceId = `test-device-${Date.now()}`;
    this.client = null;
  }

  async setup() {
    console.log('🔧 Configurando teste de integração...');
    
    // Fazer login como admin
    await this.adminLogin();
    
    // Criar tarefas de teste
    await this.createTestTasks();
    
    console.log('✅ Setup concluído');
  }

  async adminLogin() {
    try {
      console.log('👨‍💼 Fazendo login como admin...');
      
      const response = await axios.post(`${this.apiUrl}/api/auth/admin/login`, {
        email: 'admin@chipwarmup.com',
        password: 'admin123'
      });

      this.adminToken = response.data.token;
      console.log('✅ Login admin realizado');
      
    } catch (error) {
      console.error('❌ Erro no login admin:', error.message);
      throw error;
    }
  }

  async createTestTasks() {
    try {
      console.log('📋 Criando tarefas de teste...');
      
      const testTasks = [
        {
          deviceId: this.deviceId,
          type: 'whatsapp_message',
          parameters: {
            action: 'conversation',
            count: 1,
            period: 'morning',
            contacts: ['5511999999999'],
            messages: ['Olá! Esta é uma mensagem de teste do sistema de aquecimento.']
          },
          description: 'Teste - Enviar mensagem WhatsApp',
          priority: 'high'
        },
        {
          deviceId: this.deviceId,
          type: 'whatsapp_call',
          parameters: {
            action: 'make_call',
            phone: '5511888888888',
            callType: 'audio',
            duration: 30 // segundos
          },
          description: 'Teste - Fazer chamada de áudio',
          priority: 'normal'
        },
        {
          deviceId: this.deviceId,
          type: 'whatsapp_status',
          parameters: {
            action: 'post_status',
            content: 'Status de teste do sistema de aquecimento! 🔥',
            type: 'text'
          },
          description: 'Teste - Postar status',
          priority: 'normal'
        },
        {
          deviceId: this.deviceId,
          type: 'whatsapp_profile',
          parameters: {
            action: 'update_name',
            name: 'Usuário Teste'
          },
          description: 'Teste - Atualizar nome do perfil',
          priority: 'low'
        }
      ];

      for (const task of testTasks) {
        await axios.post(
          `${this.apiUrl}/api/tasks`,
          task,
          {
            headers: {
              'Authorization': `Bearer ${this.adminToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`✅ Tarefa criada: ${task.description}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar tarefas:', error.message);
      throw error;
    }
  }

  async startAndroidClient() {
    console.log('📱 Iniciando cliente Android simulado...');
    
    this.client = new AndroidClient(this.deviceId, this.apiUrl);
    
    try {
      await this.client.start();
      console.log('✅ Cliente Android iniciado');
    } catch (error) {
      console.error('❌ Erro ao iniciar cliente:', error.message);
      throw error;
    }
  }

  async monitorProgress() {
    console.log('📊 Monitorando progresso...');
    
    let completedTasks = 0;
    const totalTasks = 4;
    
    const checkProgress = async () => {
      try {
        const response = await axios.get(
          `${this.apiUrl}/api/tasks/device/${this.deviceId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.adminToken}`
            }
          }
        );

        const tasks = response.data.tasks || [];
        const completed = tasks.filter(task => task.status === 'completed').length;
        
        if (completed > completedTasks) {
          completedTasks = completed;
          console.log(`📈 Progresso: ${completed}/${totalTasks} tarefas concluídas`);
          
          if (completed === totalTasks) {
            console.log('🎉 Todas as tarefas foram concluídas!');
            await this.cleanup();
            process.exit(0);
          }
        }
        
      } catch (error) {
        console.error('❌ Erro ao verificar progresso:', error.message);
      }
    };

    // Verificar progresso a cada 5 segundos
    setInterval(checkProgress, 5000);
  }

  async showAnalytics() {
    try {
      console.log('\n📊 Analytics do sistema:');
      
      // Dashboard geral
      const dashboardResponse = await axios.get(
        `${this.apiUrl}/api/analytics/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`
          }
        }
      );

      const dashboard = dashboardResponse.data;
      console.log('📈 Dashboard:');
      console.log(`- Total de dispositivos: ${dashboard.totalDevices}`);
      console.log(`- Dispositivos online: ${dashboard.onlineDevices}`);
      console.log(`- Total de tarefas: ${dashboard.totalTasks}`);
      console.log(`- Tarefas pendentes: ${dashboard.pendingTasks}`);
      console.log(`- Tarefas concluídas: ${dashboard.completedTasks}`);
      
      // Estatísticas de tarefas
      const tasksResponse = await axios.get(
        `${this.apiUrl}/api/tasks/stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`
          }
        }
      );

      const stats = tasksResponse.data;
      console.log('\n📋 Estatísticas de Tarefas:');
      console.log(`- Taxa de sucesso: ${stats.successRate}%`);
      console.log(`- Tempo médio de execução: ${stats.avgExecutionTime}ms`);
      console.log(`- Tarefas por tipo:`, stats.tasksByType);
      
    } catch (error) {
      console.error('❌ Erro ao obter analytics:', error.message);
    }
  }

  async cleanup() {
    console.log('🧹 Fazendo limpeza...');
    
    try {
      // Parar cliente Android
      if (this.client) {
        await this.client.stop();
      }
      
      // Deletar tarefas de teste
      const tasksResponse = await axios.get(
        `${this.apiUrl}/api/tasks/device/${this.deviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.adminToken}`
          }
        }
      );

      const tasks = tasksResponse.data.tasks || [];
      for (const task of tasks) {
        await axios.delete(
          `${this.apiUrl}/api/tasks/${task._id}`,
          {
            headers: {
              'Authorization': `Bearer ${this.adminToken}`
            }
          }
        );
      }
      
      console.log('✅ Limpeza concluída');
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error.message);
    }
  }

  async run() {
    console.log('🚀 Iniciando teste de integração completa...\n');
    
    try {
      // Setup inicial
      await this.setup();
      
      // Mostrar analytics iniciais
      await this.showAnalytics();
      
      // Iniciar cliente Android
      await this.startAndroidClient();
      
      // Monitorar progresso
      await this.monitorProgress();
      
      // Manter rodando por 2 minutos
      setTimeout(async () => {
        console.log('\n⏰ Tempo limite atingido');
        await this.cleanup();
        process.exit(0);
      }, 120000);
      
    } catch (error) {
      console.error('❌ Erro no teste:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Executar teste
async function main() {
  const test = new IntegrationTest();
  
  // Capturar sinal de interrupção
  process.on('SIGINT', async () => {
    console.log('\n🛑 Teste interrompido pelo usuário');
    await test.cleanup();
    process.exit(0);
  });
  
  await test.run();
}

// Executar se for o arquivo principal
if (require.main === module) {
  main();
}

module.exports = IntegrationTest; 