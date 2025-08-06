# 🏗️ Arquitetura do Sistema de Aquecimento de Chip

## 📋 Resumo dos Endpoints Existentes

### ✅ Endpoints Já Implementados

#### 🔐 Autenticação (`/api/auth`)
- `POST /device/register` - Registrar dispositivo Android
- `POST /device/login` - Login do dispositivo
- `POST /admin/login` - Login do administrador
- `POST /device/heartbeat` - Manter conexão ativa
- `POST /logout` - Logout
- `GET /verify` - Verificar token

#### 📋 Tarefas (`/api/tasks`)
- `GET /` - Listar todas as tarefas
- `POST /` - Criar nova tarefa
- `GET /device/:deviceId` - Tarefas de um dispositivo
- `GET /:id` - Detalhes de uma tarefa
- `PUT /:id/status` - Atualizar status da tarefa
- `DELETE /:id` - Deletar tarefa
- `POST /bulk` - Criar múltiplas tarefas
- `GET /stats` - Estatísticas das tarefas

#### 📱 Dispositivos (`/api/devices`)
- `GET /` - Listar dispositivos
- `GET /:id` - Detalhes do dispositivo
- `PUT /:id` - Atualizar dispositivo
- `DELETE /:id` - Deletar dispositivo
- `GET /stats/overview` - Visão geral dos dispositivos
- `POST /:id/ping` - Enviar ping para dispositivo
- `POST /bulk/action` - Ação em massa nos dispositivos

#### 📊 Analytics (`/api/analytics`)
- `GET /dashboard` - Dashboard principal
- `GET /tasks` - Análise de tarefas
- `GET /devices` - Análise de dispositivos
- `GET /export` - Exportar dados

#### 👨‍💼 Admin (`/api/admin`)
- `GET /dashboard` - Dashboard administrativo
- `GET /devices` - Gerenciar dispositivos
- `POST /devices/bulk-action` - Ações em massa
- `POST /tasks/bulk-create` - Criar tarefas em massa
- `DELETE /tasks/bulk-delete` - Deletar tarefas em massa
- `GET /system/status` - Status do sistema
- `POST /system/backup` - Backup do sistema
- `POST /broadcast` - Enviar mensagem para todos

## 🔄 Arquitetura de Comunicação

### 1. Fluxo de Autenticação
```
APK Android → Backend API → JWT Token → Autenticação
```

### 2. Fluxo de Tarefas
```
Backend → WebSocket → APK Android → WhatsApp → Resultado → Backend
```

### 3. Fluxo de Monitoramento
```
APK Android → Heartbeat → Backend → Dashboard Admin
```

## 📱 Arquitetura do APK Android

### 🏗️ Estrutura do APK

```
com.chipwarmup.android/
├── activities/
│   ├── MainActivity.java
│   ├── LoginActivity.java
│   └── DashboardActivity.java
├── services/
│   ├── TaskService.java
│   ├── WhatsAppService.java
│   └── BackgroundService.java
├── utils/
│   ├── ApiClient.java
│   ├── TaskExecutor.java
│   └── WhatsAppHelper.java
└── receivers/
    └── TaskReceiver.java
```

### 🔌 Conectores WhatsApp

#### 1. WhatsApp Normal
```java
// Usando Accessibility Service
public class WhatsAppAccessibilityService extends AccessibilityService {
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Interceptar eventos do WhatsApp
        if (event.getPackageName().equals("com.whatsapp")) {
            handleWhatsAppEvent(event);
        }
    }
    
    private void handleWhatsAppEvent(AccessibilityEvent event) {
        // Executar ações baseadas no tipo de tarefa
        switch (currentTask.getType()) {
            case "whatsapp_message":
                sendMessage(currentTask.getParameters());
                break;
            case "whatsapp_call":
                makeCall(currentTask.getParameters());
                break;
            // ... outros tipos
        }
    }
}
```

#### 2. WhatsApp Business
```java
// Usando Intent e Broadcast Receivers
public class WhatsAppBusinessHelper {
    
    public void sendBusinessMessage(String phone, String message) {
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setPackage("com.whatsapp.w4b");
        intent.putExtra("jid", phone + "@s.whatsapp.net");
        intent.putExtra("message", message);
        intent.setType("text/plain");
        startActivity(intent);
    }
    
    public void joinBusinessGroup(String groupLink) {
        // Implementar lógica para entrar em grupos
        // Usando Accessibility Service para navegar na interface
    }
}
```

### 🔄 Serviço de Tarefas

```java
public class TaskService extends Service {
    
    private ApiClient apiClient;
    private TaskExecutor taskExecutor;
    private Handler handler;
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Conectar ao WebSocket do backend
        connectWebSocket();
        
        // Iniciar polling de tarefas
        startTaskPolling();
        
        return START_STICKY;
    }
    
    private void connectWebSocket() {
        // Conectar ao WebSocket do backend
        // Receber tarefas em tempo real
        webSocket.onMessage(new WebSocketListener() {
            @Override
            public void onMessage(String message) {
                Task task = parseTask(message);
                executeTask(task);
            }
        });
    }
    
    private void executeTask(Task task) {
        switch (task.getType()) {
            case "whatsapp_message":
                taskExecutor.sendWhatsAppMessage(task);
                break;
            case "whatsapp_call":
                taskExecutor.makeWhatsAppCall(task);
                break;
            case "whatsapp_group":
                taskExecutor.joinWhatsAppGroup(task);
                break;
            // ... outros tipos
        }
    }
}
```

## 🔧 Implementação das Tarefas

### 📱 Tipos de Tarefas Implementadas

