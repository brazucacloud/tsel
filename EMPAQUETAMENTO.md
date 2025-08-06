# 📦 Guia de Empacotamento - Chip Warmup API

Este guia fornece instruções detalhadas para empacotar e distribuir o sistema Chip Warmup API em diferentes formatos e plataformas.

## 🎯 Opções de Empacotamento

### 1. **Empacotamento Básico**

#### ZIP (Padrão)
```bash
# ZIP básico
npm run package:zip

# ZIP para plataforma específica
npm run package:win      # Windows
npm run package:linux    # Linux
npm run package:mac      # macOS
```

#### TAR.GZ
```bash
# Arquivo TAR.GZ
npm run package:tar
```

#### Executável
```bash
# Executável (requer pkg)
npm run package:exe
```

### 2. **Empacotamento Avançado**

#### Versão Mínima (sem frontend)
```bash
npm run package:minimal
```

#### Build de Produção
```bash
npm run package:prod
```

#### Versão Completa (com dependências)
```bash
npm run package:full
```

#### Todas as Plataformas
```bash
npm run package:all
```

### 3. **Criação de Releases**

#### Release Padrão
```bash
npm run release
```

#### Release por Plataforma
```bash
npm run release:win      # Apenas Windows
npm run release:linux    # Apenas Linux
npm run release:mac      # Apenas macOS
npm run release:all      # Todas as plataformas
```

#### Release de Produção
```bash
npm run release:prod     # Build de produção
npm run release:full     # Completo com dependências
```

## 🛠️ Scripts Diretos

### Script de Empacotamento
```bash
# Uso básico
node scripts/package.js

# Com opções
node scripts/package.js --format=zip --platform=win
node scripts/package.js --include-deps --production
node scripts/package.js --minimal --format=tar
node scripts/package.js --help
```

### Script de Release
```bash
# Uso básico
node scripts/create-release.js

# Com opções
node scripts/create-release.js --version=2.0.0
node scripts/create-release.js --platform=all --production
node scripts/create-release.js --include-deps --help
```

## 📋 Opções Disponíveis

### Formato de Saída
- `--format=zip` - Arquivo ZIP (padrão)
- `--format=tar` - Arquivo TAR.GZ
- `--format=exe` - Executável

### Plataforma
- `--platform=win` - Windows
- `--platform=linux` - Linux
- `--platform=mac` - macOS
- `--platform=all` - Todas as plataformas

### Configurações
- `--include-deps` - Incluir node_modules
- `--minimal` - Versão mínima (sem frontend)
- `--production` - Build de produção
- `--version=1.0.0` - Versão específica (apenas release)

## 📦 Conteúdo dos Pacotes

### Arquivos Incluídos
- `package.json` - Configuração do projeto
- `server.js` - Servidor principal
- `install.bat` - Instalador Windows
- `install.sh` - Instalador Linux/macOS
- `install.ps1` - Instalador PowerShell
- `install.js` - Instalador universal
- `env.example` - Configuração de exemplo
- `README.md` - Documentação principal
- `INSTALL.md` - Guia de instalação (inglês)
- `INSTALACAO.md` - Guia de instalação (português)
- `Dockerfile` - Configuração Docker
- `docker-compose.yml` - Orquestração Docker

### Diretórios Incluídos
- `config/` - Configurações
- `middleware/` - Middlewares
- `models/` - Modelos de dados
- `routes/` - Rotas da API
- `scripts/` - Scripts utilitários
- `docs/` - Documentação
- `examples/` - Exemplos
- `frontend/` - Interface web (exceto versão mínima)

### Arquivos Excluídos
- `.git/` - Controle de versão
- `node_modules/` - Dependências (exceto com --include-deps)
- `logs/` - Logs
- `uploads/` - Uploads
- `backups/` - Backups
- `.env` - Configurações locais
- `*.log` - Arquivos de log

## 🚀 Exemplos Práticos

### 1. **Empacotamento para Distribuição**

#### Windows
```bash
# ZIP para Windows
npm run package:win

# Executável para Windows
npm run package:exe --platform=win
```

#### Linux
```bash
# ZIP para Linux
npm run package:linux

# TAR.GZ para Linux
node scripts/package.js --format=tar --platform=linux
```

#### macOS
```bash
# ZIP para macOS
npm run package:mac

# Executável para macOS
npm run package:exe --platform=mac
```

### 2. **Release Completo**

#### Release para Todas as Plataformas
```bash
npm run release:all
```

#### Release de Produção
```bash
npm run release:prod
```

#### Release com Dependências
```bash
npm run release:full
```

