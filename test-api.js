/**
 * Script de teste da API Chip Warmup
 * Execute com: node test-api.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
let adminToken = null;
let deviceToken = null;
let deviceId = 'test-device-' + Date.now();

// Configurar axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;

// Função para fazer log colorido
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`)
};

// Teste de health check
async function testHealthCheck() {
  try {
    log.info('Testando health check...');
    const response = await axios.get('/health');
    
    if (response.data.status === 'OK') {
      log.success('Health check OK');
      return true;
    } else {
      log.error('Health check falhou');
      return false;
    }
  } catch (error) {
    log.error(`Health check erro: ${error.message}`);
    return false;
  }
}

// Teste de registro de dispositivo
async function testDeviceRegistration() {
  try {
    log.info('Testando registro de dispositivo...');
    
    const deviceData = {
      deviceId: deviceId,
      deviceName: 'Dispositivo de Teste',
      androidVersion: '13.0',
      appVersion: '1.0.0',
      manufacturer: 'Samsung',
      model: 'Galaxy S23'
    };
    
    const response = await axios.post('/auth/device/register', deviceData);
    
    if (response.data.success) {
      deviceToken = response.data.token;
      log.success('Dispositivo registrado com sucesso');
      return true;
    } else {
      log.error('Falha no registro do dispositivo');
      return false;
    }
  } catch (error) {
    log.error(`Erro no registro: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de login de admin
async function testAdminLogin() {
  try {
    log.info('Testando login de administrador...');
    
    const adminData = {
      email: 'admin@chipwarmup.com',
      password: 'admin123'
    };
    
    const response = await axios.post('/auth/admin/login', adminData);
    
    if (response.data.success) {
      adminToken = response.data.token;
      log.success('Login de admin realizado com sucesso');
      return true;
    } else {
      log.error('Falha no login de admin');
      return false;
    }
  } catch (error) {
    log.error(`Erro no login de admin: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de criação de tarefa
async function testTaskCreation() {
  try {
    log.info('Testando criação de tarefa...');
    
    const taskData = {
      deviceId: deviceId,
      type: 'whatsapp_message',
      parameters: {
        phone: '5511999999999',
        message: 'Mensagem de teste da API',
        delay: 5000
      },
      priority: 'normal',
      description: 'Tarefa de teste'
    };
    
    const response = await axios.post('/tasks', taskData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.data.success) {
      log.success('Tarefa criada com sucesso');
      return response.data.data._id;
    } else {
      log.error('Falha na criação da tarefa');
      return null;
    }
  } catch (error) {
    log.error(`Erro na criação da tarefa: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Teste de listagem de tarefas
async function testTaskListing() {
  try {
    log.info('Testando listagem de tarefas...');
    
    const response = await axios.get('/tasks', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.data.success) {
      log.success(`Listagem OK - ${response.data.data.length} tarefas encontradas`);
      return true;
    } else {
      log.error('Falha na listagem de tarefas');
      return false;
    }
  } catch (error) {
    log.error(`Erro na listagem: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de atualização de status da tarefa
async function testTaskStatusUpdate(taskId) {
  try {
    log.info('Testando atualização de status da tarefa...');
    
    const statusData = {
      status: 'completed',
      result: {
        messageId: 'msg_test_123',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await axios.put(`/tasks/${taskId}/status`, statusData, {
      headers: {
        'Authorization': `Bearer ${deviceToken}`
      }
    });
    
    if (response.data.success) {
      log.success('Status da tarefa atualizado com sucesso');
      return true;
    } else {
      log.error('Falha na atualização do status');
      return false;
    }
  } catch (error) {
    log.error(`Erro na atualização: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de listagem de dispositivos
async function testDeviceListing() {
  try {
    log.info('Testando listagem de dispositivos...');
    
    const response = await axios.get('/devices', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.data.success) {
      log.success(`Listagem OK - ${response.data.data.length} dispositivos encontrados`);
      return true;
    } else {
      log.error('Falha na listagem de dispositivos');
      return false;
    }
  } catch (error) {
    log.error(`Erro na listagem: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de analytics
async function testAnalytics() {
  try {
    log.info('Testando analytics...');
    
    const response = await axios.get('/analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.data.success) {
      log.success('Analytics carregados com sucesso');
      return true;
    } else {
      log.error('Falha no carregamento dos analytics');
      return false;
    }
  } catch (error) {
    log.error(`Erro nos analytics: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de heartbeat
async function testHeartbeat() {
  try {
    log.info('Testando heartbeat...');
    
    const response = await axios.post('/auth/device/heartbeat', {
      deviceId: deviceId
    }, {
      headers: {
        'Authorization': `Bearer ${deviceToken}`
      }
    });
    
    if (response.data.success) {
      log.success('Heartbeat enviado com sucesso');
      return true;
    } else {
      log.error('Falha no heartbeat');
      return false;
    }
  } catch (error) {
    log.error(`Erro no heartbeat: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Teste de verificação de token
async function testTokenVerification() {
  try {
    log.info('Testando verificação de token...');
    
    const response = await axios.get('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${deviceToken}`
      }
    });
    
    if (response.data.success) {
      log.success('Token verificado com sucesso');
      return true;
    } else {
      log.error('Falha na verificação do token');
      return false;
    }
  } catch (error) {
    log.error(`Erro na verificação: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  log.info('🚀 Iniciando testes da API Chip Warmup...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Registro de Dispositivo', fn: testDeviceRegistration },
    { name: 'Login de Admin', fn: testAdminLogin },
    { name: 'Verificação de Token', fn: testTokenVerification },
    { name: 'Criação de Tarefa', fn: testTaskCreation },
    { name: 'Listagem de Tarefas', fn: testTaskListing },
    { name: 'Listagem de Dispositivos', fn: testDeviceListing },
    { name: 'Analytics', fn: testAnalytics },
    { name: 'Heartbeat', fn: testHeartbeat }
  ];
  
  let passedTests = 0;
  let taskId = null;
  
  for (const test of tests) {
    log.info(`\n--- ${test.name} ---`);
    
    let result;
    if (test.name === 'Criação de Tarefa') {
      result = await test.fn();
      if (result) {
        taskId = result;
        passedTests++;
      }
    } else {
      result = await test.fn();
      if (result) {
        passedTests++;
      }
    }
  }
  
  // Teste adicional de atualização de status se a tarefa foi criada
  if (taskId) {
    log.info('\n--- Atualização de Status da Tarefa ---');
    const statusResult = await testTaskStatusUpdate(taskId);
    if (statusResult) {
      passedTests++;
    }
  }
  
  // Resumo dos testes
  log.info('\n' + '='.repeat(50));
  log.info(`📊 RESUMO DOS TESTES`);
  log.info(`Total de testes: ${tests.length + (taskId ? 1 : 0)}`);
  log.info(`Testes aprovados: ${passedTests}`);
  log.info(`Testes reprovados: ${tests.length + (taskId ? 1 : 0) - passedTests}`);
  
  if (passedTests === tests.length + (taskId ? 1 : 0)) {
    log.success('🎉 Todos os testes passaram!');
  } else {
    log.warning('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  log.info('='.repeat(50));
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runTests().catch(error => {
    log.error(`Erro fatal nos testes: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHealthCheck,
  testDeviceRegistration,
  testAdminLogin,
  testTaskCreation,
  testTaskListing,
  testDeviceListing,
  testAnalytics,
  testHeartbeat,
  testTokenVerification,
  testTaskStatusUpdate
}; 