# TSEL VPS Installation - SOLUÇÃO DEFINITIVA COMPLETA

## 🚀 Instalação Completa em Um Comando

Este é o método mais simples e definitivo para instalar o TSEL em sua VPS Ubuntu 24.04+ com **FRONTEND MODERNO**, **BACKEND COMPLETO**, **REPOSITÓRIO DE APKs** e **DOCUMENTAÇÃO INTEGRADA**.

### Comando Único de Instalação COMPLETA

```bash
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-complete.sh | sudo bash
```

**Este comando irá:**
- ✅ Instalar Node.js 18.x corretamente
- ✅ Instalar MongoDB 7.0 (compatível com Ubuntu 24.04+)
- ✅ Instalar Redis e Nginx
- ✅ Configurar todos os serviços
- ✅ Instalar e configurar o TSEL
- ✅ **Construir frontend moderno em React**
- ✅ **Configurar repositório de APKs Android**
- ✅ **Criar documentação completa integrada**
- ✅ Resolver todos os problemas de dependências

## 🌟 NOVAS FUNCIONALIDADES

### 📱 Repositório de APKs Android
- **Stable**: Versões estáveis para produção
- **Beta**: Versões beta para testes
- **Alpha**: Versões alpha para desenvolvimento
- **Acesso via web**: `http://seu-ip-da-vps/apks/`

### 📚 Documentação Integrada
- **Guia de instalação**: `http://seu-ip-da-vps/docs/INSTALLATION_GUIDE.md`
- **Documentação da API**: `http://seu-ip-da-vps/docs/API_DOCUMENTATION.md`
- **Guia do APK Android**: `http://seu-ip-da-vps/docs/ANDROID_APK_GUIDE.md`

### 🌐 Frontend Moderno
- Interface web moderna em React
- Dashboard administrativo completo
- Monitoramento em tempo real
- Gerenciamento de dispositivos e tarefas

### 🔧 Backend Completo
- API REST com todos os endpoints
- WebSocket para comunicação em tempo real
- Sistema de autenticação JWT
- Geração automática de tarefas

## 🔧 Script de Correção Rápida

Se você já tem o TSEL instalado mas está com problemas de Node.js/npm:

```bash
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-node-npm.sh | sudo bash
```

**Este script irá:**
- ✅ Corrigir instalação do Node.js
- ✅ Atualizar npm para versão mais recente
- ✅ Reinstalar todas as dependências
- ✅ Testar todos os imports
- ✅ Reiniciar o serviço TSEL

## 📋 Script Completo com Validação

Para uma instalação mais detalhada com validações completas:

```bash
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-definitive.sh | sudo bash
```

**Este script inclui:**
- ✅ Verificação completa do sistema
- ✅ Instalação passo a passo com logs detalhados
- ✅ Validação de todos os componentes
- ✅ Configuração de monitoramento
- ✅ Relatório de instalação completo

## 🎯 Problemas Resolvidos

### Node.js e npm
- ❌ **Problema**: Node.js não instala corretamente no Ubuntu 24.04+
- ✅ **Solução**: Remoção completa + instalação via NodeSource

- ❌ **Problema**: npm com versão antiga ou corrompida
- ✅ **Solução**: Atualização forçada para versão mais recente

- ❌ **Problema**: Dependências não instalam corretamente
- ✅ **Solução**: Limpeza de cache + instalação com flags específicos

### MongoDB
- ❌ **Problema**: MongoDB não compatível com Ubuntu 24.04+
- ✅ **Solução**: Forçar instalação MongoDB 7.0 via repositório oficial

### Dependências Críticas
- ❌ **Problema**: moment.js não funciona
- ✅ **Solução**: Instalação específica da versão 2.29.4

- ❌ **Problema**: Imports falham
- ✅ **Solução**: Teste e correção automática de todos os imports

### Frontend e APKs
- ❌ **Problema**: Frontend não construído
- ✅ **Solução**: Build automático do React

