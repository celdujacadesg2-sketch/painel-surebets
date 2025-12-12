# Início Rápido - Surebet SaaS

## 🚀 Setup Rápido (5 minutos)

### 1. Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- Git (opcional)

### 2. Instalação Automática

Execute o script de setup que faz tudo automaticamente:

\`\`\`bash
cd "C:\\Users\\lucas\\Desktop\\Painel Surebets"
npm run setup
\`\`\`

Ou manualmente:

\`\`\`bash
# 1. Instalar dependências
npm install

# 2. Copiar .env
copy .env.example .env

# 3. Editar .env com suas configurações
notepad .env

# 4. Aplicar schema do banco
npx prisma db push

# 5. Criar usuário admin
npm run seed
\`\`\`

### 3. Iniciar o Servidor

\`\`\`bash
# Opção 1: Desenvolvimento (sem WebSocket completo)
npm run dev

# Opção 2: Com WebSocket (RECOMENDADO)
npm run server
\`\`\`

### 4. Acessar o Sistema

Abra no navegador: **http://localhost:3000**

**Login Admin:**
- Email: \`admin@surebet.com\`
- Senha: \`Admin@123\`

## 📱 Testar o Sistema

### 1. Criar um usuário normal
- Vá para /register
- Crie uma conta
- Você terá 5 dias de trial automaticamente

### 2. Enviar um sinal de teste

Use o script Python de exemplo:

\`\`\`bash
cd examples
python send_signal.py
\`\`\`

Ou use cURL:

\`\`\`bash
curl -X POST http://localhost:3000/api/signals/create ^
  -H "x-api-secret: sua-chave-api-secreta-para-enviar-sinais" ^
  -H "Content-Type: application/json" ^
  -d "{\"sport\":\"Futebol\",\"event\":\"Time A vs Time B\",\"market\":\"1x2\",\"roi\":5.5,\"odds\":[{\"selection\":\"Casa\",\"value\":\"2.10\"}],\"bookmakers\":[{\"name\":\"Bet365\",\"url\":\"https://bet365.com\"}]}"
\`\`\`

### 3. Verificar no Dashboard
- O sinal deve aparecer automaticamente no dashboard
- WebSocket atualiza em tempo real
- Teste os filtros e o botão "Abrir Casas"

## 🔧 Comandos Úteis

\`\`\`bash
# Visualizar banco de dados
npm run db:studio

# Resetar banco (cuidado!)
npx prisma db push --force-reset

# Ver logs do servidor
# (os logs aparecem no terminal onde rodou npm run server)

# Build para produção
npm run build
npm start
\`\`\`

## 📚 Próximos Passos

1. **Configurar variáveis de ambiente** em produção
2. **Alterar senha do admin**
3. **Configurar API_SECRET seguro**
4. **Integrar com Telegram Bot** (veja examples/telegram_bot.js)
5. **Deploy em produção** (Vercel, VPS, etc)

## 🆘 Problemas Comuns

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confira DATABASE_URL no .env

### WebSocket não conecta
- Use \`npm run server\` em vez de \`npm run dev\`

### Porta 3000 já em uso
- Altere a porta no .env: \`PORT=3001\`

## 📖 Documentação Completa

Veja [README.md](README.md) para documentação completa.
