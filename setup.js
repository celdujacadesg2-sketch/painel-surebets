#!/usr/bin/env node

console.log('🚀 Iniciando configuração do Surebet SaaS...\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar se o .env existe
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Criando arquivo .env a partir do .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Arquivo .env criado. Por favor, configure as variáveis de ambiente!\n');
  console.log('⚠️  Não esqueça de configurar:');
  console.log('   - DATABASE_URL');
  console.log('   - JWT_SECRET');
  console.log('   - API_SECRET\n');
} else {
  console.log('✅ Arquivo .env já existe\n');
}

// Instalar dependências
console.log('📦 Instalando dependências...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas\n');
} catch (error) {
  console.error('❌ Erro ao instalar dependências');
  process.exit(1);
}

// Gerar Prisma Client
console.log('🔧 Gerando Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado\n');
} catch (error) {
  console.error('❌ Erro ao gerar Prisma Client');
  process.exit(1);
}

console.log('📊 Aplicando schema ao banco de dados...');
console.log('   (Certifique-se de que o PostgreSQL está rodando e DATABASE_URL está configurado)');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Schema aplicado ao banco\n');
} catch (error) {
  console.error('❌ Erro ao aplicar schema. Verifique sua conexão com o banco de dados.');
  process.exit(1);
}

console.log('👤 Criando usuário administrador...');
try {
  execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
  console.log('✅ Usuário admin criado\n');
} catch (error) {
  console.log('⚠️  Erro ao criar usuário admin (pode já existir)\n');
}

console.log('═══════════════════════════════════════════════════════');
console.log('✅ Configuração concluída com sucesso!');
console.log('═══════════════════════════════════════════════════════\n');
console.log('🚀 Para iniciar o servidor:');
console.log('   npm run dev       (desenvolvimento)');
console.log('   node server.js    (com WebSocket)\n');
console.log('📝 Acesso padrão:');
console.log('   URL: http://localhost:3000');
console.log('   Admin: admin@surebet.com');
console.log('   Senha: Admin@123\n');
console.log('⚠️  Não esqueça de alterar a senha do admin após o primeiro login!');
console.log('═══════════════════════════════════════════════════════\n');
