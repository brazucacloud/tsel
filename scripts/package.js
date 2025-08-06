#!/usr/bin/env node

/**
 * Script de Empacotamento - Chip Warmup API
 * 
 * Uso: node scripts/package.js [opções]
 * 
 * Opções:
 *   --format=zip|tar|exe    Formato de saída (padrão: zip)
 *   --platform=win|linux|mac Plataforma específica
 *   --include-deps          Incluir node_modules
 *   --minimal               Versão mínima (sem frontend)
 *   --production            Build de produção
 *   --help                  Mostrar ajuda
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const tar = require('tar');

// Configuração de argumentos
const args = process.argv.slice(2);
const options = {
    format: 'zip',
    platform: null,
    includeDeps: false,
    minimal: false,
    production: false,
    help: false
};

// Parse argumentos
args.forEach(arg => {
    if (arg.startsWith('--format=')) {
        options.format = arg.split('=')[1];
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
Script de Empacotamento - Chip Warmup API

Uso: node scripts/package.js [opções]

Opções:
    --format=zip|tar|exe     Formato de saída (padrão: zip)
    --platform=win|linux|mac Plataforma específica
    --include-deps           Incluir node_modules
    --minimal                Versão mínima (sem frontend)
    --production             Build de produção
    --help                   Mostrar esta ajuda

Exemplos:
    node scripts/package.js                    # ZIP padrão
    node scripts/package.js --format=tar       # TAR.GZ
    node scripts/package.js --include-deps     # Com dependências
    node scripts/package.js --minimal          # Versão mínima
    node scripts/package.js --production       # Build de produção
    node scripts/package.js --platform=win     # Windows específico

Formatos disponíveis:
    - zip: Arquivo ZIP (padrão)
    - tar: Arquivo TAR.GZ
    - exe: Executável (requer pkg)

`, 'bright');
}

// Verificar se um comando existe
function commandExists(command) {
    try {
        if (os.platform() === 'win32') {
            execSync(`where ${command}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${command}`, { stdio: 'ignore' });
        }
        return true;
    } catch {
        return false;
    }
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

// Criar diretório temporário
function createTempDir() {
    const tempDir = path.join(os.tmpdir(), `chip-warmup-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
}

// Lista de arquivos e diretórios para incluir
function getIncludeList() {
    const baseFiles = [
        'package.json',
        'package-lock.json',
        'README.md',
        'INSTALL.md',
        'INSTALACAO.md',
        'env.example',
        'server.js',
        'healthcheck.js',
        'test-api.js',
        'init.js',
        'Dockerfile',
        'docker-compose.yml',
        '.gitignore',
        'install.bat',
        'install.sh',
        'install.ps1',
        'install.js'
    ];

    const baseDirs = [
        'config',
        'middleware',
        'models',
        'routes',
        'scripts',
        'docs',
        'examples'
    ];

    const conditionalDirs = [];
    
    if (!options.minimal) {
        conditionalDirs.push('frontend');
    }
    
    if (options.includeDeps) {
        conditionalDirs.push('node_modules');
        if (!options.minimal) {
            conditionalDirs.push('frontend/node_modules');
        }
    }

    return {
        files: baseFiles,
        dirs: [...baseDirs, ...conditionalDirs]
    };
}

// Copiar arquivos para diretório temporário
function copyFiles(sourceDir, targetDir, includeList) {
    logStep(1, 4, 'Copiando arquivos...');
    
    // Criar estrutura de diretórios
    includeList.dirs.forEach(dir => {
        const sourcePath = path.join(sourceDir, dir);
        const targetPath = path.join(targetDir, dir);
        
        if (fs.existsSync(sourcePath)) {
            fs.mkdirSync(targetPath, { recursive: true });
            logInfo(`Diretório criado: ${dir}`);
        }
    });

    // Copiar arquivos
    includeList.files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
            logInfo(`Arquivo copiado: ${file}`);
        } else {
            logWarning(`Arquivo não encontrado: ${file}`);
        }
    });

    // Copiar diretórios recursivamente
    includeList.dirs.forEach(dir => {
        const sourcePath = path.join(sourceDir, dir);
        const targetPath = path.join(targetDir, dir);
        
        if (fs.existsSync(sourcePath)) {
            copyDirectoryRecursive(sourcePath, targetPath);
        }
    });

    logSuccess('Arquivos copiados com sucesso');
}

// Copiar diretório recursivamente
function copyDirectoryRecursive(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    items.forEach(item => {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

// Criar arquivo ZIP
function createZip(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        logStep(2, 4, 'Criando arquivo ZIP...');
        
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Máxima compressão
        });

        output.on('close', () => {
            const size = (archive.pointer() / 1024 / 1024).toFixed(2);
            logSuccess(`ZIP criado: ${outputPath} (${size} MB)`);
            resolve();
        });

        archive.on('error', (err) => {
            logError(`Erro ao criar ZIP: ${err.message}`);
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

// Criar arquivo TAR
function createTar(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        logStep(2, 4, 'Criando arquivo TAR.GZ...');
        
        tar.c({
            gzip: true,
            file: outputPath,
            cwd: sourceDir
        }, ['.']).then(() => {
            const stats = fs.statSync(outputPath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            logSuccess(`TAR.GZ criado: ${outputPath} (${size} MB)`);
            resolve();
        }).catch(err => {
            logError(`Erro ao criar TAR.GZ: ${err.message}`);
            reject(err);
        });
    });
}

// Criar executável
function createExecutable(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        logStep(2, 4, 'Criando executável...');
        
        if (!commandExists('pkg')) {
            logError('pkg não encontrado. Instale com: npm install -g pkg');
            reject(new Error('pkg não encontrado'));
            return;
        }

        const pkgConfig = {
            target: options.platform || 'node18-current',
            output: outputPath,
            cwd: sourceDir
        };

        const pkgArgs = [
            'package.json',
            '--target', pkgConfig.target,
            '--output', pkgConfig.output
        ];

        try {
            execSync(`pkg ${pkgArgs.join(' ')}`, { 
                cwd: sourceDir,
                stdio: 'inherit'
            });
            
            const stats = fs.statSync(outputPath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            logSuccess(`Executável criado: ${outputPath} (${size} MB)`);
            resolve();
        } catch (error) {
            logError(`Erro ao criar executável: ${error.message}`);
            reject(error);
        }
    });
}

// Build de produção
function buildProduction(sourceDir) {
    logStep(3, 4, 'Build de produção...');
    
    // Build do frontend
    if (!options.minimal && fs.existsSync(path.join(sourceDir, 'frontend'))) {
        logInfo('Build do frontend...');
        if (!executeCommand('npm run build', path.join(sourceDir, 'frontend'))) {
            logWarning('Falha no build do frontend');
        }
    }

    // Build do backend
    logInfo('Build do backend...');
    if (!executeCommand('npm run build', sourceDir)) {
        logWarning('Falha no build do backend');
    }

    logSuccess('Build de produção concluído');
}

// Limpar arquivos desnecessários
function cleanupFiles(sourceDir) {
    logStep(4, 4, 'Limpando arquivos...');
    
    const filesToRemove = [
        '.git',
        '.gitignore',
        'node_modules/.cache',
        'frontend/node_modules/.cache',
        '*.log',
        'logs/*',
        'uploads/*',
        'backups/*',
        '.env',
        '.env.local',
        '.env.development',
        '.env.test'
    ];

    filesToRemove.forEach(pattern => {
        const patternPath = path.join(sourceDir, pattern);
        try {
            if (fs.existsSync(patternPath)) {
                if (fs.statSync(patternPath).isDirectory()) {
                    fs.rmSync(patternPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(patternPath);
                }
                logInfo(`Removido: ${pattern}`);
            }
        } catch (error) {
            // Ignorar erros de limpeza
        }
    });

    logSuccess('Limpeza concluída');
}

// Função principal
async function main() {
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    log('📦 Iniciando empacotamento do Chip Warmup API...', 'bright');
    log('');

    const sourceDir = process.cwd();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const platform = options.platform || os.platform();
    const format = options.format;
    
    let outputName = `chip-warmup-api-${timestamp}`;
    if (options.minimal) outputName += '-minimal';
    if (options.production) outputName += '-prod';
    if (options.platform) outputName += `-${options.platform}`;

    let outputPath;
    switch (format) {
        case 'zip':
            outputPath = path.join(sourceDir, `${outputName}.zip`);
            break;
        case 'tar':
            outputPath = path.join(sourceDir, `${outputName}.tar.gz`);
            break;
        case 'exe':
            const ext = platform === 'win32' ? '.exe' : '';
            outputPath = path.join(sourceDir, `${outputName}${ext}`);
            break;
        default:
            logError(`Formato não suportado: ${format}`);
            process.exit(1);
    }

    // Criar diretório temporário
    const tempDir = createTempDir();
    logInfo(`Diretório temporário: ${tempDir}`);

    try {
        // Obter lista de arquivos para incluir
        const includeList = getIncludeList();
        
        // Copiar arquivos
        copyFiles(sourceDir, tempDir, includeList);

        // Build de produção se solicitado
        if (options.production) {
            buildProduction(tempDir);
        }

        // Limpar arquivos desnecessários
        cleanupFiles(tempDir);

        // Criar pacote
        switch (format) {
            case 'zip':
                await createZip(tempDir, outputPath);
                break;
            case 'tar':
                await createTar(tempDir, outputPath);
                break;
            case 'exe':
                await createExecutable(tempDir, outputPath);
                break;
        }

        // Limpar diretório temporário
        fs.rmSync(tempDir, { recursive: true, force: true });

        log('');
        log('🎉 Empacotamento concluído!', 'bright');
        log('');
        log('📦 Arquivo criado:', 'green');
        log(`   ${outputPath}`, 'cyan');
        log('');
        log('📋 Informações do pacote:', 'bright');
        log(`   Formato: ${format.toUpperCase()}`, 'cyan');
        log(`   Plataforma: ${platform}`, 'cyan');
        log(`   Inclui dependências: ${options.includeDeps ? 'Sim' : 'Não'}`, 'cyan');
        log(`   Versão mínima: ${options.minimal ? 'Sim' : 'Não'}`, 'cyan');
        log(`   Build de produção: ${options.production ? 'Sim' : 'Não'}`, 'cyan');
        log('');

    } catch (error) {
        logError(`Erro durante o empacotamento: ${error.message}`);
        
        // Limpar diretório temporário em caso de erro
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
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
    createZip,
    createTar,
    createExecutable,
    getIncludeList
}; 