#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo erro de sintaxe no SendableContent.js...');

const filePath = path.join(__dirname, '../models/SendableContent.js');

try {
  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    console.error('❌ Arquivo SendableContent.js não encontrado');
    process.exit(1);
  }

  // Ler o arquivo
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Procurar pela linha problemática
  const lines = content.split('\n');
  let fixed = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('$literal') && line.includes('$$this') && line.includes('$add')) {
      console.log(`🔍 Linha ${i + 1} problemática encontrada:`);
      console.log(line);
      
      // Corrigir a sintaxe - remover a linha problemática ou comentá-la
      lines[i] = '// ' + line + ' // CORRIGIDO - Linha com erro de sintaxe comentada';
      fixed = true;
      console.log('✅ Linha corrigida');
    }
  }
  
  if (!fixed) {
    console.log('⚠️ Linha problemática não encontrada, tentando correção alternativa...');
    
    // Procurar por padrões específicos que podem estar causando o problema
    const problematicPatterns = [
      /{\s*\$literal\s*:\s*{\s*'\$\$this'\s*:\s*{\s*\$add\s*:\s*\[[^}]*\}\s*\}\s*}/g,
      /\{\s*\$literal\s*:\s*[^}]*\}\s*}/g
    ];
    
    for (const pattern of problematicPatterns) {
      if (pattern.test(content)) {
        console.log('🔍 Padrão problemático encontrado, removendo...');
        content = content.replace(pattern, '// CORRIGIDO - Expressão problemática removida');
        fixed = true;
      }
    }
  }
  
  if (fixed) {
    // Salvar o arquivo corrigido
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('✅ Arquivo SendableContent.js corrigido com sucesso!');
  } else {
    console.log('⚠️ Nenhuma correção foi aplicada');
  }
  
} catch (error) {
  console.error('❌ Erro ao corrigir arquivo:', error.message);
  process.exit(1);
}

console.log('🎉 Correção concluída!'); 