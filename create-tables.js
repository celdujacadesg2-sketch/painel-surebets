// Script temporário para criar tabelas no Supabase
const { execSync } = require('child_process');

// Temporariamente usar a URL do Supabase
const originalEnv = process.env.DATABASE_URL;
process.env.DATABASE_URL = "postgresql://postgres:Rikudou22%40@db.nvyrytiuwxwfqhobzkxn.supabase.co:5432/postgres";

console.log('🔄 Tentando conectar ao Supabase...');

try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Tabelas criadas com sucesso!');
} catch (error) {
  console.error('❌ Erro ao criar tabelas:', error.message);
}

process.env.DATABASE_URL = originalEnv;
