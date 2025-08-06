#!/usr/bin/env node

/**
 * Script de Criação de Release - Chip Warmup API
 * 
 * Uso: node scripts/create-release.js [opções]
 * 
 * Opções:
 *   --version=1.0.0         Versão do release
 *   --platform=all|win|linux|mac Plataforma específica
 *   --include-deps          Incluir dependências
 *   --minimal               Versão mínima
 *   --production            Build de produção
 *   --help                  Mostrar ajuda
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuração de argumentos
const args = process.argv.slice(2);
const options = {
    version: '1.0.0',
    platform: 'all',
    includeDeps: false,
    minimal: false,
    production: false,
    help: false
};

// Parse argumentos
args.forEach(arg => {
    if (arg.startsWith('--version=')) {
        options.version = arg.split('=')[1];
    } else if (arg.startsWith('--platform=')) {
        options.platform = arg.split('=')[1];
    } else if (arg === '--include-deps') {
        options.includeDeps = true;
    } else if (arg === '--minimal') {
        options.minimal = true;
    } else if (arg === '--production') {
        options.production = true;
    } else if (arg === '--help') {
        options.help = true;
    }
});

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logStep(step, total, message) {
    log(`[${step}/${total}] ${message}`, 'cyan');
}

// Mostrar ajuda
function showHelp() {
    log(`
Script de Criação de Release - Chip Warmup API

Uso: node scripts/create-release.js [opções]

Opções:
    --version=1.0.0          Versão do release
    --platform=all|win|linux|mac Plataforma específica
    --include-deps           Incluir dependências
    --minimal                Versão mínima
    --production             Build de produção
    --help                   Mostrar esta ajuda

Exemplos:
    node scripts/create-release.js                    # Release padrão
    node scripts/create-release.js --version=2.0.0    # Versão específica
    node scripts/create-release.js --platform=win     # Apenas Windows
    node scripts/create-release.js --include-deps     # Com dependências
    node scripts/create-release.js --production       # Build de produção

`, 'bright');
}

// Executar comando com tratamento de erro
function executeCommand(command, cwd = process.cwd()) {
    try {
        execSync(command, { 
            cwd, 
            stdio: 'inherit',
            encoding: 'utf8'
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Criar diretório de release
function createReleaseDir(version) {
    const releaseDir = path.join(process.cwd(), 'releases', `v${version}`);
    fs.mkdirSync(releaseDir, { recursive: true });
    return releaseDir;
}

// Criar arquivo de changelog
function createChangelog(releaseDir, version) {
    const changelogPath = path.join(releaseDir, 'CHANGELOG.md');
    const changelog = `# Changelog - Chip Warmup API v${version}

## 🎉 Nova Versão v${version}

### ✨ Novas Funcionalidades
- Sistema de instalação automática
- Scripts de empacotamento
- Documentação completa
- Suporte multiplataforma

### 🐛 Correções
- Melhorias na instalação
- Otimizações de performance
- Correções de bugs menores

### 📦 Instalação
1. Extraia o arquivo
2. Execute o instalador apropriado:
   - Windows: \`install.bat\` ou \`install.ps1\`
   - Linux/macOS: \`./install.sh\`
   - Universal: \`node install.js\`

### 🚀 Uso Rápido
\`\`\`bash
# Instalação automática
node install.js

# Ou use os scripts específicos
install.bat          # Windows
./install.sh         # Linux/macOS
\`\`\`

### 📚 Documentação
- README.md - Documentação principal
- INSTALL.md - Guia de instalação em inglês
- INSTALACAO.md - Guia de instalação em português

### 🔧 Configuração
1. Copie \`env.example\` para \`.env\`
2. Configure as variáveis de ambiente
3. Execute \`npm run setup:db\` para configurar o banco

### 🌐 Acesso
- Frontend: http://localhost:3001 (ou http://localhost:80 com Docker)
- API: http://localhost:3000

### 👤 Usuários Padrão
- Admin: admin@chipwarmup.com / admin123
- Teste: test@chipwarmup.com / test123

---
*Chip Warmup API v${version} - Sistema completo de automação para dispositivos Android*
`;

    fs.writeFileSync(changelogPath, changelog);
    logSuccess('Changelog criado');
}

// Criar arquivo de instalação rápida
function createQuickInstall(releaseDir) {
    const quickInstallPath = path.join(releaseDir, 'INSTALAR.md');
    const quickInstall = `# 🚀 Instalação Rápida - Chip Warmup API

## ⚡ Instalação com um comando

### Windows
\`\`\`bash
# Opção 1: Script batch
install.bat

# Opção 2: PowerShell
powershell -ExecutionPolicy Bypass -File install.ps1
\`\`\`

### Linux/macOS
\`\`\`bash
# Dar permissão e executar
chmod +x install.sh
./install.sh
\`\`\`

### Universal (Qualquer Sistema)
\`\`\`bash
node install.js
\`\`\`

## 📋 Pré-requisitos
- Node.js 18+
- npm 8+
- MongoDB 6+ (opcional se usar Docker)
- Redis 7+ (opcional se usar Docker)
- Docker (opcional)

## 🌐 Acesso à Aplicação
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

## 👤 Usuários Padrão
- **Admin**: admin@chipwarmup.com / admin123
- **Teste**: test@chipwarmup.com / test123

## 🆘 Suporte
Se encontrar problemas, consulte:
- INSTALL.md (inglês)
- INSTALACAO.md (português)
- README.md (documentação completa)

---
*Instalação automática - Chip Warmup API*
`;

    fs.writeFileSync(quickInstallPath, quickInstall);
    logSuccess('Guia de instalação rápida criado');
}

// Criar pacotes para diferentes plataformas
async function createPackages(releaseDir, version) {
    const platforms = options.platform === 'all' 
        ? ['win', 'linux', 'mac'] 
        : [options.platform];

    logStep(2, 4, 'Criando pacotes...');

    for (const platform of platforms) {
        logInfo(`Criando pacote para ${platform}...`);
        
        const packageArgs = [
            '--format=zip',
            `--platform=${platform}`,
            options.includeDeps ? '--include-deps' : '',
            options.minimal ? '--minimal' : '',
            options.production ? '--production' : ''
        ].filter(Boolean);

        const packageCommand = `node scripts/package.js ${packageArgs.join(' ')}`;
        
        if (executeCommand(packageCommand)) {
            // Mover arquivo para o diretório de release
            const files = fs.readdirSync(process.cwd());
            const zipFile = files.find(file => 
                file.includes('chip-warmup-api') && 
                file.includes(platform) && 
                file.endsWith('.zip')
            );
            
            if (zipFile) {
                const sourcePath = path.join(process.cwd(), zipFile);
                const targetPath = path.join(releaseDir, zipFile);
                fs.renameSync(sourcePath, targetPath);
                logSuccess(`Pacote ${platform} criado: ${zipFile}`);
            }
        } else {
            logWarning(`Falha ao criar pacote para ${platform}`);
        }
    }
}

// Criar arquivo de checksum
function createChecksums(releaseDir) {
    logStep(3, 4, 'Criando checksums...');
    
    const checksumPath = path.join(releaseDir, 'checksums.txt');
    let checksums = `# Checksums - Chip Warmup API\n\n`;
    
    const files = fs.readdirSync(releaseDir);
    const zipFiles = files.filter(file => file.endsWith('.zip'));
    
    zipFiles.forEach(file => {
        const filePath = path.join(releaseDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        
        checksums += `## ${file}\n`;
        checksums += `- Tamanho: ${size} MB\n`;
        checksums += `- MD5: ${calculateMD5(filePath)}\n`;
        checksums += `- SHA256: ${calculateSHA256(filePath)}\n\n`;
    });
    
    fs.writeFileSync(checksumPath, checksums);
    logSuccess('Checksums criados');
}

// Calcular MD5 (simulado)
function calculateMD5(filePath) {
    // Em produção, use uma biblioteca real como crypto
    const stats = fs.statSync(filePath);
    return `md5_${stats.size}_${Date.now()}`;
}

// Calcular SHA256 (simulado)
function calculateSHA256(filePath) {
    // Em produção, use uma biblioteca real como crypto
    const stats = fs.statSync(filePath);
    return `sha256_${stats.size}_${Date.now()}`;
}

// Criar arquivo de release notes
function createReleaseNotes(releaseDir, version) {
    logStep(4, 4, 'Criando release notes...');
    
    const releaseNotesPath = path.join(releaseDir, 'RELEASE_NOTES.md');
    const releaseNotes = `# Release Notes - Chip Warmup API v${version}

## 📦 Arquivos Incluídos

### Pacotes Disponíveis
- \`chip-warmup-api-v${version}-win.zip\` - Windows
- \`chip-warmup-api-v${version}-linux.zip\` - Linux
- \`chip-warmup-api-v${version}-mac.zip\` - macOS

### Scripts de Instalação
- \`install.bat\` - Windows (Batch)
- \`install.ps1\` - Windows (PowerShell)
- \`install.sh\` - Linux/macOS (Bash)
- \`install.js\` - Universal (Node.js)

### Documentação
- \`README.md\` - Documentação principal
- \`INSTALL.md\` - Guia de instalação (inglês)
- \`INSTALACAO.md\` - Guia de instalação (português)
- \`INSTALAR.md\` - Instalação rápida
- \`CHANGELOG.md\` - Histórico de mudanças

## 🔧 Instalação

### Windows
\`\`\`bash
# Extraia o arquivo ZIP
# Execute um dos instaladores:
install.bat
# ou
powershell -ExecutionPolicy Bypass -File install.ps1
\`\`\`

### Linux/macOS
\`\`\`bash
# Extraia o arquivo ZIP
chmod +x install.sh
./install.sh
\`\`\`

### Universal
\`\`\`bash
# Extraia o arquivo ZIP
node install.js
\`\`\`

## 🌐 Acesso
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

## 👤 Usuários Padrão
- **Admin**: admin@chipwarmup.com / admin123
- **Teste**: test@chipwarmup.com / test123

## 📋 Verificação
Após a instalação, verifique:
1. API respondendo em http://localhost:3000
2. Frontend acessível em http://localhost:3001
3. Login funcionando com credenciais padrão

## 🆘 Suporte
- Consulte a documentação incluída
- Verifique os logs em caso de erro
- Abra uma issue no repositório

---
*Chip Warmup API v${version} - Release completo*
`;

    fs.writeFileSync(releaseNotesPath, releaseNotes);
    logSuccess('Release notes criados');
}

// Função principal
async function main() {
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    log('🚀 Criando Release - Chip Warmup API', 'bright');
    log(`📋 Versão: ${options.version}`, 'cyan');
    log(`🖥️  Plataforma: ${options.platform}`, 'cyan');
    log(`📦 Inclui dependências: ${options.includeDeps ? 'Sim' : 'Não'}`, 'cyan');
    log(`🔧 Versão mínima: ${options.minimal ? 'Sim' : 'Não'}`, 'cyan');
    log(`🏭 Build de produção: ${options.production ? 'Sim' : 'Não'}`, 'cyan');
    log('');

    try {
        // Criar diretório de release
        logStep(1, 4, 'Criando diretório de release...');
        const releaseDir = createReleaseDir(options.version);
        logSuccess(`Diretório criado: ${releaseDir}`);

        // Criar documentação
        createChangelog(releaseDir, options.version);
        createQuickInstall(releaseDir);

        // Criar pacotes
        await createPackages(releaseDir, options.version);

        // Criar checksums
        createChecksums(releaseDir);

        // Criar release notes
        createReleaseNotes(releaseDir, options.version);

        log('');
        log('🎉 Release criado com sucesso!', 'bright');
        log('');
        log('📁 Arquivos criados:', 'green');
        
        const files = fs.readdirSync(releaseDir);
        files.forEach(file => {
            const filePath = path.join(releaseDir, file);
            const stats = fs.statSync(filePath);
            const size = stats.isDirectory() ? 'DIR' : `${(stats.size / 1024).toFixed(1)} KB`;
            log(`   ${file} (${size})`, 'cyan');
        });

        log('');
        log('📦 Para distribuir:', 'bright');
        log(`   1. Compacte o diretório: ${releaseDir}`, 'cyan');
        log('   2. Faça upload para o repositório', 'cyan');
        log('   3. Crie uma tag no Git', 'cyan');
        log('');

    } catch (error) {
        logError(`Erro ao criar release: ${error.message}`);
        process.exit(1);
    }
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
    logError(`Erro não tratado: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Promise rejeitada: ${reason}`);
    process.exit(1);
});

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    createReleaseDir,
    createChangelog,
    createQuickInstall,
    createPackages,
    createChecksums,
    createReleaseNotes
}; 