#### 1. Mensagens WhatsApp
```java
public class WhatsAppMessageTask {
    
    public void execute(Task task) {
        Parameters params = task.getParameters();
        
        // Abrir WhatsApp
        openWhatsApp();
        
        // Navegar para contato
        navigateToContact(params.getPhone());
        
        // Enviar mensagem
        sendMessage(params.getMessage());
        
        // Aguardar confirmação
        waitForDelivery();
        
        // Reportar sucesso
        reportTaskCompleted(task.getId(), "success");
    }
}
```

#### 2. Chamadas WhatsApp
```java
public class WhatsAppCallTask {
    
    public void execute(Task task) {
        Parameters params = task.getParameters();
        
        // Abrir WhatsApp
        openWhatsApp();
        
        // Navegar para contato
        navigateToContact(params.getPhone());
        
        // Iniciar chamada
        startCall(params.getCallType()); // audio/video
        
        // Aguardar duração especificada
        waitForDuration(params.getDuration());
        
        // Encerrar chamada
        endCall();
        
        // Reportar conclusão
        reportTaskCompleted(task.getId(), "success");
    }
}
```

#### 3. Grupos WhatsApp
```java
public class WhatsAppGroupTask {
    
    public void execute(Task task) {
        Parameters params = task.getParameters();
        
        switch (params.getAction()) {
            case "join":
                joinGroup(params.getGroupLink());
                break;
            case "create":
                createGroup(params.getContacts());
                break;
            case "interact":
                interactInGroup(params.getGroupId(), params.getMessages());
                break;
        }
    }
}
```

## 🔐 Permissões Necessárias

### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🔄 Fluxo Completo de Execução

### 1. Inicialização do APK
```
1. APK inicia
2. Verifica permissões
3. Conecta ao backend
4. Registra dispositivo
5. Inicia serviços em background
```

### 2. Recebimento de Tarefas
```
1. Backend envia tarefa via WebSocket
2. APK recebe e processa
3. Verifica se WhatsApp está disponível
4. Executa tarefa usando Accessibility Service
5. Reporta resultado para backend
```

### 3. Execução de Tarefa
```
1. Abrir WhatsApp/WhatsApp Business
2. Navegar para funcionalidade específica
3. Executar ação (enviar msg, fazer chamada, etc.)
4. Aguardar confirmação
5. Capturar resultado
6. Enviar relatório para backend
```

## 📊 Monitoramento e Logs

### Logs do APK
```java
public class Logger {
    
    public static void logTaskExecution(String taskId, String action, String result) {
        Log.d("TaskExecutor", String.format(
            "Task: %s, Action: %s, Result: %s", 
            taskId, action, result
        ));
        
        // Enviar para backend
        apiClient.sendLog(taskId, action, result);
    }
}
```

### Métricas de Performance
- Tempo de execução por tarefa
- Taxa de sucesso
- Uso de recursos (CPU, memória)
- Status da conexão
- Status do WhatsApp

## 🔒 Segurança

### Autenticação
- JWT tokens para autenticação
- Refresh tokens automáticos
- Validação de certificados SSL

### Proteção de Dados
- Criptografia de dados sensíveis
- Não armazenar senhas localmente
- Logs seguros sem dados pessoais

## 🚀 Deploy e Distribuição

### Build do APK
```bash
# Gerar APK de release
./gradlew assembleRelease

# Assinar APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk alias_name
```

### Distribuição
- Google Play Store (versão pública)
- APK direto para clientes
- Sistema de atualizações automáticas

## 📈 Escalabilidade

### Otimizações
- Pool de conexões HTTP
- Cache local de tarefas
- Execução em background
- Gerenciamento de memória

### Monitoramento
- Métricas de performance
- Alertas de falha
- Logs centralizados
- Dashboard de status

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente
```java
public class Config {
    public static final String API_BASE_URL = "https://api.chipwarmup.com";
    public static final String WEBSOCKET_URL = "wss://api.chipwarmup.com";
    public static final int TASK_POLLING_INTERVAL = 30000; // 30 segundos
    public static final int HEARTBEAT_INTERVAL = 60000; // 1 minuto
}
```

### Configuração de Debug
```java
public class DebugConfig {
    public static final boolean ENABLE_LOGS = BuildConfig.DEBUG;
    public static final boolean MOCK_TASKS = false;
    public static final String MOCK_SERVER = "http://10.0.2.2:3000";
}
```

## 📋 Checklist de Implementação

### ✅ Backend (Já Implementado)
- [x] API REST completa
- [x] WebSocket para comunicação em tempo real
- [x] Sistema de autenticação JWT
- [x] Geração automática de tarefas
- [x] Dashboard administrativo
- [x] Sistema de logs e monitoramento

### 🔄 APK Android (A Implementar)
- [ ] Estrutura básica do projeto
- [ ] Sistema de autenticação
- [ ] Conectores WhatsApp/WhatsApp Business
- [ ] Executor de tarefas
- [ ] Serviços em background
- [ ] Interface de usuário
- [ ] Sistema de logs
- [ ] Testes automatizados
- [ ] Build e distribuição

### 🔧 Integração
- [ ] Testes de conectividade
- [ ] Validação de tarefas
- [ ] Monitoramento de performance
- [ ] Sistema de fallback
- [ ] Documentação de uso

## 🎯 Próximos Passos

1. **Desenvolver APK Android** com a arquitetura descrita
2. **Implementar conectores** para WhatsApp e WhatsApp Business
3. **Criar interface de usuário** para monitoramento
4. **Testar integração** com o backend existente
5. **Implementar sistema de logs** e monitoramento
6. **Configurar distribuição** e atualizações automáticas

O sistema backend já está completo e pronto para receber conexões do APK Android. Todos os endpoints necessários para o processo de aquecimento de 21 dias estão implementados e funcionais. 