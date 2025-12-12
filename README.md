# 🎯 Painel Surebets - Sistema Completo em Tempo Real

Sistema profissional de sinais de surebets com autenticação, trial de 5 dias, assinaturas e painel administrativo. Totalmente preparado para deploy em produção.

## ✨ Funcionalidades

- ✅ **Autenticação completa** (registro, login, JWT)
- ✅ **Trial automático** de 5 dias para novos usuários
- ✅ **Sinais em tempo real** via WebSocket (Socket.IO)
- ✅ **Bot Telegram** que captura sinais automaticamente
- ✅ **Filtros avançados** (esporte, mercado, ROI, busca)
- ✅ **Apostas salvas** com histórico
- ✅ **Painel administrativo** completo
- ✅ **Multi-usuário** com controle de acesso
- ✅ **Som de notificação** ao receber novo sinal
- ✅ **Remoção automática** de sinais expirados (+2h)
- ✅ **Página de casas de apostas** com logos

## 🚀 Deploy Rápido (3 Passos)

### 1. Supabase (Banco de Dados)
```
https://supabase.com → Criar projeto → Copiar DATABASE_URL
```

### 2. Vercel (Dashboard)
```
https://vercel.com → Importar repo → Configurar variáveis → Deploy
```

### 3. Railway (Bot Telegram)
```
https://railway.app → Importar repo → Configurar variáveis → Deploy
```

**📚 Guias detalhados:**
- [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) - Resumo em 3 passos
- [DEPLOY.md](DEPLOY.md) - Guia completo passo a passo
- [CHECKLIST_DEPLOY.md](CHECKLIST_DEPLOY.md) - Checklist visual
- [COMANDOS.md](COMANDOS.md) - Comandos úteis

## 💰 Custos

- **Vercel:** R$ 0/mês (até 100GB bandwidth)
- **Supabase:** R$ 0/mês (até 500MB storage)
- **Railway:** ~R$ 25/mês (bot 24/7)
- **Total:** ~R$ 25/mês para 50-100 clientes

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL com Prisma ORM
- **Real-time**: Socket.IO (WebSocket)
- **Auth**: JWT + Cookies
- **Styling**: TailwindCSS com tema dark/blue

## 📦 Instalação

### 1. Clone o repositório