### 3. **Empacotamento Personalizado**

#### Versão Mínima para Linux
```bash
node scripts/package.js --format=tar --platform=linux --minimal
```

#### Build de Produção para Windows
```bash
node scripts/package.js --format=zip --platform=win --production
```

#### Executável Completo
```bash
node scripts/package.js --format=exe --include-deps --production
```

## 📁 Estrutura de Release

### Diretório de Release
```
releases/
└── v1.0.0/
    ├── chip-warmup-api-v1.0.0-win.zip
    ├── chip-warmup-api-v1.0.0-linux.zip
    ├── chip-warmup-api-v1.0.0-mac.zip
    ├── CHANGELOG.md
    ├── INSTALAR.md
    ├── RELEASE_NOTES.md
    └── checksums.txt
```

### Conteúdo dos Arquivos

#### CHANGELOG.md
- Histórico de mudanças
- Novas funcionalidades
- Correções de bugs
- Instruções de instalação

#### INSTALAR.md
- Guia de instalação rápida
- Comandos para cada plataforma
- Informações de acesso
- Usuários padrão

#### RELEASE_NOTES.md
- Lista de arquivos incluídos
- Instruções detalhadas
- Informações de verificação
- Suporte

#### checksums.txt
- Checksums MD5 e SHA256
- Tamanhos dos arquivos
- Verificação de integridade

## 🔧 Configuração Avançada

### Configuração do pkg (Executáveis)
```json
{
  "pkg": {
    "assets": [
      "config/**/*",
      "middleware/**/*",
      "models/**/*",
      "routes/**/*",
      "scripts/**/*",
      "frontend/build/**/*",
      "env.example",
      "install.bat",
      "install.sh",
      "install.ps1",
      "install.js"
    ],
    "targets": [
      "node18-win-x64",
      "node18-linux-x64",
      "node18-macos-x64"
    ],
    "outputPath": "dist"
  }
}
```

### Configuração de Binário
```json
{
  "bin": {
    "chip-warmup": "./install.js"
  }
}
```

## 📊 Tamanhos Típicos

### ZIP Básico
- **Sem dependências**: ~2-5 MB
- **Com dependências**: ~50-100 MB
- **Versão mínima**: ~1-3 MB

### TAR.GZ
- **Sem dependências**: ~1-3 MB
- **Com dependências**: ~30-60 MB
- **Versão mínima**: ~0.5-2 MB

### Executável
- **Windows**: ~50-80 MB
- **Linux**: ~40-70 MB
- **macOS**: ~45-75 MB

## 🚨 Solução de Problemas

### Erro: pkg não encontrado
```bash
# Instalar pkg globalmente
npm install -g pkg

# Ou usar apenas ZIP/TAR
npm run package:zip
```

### Erro: Dependências não encontradas
```bash
# Instalar dependências de empacotamento
npm install archiver tar pkg --save-dev
```

### Erro: Permissões
```bash
# Dar permissões de execução
chmod +x scripts/package.js
chmod +x scripts/create-release.js
```

### Erro: Espaço insuficiente
```bash
# Usar versão mínima
npm run package:minimal

# Ou limpar cache
npm cache clean --force
```

## 📈 Otimizações

### Reduzir Tamanho
1. Use `--minimal` para versão sem frontend
2. Exclua `node_modules` (instale no destino)
3. Use TAR.GZ em vez de ZIP
4. Remova arquivos desnecessários

### Melhorar Performance
1. Use `--production` para build otimizado
2. Inclua apenas arquivos essenciais
3. Comprima com nível máximo
4. Use checksums para verificação

### Distribuição
1. Crie releases organizados por versão
2. Inclua documentação completa
3. Forneça múltiplos formatos
4. Mantenha histórico de releases

## 🎯 Fluxo de Trabalho Recomendado

### 1. **Desenvolvimento**
```bash
# Testar empacotamento básico
npm run package:zip

# Verificar conteúdo
unzip -l chip-warmup-api-*.zip
```

### 2. **Teste**
```bash
# Empacotar para todas as plataformas
npm run package:all

# Testar instalação em cada plataforma
```

### 3. **Release**
```bash
# Criar release completo
npm run release:prod

# Verificar arquivos gerados
ls -la releases/v1.0.0/
```

### 4. **Distribuição**
```bash
# Compactar diretório de release
zip -r chip-warmup-api-v1.0.0-release.zip releases/v1.0.0/

# Fazer upload para repositório
# Criar tag no Git
```

---

**📦 Sistema de Empacotamento Completo** - Distribua seu projeto de forma profissional! 🚀 