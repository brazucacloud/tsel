# 🔧 Solução para Erro de Instalação TSEL

## ❌ Problema Identificado

O erro está ocorrendo porque:
1. **Dependências não instaladas**: A pasta `node_modules` não existe
2. **Middleware ausente**: A função `validateObjectId` não estava sendo exportada
3. **Node.js não encontrado**: O Node.js pode não estar instalado ou não estar no PATH

## ✅ Soluções

### 1. Instalar Dependências (Recomendado)

**Windows (PowerShell):**
```powershell
.\install-deps.ps1
```

**Windows (CMD):**
```cmd
install-deps.bat
```

**Linux/macOS:**
```bash
npm install
```

### 2. Verificar Node.js

Certifique-se de que o Node.js 18+ está instalado:

```bash
node --version
npm --version
```

Se não estiver instalado, baixe em: https://nodejs.org/

### 3. Instalar Dependências Manualmente

```bash
# Instalar todas as dependências
npm install

# Criar arquivo .env
cp env.example .env
```

### 4. Testar Importações

Após instalar as dependências, teste se tudo está funcionando:

```bash
node test-imports.js
```

### 5. Iniciar o Servidor

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## 🔍 Correções Aplicadas

1. **Adicionada função `validateObjectId`** no arquivo `middleware/validation.js`
2. **Criados scripts de instalação** para facilitar o processo
3. **Criado script de teste** para verificar importações

## 📋 Checklist de Verificação

- [ ] Node.js 18+ instalado
- [ ] npm instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado
- [ ] Teste de importações passou (`node test-imports.js`)
- [ ] Servidor inicia sem erros (`npm start`)

## 🚨 Se o Problema Persistir

1. **Limpar cache do npm:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verificar permissões:**
   ```bash
   # Linux/macOS
   sudo chown -R $USER:$GROUP ~/.npm
   sudo chown -R $USER:$GROUP .
   ```

3. **Usar versão específica do Node.js:**
   ```bash
   # Usando nvm
   nvm install 18.20.8
   nvm use 18.20.8
   ```

## 📞 Suporte

Se ainda houver problemas, verifique:
- Logs do sistema (`journalctl -u tsel.service`)
- Logs do Node.js (console.log)
- Configuração do MongoDB e Redis
- Variáveis de ambiente no arquivo `.env` 