\`\`\`bash
cd "C:\\Users\\lucas\\Desktop\\Painel Surebets"
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 3. Configure o banco de dados

Crie um banco PostgreSQL e copie a URL de conexão.

### 4. Configure as variáveis de ambiente

Copie o arquivo \`.env.example\` para \`.env\`:

\`\`\`bash
copy .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações:

\`\`\`env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/surebet_db"
JWT_SECRET="sua-chave-secreta-muito-segura-aqui-mude-em-producao"
API_SECRET="sua-chave-api-secreta-para-enviar-sinais"
ADMIN_EMAIL="admin@surebet.com"
ADMIN_PASSWORD="Admin@123"
NODE_ENV="development"
\`\`\`

### 5. Execute as migrações do banco

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 6. Crie o usuário admin (seed)

\`\`\`bash
npx ts-node prisma/seed.ts
\`\`\`

### 7. Inicie o servidor de desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Ou use o servidor customizado com WebSocket:

\`\`\`bash
node server.js
\`\`\`

O sistema estará disponível em: **http://localhost:3000**

## 👤 Acesso Inicial

### Usuário Admin Padrão:
- **Email**: admin@surebet.com
- **Senha**: Admin@123

⚠️ **Importante**: Altere a senha do admin após o primeiro login!

## 📡 Enviando Sinais via API

Para enviar sinais de surebet de sistemas externos (Telegram, bots, etc):

### Endpoint:
\`\`\`
POST http://localhost:3000/api/signals/create
\`\`\`

### Headers:
\`\`\`
x-api-secret: sua-chave-api-secreta-para-enviar-sinais
Content-Type: application/json
\`\`\`

### Corpo JSON:
\`\`\`json
{
  "sport": "Futebol",
  "event": "Flamengo vs Palmeiras",
  "market": "1x2",
  "roi": 5.5,
  "odds": [
    { "selection": "Flamengo", "value": "2.10" },
    { "selection": "Empate", "value": "3.40" },
    { "selection": "Palmeiras", "value": "2.80" }
  ],
  "bookmakers": [
    { "name": "Bet365", "url": "https://bet365.com" },
    { "name": "Betano", "url": "https://betano.com" }
  ]
}
\`\`\`

### Exemplo com cURL:
\`\`\`bash
curl -X POST http://localhost:3000/api/signals/create \\
  -H "x-api-secret: sua-chave-api-secreta" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sport": "Futebol",
    "event": "Time A vs Time B",
    "market": "Over/Under 2.5",
    "roi": 3.2,
    "odds": [
      {"selection": "Over 2.5", "value": "1.85"},
      {"selection": "Under 2.5", "value": "2.05"}
    ],
    "bookmakers": [
      {"name": "Casa 1", "url": "https://casa1.com"},
      {"name": "Casa 2", "url": "https://casa2.com"}
    ]
  }'
\`\`\`

## 🌐 Deploy em Produção

### Opção 1: Vercel (Recomendado para Next.js)

1. Faça push do código para GitHub
2. Conecte seu repositório no Vercel
3. Configure as variáveis de ambiente
4. O Vercel irá fazer deploy automaticamente

⚠️ **Nota**: WebSocket pode ter limitações no Vercel. Para WebSocket completo, considere outras opções.

### Opção 2: VPS (DigitalOcean, AWS, etc)

1. Instale Node.js e PostgreSQL no servidor
2. Clone o repositório
3. Configure as variáveis de ambiente
4. Execute \`npm install\` e \`npm run build\`
5. Use PM2 para gerenciar o processo:

\`\`\`bash
npm install -g pm2
pm2 start server.js --name surebet-saas
pm2 startup
pm2 save
\`\`\`

### Opção 3: Docker

Crie um \`Dockerfile\`:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "server.js"]
\`\`\`

## 📱 Estrutura de Páginas

- **/** - Redireciona para login ou dashboard
- **/login** - Página de login
- **/register** - Página de registro (com trial de 5 dias)
- **/dashboard** - Dashboard principal com sinais em tempo real
- **/saved-bets** - Página de apostas salvas
- **/admin** - Painel administrativo (apenas admin)

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- JWT para autenticação
- API_SECRET para proteger endpoints externos
- Validação de acesso em todas as rotas
- Middleware de autenticação

## 🎨 Personalização

### Cores
As cores estão definidas em \`tailwind.config.ts\`. Para alterar o tema:

\`\`\`typescript
colors: {
  primary: {
    // Altere os tons de azul aqui
    500: '#3b82f6',
    600: '#2563eb',
    // ...
  }
}
\`\`\`

### Logo e Branding
Edite o nome em \`src/components/layouts/DashboardLayout.tsx\` e \`src/app/login/page.tsx\`.

## 📊 Banco de Dados

### Schema Prisma
O schema está em \`prisma/schema.prisma\`. Modelos principais:

- **User**: Usuários do sistema
- **Signal**: Sinais de surebet
- **SavedBet**: Apostas salvas pelos usuários

### Comandos Úteis
\`\`\`bash
npx prisma studio          # Abrir interface visual do banco
npx prisma db push         # Aplicar mudanças no schema
npx prisma generate        # Gerar cliente Prisma
\`\`\`

## 🐛 Troubleshooting

### Erro de conexão com banco
Verifique se o PostgreSQL está rodando e se a DATABASE_URL está correta.

### WebSocket não conecta
Certifique-se de usar \`node server.js\` em vez de \`npm run dev\` para WebSocket funcionar.

### Erro ao compilar
Execute \`npm install\` novamente e verifique se todas as dependências foram instaladas.

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para suporte, entre em contato com o administrador do sistema.
