# 🔧 Solução para MongoDB em Ubuntu 22.04+

## 🚨 Problema Identificado

O erro que você encontrou é comum em Ubuntu 22.04+ porque o MongoDB 6.0 depende do `libssl1.1` que não está mais disponível por padrão.

## ✅ Soluções Disponíveis

### Solução 1: Usar o Script Corrigido (Recomendado)

Execute o script corrigido que detecta automaticamente a versão do Ubuntu:

```bash
# Baixar e executar o script corrigido
curl -fsSL https://raw.githubusercontent.com/brazucacloud/tsel/master/scripts/install-vps-git-fixed.sh | sudo bash
```

### Solução 2: Instalação Manual Corrigida

Se preferir fazer manualmente:

```bash
# 1. Limpar repositórios antigos do MongoDB
sudo rm -f /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update

# 2. Instalar MongoDB 7.0 (compatível com Ubuntu 22.04+)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. Atualizar e instalar
sudo apt update
sudo apt install -y mongodb-org

# 4. Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Solução 3: Usar MongoDB Community via Snap

```bash
# Instalar MongoDB via Snap (alternativa)
sudo snap install mongodb

# Iniciar o serviço
sudo snap start mongodb
```

## 🔍 Verificação da Instalação

Após instalar, verifique se está funcionando:

```bash
# Verificar status
sudo systemctl status mongod

# Verificar versão
mongod --version

# Testar conexão
mongosh --eval "db.runCommand('ping')"
```

## 📋 Comandos Úteis

### Gerenciamento do MongoDB
```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Parar MongoDB
sudo systemctl stop mongod

# Reiniciar MongoDB
sudo systemctl restart mongod

# Ver logs
sudo journalctl -u mongod -f

# Verificar se está rodando
sudo systemctl is-active mongod
```

### Backup e Restauração
```bash
# Backup
mongodump --out /backup/$(date +%Y%m%d)

# Restaurar
mongorestore /backup/20241201/
```

## 🛠️ Troubleshooting

### Se ainda houver problemas:

#### 1. Verificar dependências
```bash
# Verificar se libssl está instalado
dpkg -l | grep libssl

# Instalar libssl se necessário
sudo apt install libssl3
```

#### 2. Limpar cache do apt
```bash
sudo apt clean
sudo apt autoclean
sudo apt update
```

#### 3. Verificar conflitos
```bash
# Verificar se há outros repositórios MongoDB
ls /etc/apt/sources.list.d/ | grep mongodb

# Remover repositórios conflitantes
sudo rm /etc/apt/sources.list.d/mongodb-org-6.0.list
```

#### 4. Reinstalar completamente
```bash
# Remover MongoDB completamente
sudo apt remove --purge mongodb-org*
sudo rm -rf /var/lib/mongodb
sudo rm -rf /var/log/mongodb
sudo rm -rf /etc/mongodb.conf

# Reinstalar com a versão correta
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
```

## 📞 Suporte

Se ainda tiver problemas:

1. **Verifique a versão do Ubuntu**: `lsb_release -a`
2. **Verifique os logs**: `sudo journalctl -u mongod -f`
3. **Abra uma issue no GitHub**: https://github.com/brazucacloud/tsel/issues

## 🎯 Próximos Passos

Após resolver o problema do MongoDB:

1. **Continue com a instalação**: Execute o script corrigido
2. **Verifique todos os serviços**: `systemctl status mongod redis nginx`
3. **Teste o sistema**: Acesse http://seu-ip-da-vps
4. **Configure SSL**: Para produção, configure HTTPS

---

**💡 Dica**: O script corrigido (`install-vps-git-fixed.sh`) detecta automaticamente a versão do Ubuntu e instala a versão correta do MongoDB! 