- ❌ **Problema**: Sem repositório de APKs
- ✅ **Solução**: Criação automática do repositório

- ❌ **Problema**: Sem documentação
- ✅ **Solução**: Documentação completa integrada

## 📊 Verificação da Instalação

Após a instalação, verifique se tudo está funcionando:

```bash
# Verificar status dos serviços
systemctl status tsel mongod redis-server nginx

# Verificar versões
node --version
npm --version

# Testar imports
cd /opt/tsel && node scripts/test-imports.js

# Verificar logs
journalctl -u tsel -f

# Verificar frontend
curl http://localhost

# Verificar APKs
curl http://localhost/apks/

# Verificar documentação
curl http://localhost/docs/
```

## 🌐 Acesso ao Sistema

Após a instalação bem-sucedida:

- **Frontend**: http://SEU-IP-DA-VPS
- **API**: http://SEU-IP-DA-VPS:3001
- **APKs**: http://SEU-IP-DA-VPS/apks/
- **Documentação**: http://SEU-IP-DA-VPS/docs/
- **Login**: admin / admin123

## 🔧 Comandos Úteis

```bash
# Verificar status
systemctl status tsel

# Ver logs em tempo real
journalctl -u tsel -f

# Reiniciar serviço
systemctl restart tsel

# Atualizar sistema
cd /opt/tsel && git pull && npm install && systemctl restart tsel

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h

# Verificar APKs
ls -la /opt/tsel/uploads/apks/

# Verificar documentação
ls -la /opt/tsel/docs/
```

## 🚨 Troubleshooting

### Se o serviço não iniciar:
```bash
# Verificar logs detalhados
journalctl -u tsel --no-pager -n 50

# Verificar se as portas estão livres
netstat -tlnp | grep :3001

# Verificar permissões
ls -la /opt/tsel/
```

### Se o Node.js não funcionar:
```bash
# Executar script de correção
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/fix-node-npm.sh | sudo bash
```

### Se o MongoDB não funcionar:
```bash
# Verificar status
systemctl status mongod

# Reiniciar MongoDB
systemctl restart mongod

# Verificar logs
journalctl -u mongod -f
```

### Se o frontend não carregar:
```bash
# Verificar se foi construído
ls -la /opt/tsel/frontend/build/

# Reconstruir frontend
cd /opt/tsel/frontend && npm run build
```

### Se os APKs não estiverem disponíveis:
```bash
# Verificar repositório
ls -la /opt/tsel/uploads/apks/

# Recriar repositório
mkdir -p /opt/tsel/uploads/apks/{stable,beta,alpha}
chown -R tsel:tsel /opt/tsel/uploads/apks/
```

## 📈 Monitoramento

O sistema inclui monitoramento automático:
- **Script**: `/opt/tsel/scripts/monitor.sh`
- **Agendamento**: A cada 5 minutos
- **Logs**: `/opt/tsel/logs/monitor.log`

## 🔒 Segurança

- Firewall configurado automaticamente
- Usuário de serviço dedicado (tsel)
- Permissões restritas
- Secrets gerados automaticamente
- Headers de segurança no Nginx

## 📝 Relatório de Instalação

Após a instalação, um relatório completo é gerado em:
`/opt/tsel/INSTALLATION_REPORT.md`

## 🎉 Sucesso!

Com estes scripts, você terá uma instalação TSEL **COMPLETAMENTE FUNCIONAL** em sua VPS Ubuntu 24.04+ com:

- ✅ **Frontend moderno** em React
- ✅ **Backend completo** com todos os endpoints
- ✅ **Repositório de APKs** Android organizado
- ✅ **Documentação completa** integrada
- ✅ **Todos os problemas de Node.js e npm resolvidos**

**Para suporte adicional, consulte os logs em `/opt/tsel/logs/` e a documentação em `http://seu-ip-da-vps/docs/`** 