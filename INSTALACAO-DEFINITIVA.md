# TSEL VPS Installation - SOLUÇÃO DEFINITIVA

## 🚀 Instalação Completa em Um Comando

Este é o método mais simples e definitivo para instalar o TSEL em sua VPS Ubuntu 24.04+.

### Comando Único de Instalação

```bash
curl -sSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-one-command.sh | sudo bash
```

**Este comando irá:**
- ✅ Instalar Node.js 18.x corretamente
- ✅ Instalar MongoDB 7.0 (compatível com Ubuntu 24.04+)
- ✅ Instalar Redis e Nginx
- ✅ Configurar todos os serviços
- ✅ Instalar e configurar o TSEL
- ✅ Resolver todos os problemas de dependências

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
```

## 🌐 Acesso ao Sistema

Após a instalação bem-sucedida:

- **Frontend**: http://SEU-IP-DA-VPS
- **API**: http://SEU-IP-DA-VPS:3001
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

## 📝 Relatório de Instalação

Após a instalação, um relatório completo é gerado em:
`/opt/tsel/INSTALLATION_REPORT.md`

## 🎉 Sucesso!

Com estes scripts, você terá uma instalação TSEL completamente funcional em sua VPS Ubuntu 24.04+ com todos os problemas de Node.js e npm resolvidos definitivamente.

**Para suporte adicional, consulte os logs em `/opt/tsel/logs/`** 