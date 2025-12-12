# 📚 Índice da Documentação - Surebet SaaS

Guia completo de toda a documentação disponível no projeto.

---

## 🚀 Início Rápido

### 1. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)
**Resumo executivo do projeto**
- Visão geral em 1 página
- Funcionalidades principais
- Stack tecnológico
- Como começar

### 2. [QUICKSTART.md](QUICKSTART.md)
**Guia de início rápido (5 minutos)**
- Setup automático
- Comandos básicos
- Primeiro teste
- Troubleshooting básico

### 3. [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
**Guia específico para Windows**
- Instalação de pré-requisitos
- Comandos PowerShell
- Problemas comuns no Windows
- Scripts úteis

---

## 📖 Documentação Técnica

### 4. [README.md](README.md)
**Documentação completa do sistema**
- Instalação detalhada
- Arquitetura
- API endpoints
- Configuração
- Deploy
- Customização

### 5. [PROJECT_STATUS.md](PROJECT_STATUS.md)
**Status detalhado do projeto**
- Checklist de funcionalidades
- Estrutura de arquivos
- Tecnologias utilizadas
- Próximos passos sugeridos

---

## 🔧 Arquivos de Configuração

### 6. [.env.example](.env.example)
**Exemplo de variáveis de ambiente**
- DATABASE_URL
- JWT_SECRET
- API_SECRET
- Configurações do admin

### 7. [package.json](package.json)
**Configuração do Node.js**
- Dependências
- Scripts disponíveis
- Metadados do projeto

### 8. [tsconfig.json](tsconfig.json)
**Configuração TypeScript**

### 9. [tailwind.config.ts](tailwind.config.ts)
**Configuração do TailwindCSS**

### 10. [next.config.js](next.config.js)
**Configuração do Next.js**

---

## 🐳 Deploy

### 11. [Dockerfile](Dockerfile)
**Configuração Docker**
- Build otimizado
- Multi-stage build
- Produção ready

### 12. [docker-compose.yml](docker-compose.yml)
**Orquestração Docker**
- PostgreSQL
- Next.js App
- Network e volumes

---

## 🗄️ Banco de Dados

### 13. [prisma/schema.prisma](prisma/schema.prisma)
**Schema do banco de dados**
- Modelo User
- Modelo Signal
- Modelo SavedBet
- Relações e índices

### 14. [prisma/seed.ts](prisma/seed.ts)
**Seed do banco**
- Criação do usuário admin
- Dados iniciais

---

## 📡 Exemplos de Integração

### 15. [examples/send_signal.py](examples/send_signal.py)
**Exemplo em Python**
- Como enviar sinais via API
- Função reutilizável
- Exemplo de uso

### 16. [examples/telegram_bot.js](examples/telegram_bot.js)
**Exemplo com Telegram Bot**
- Integração com Telegram
- Receber e enviar sinais
- Bot automatizado

---

## 🛠️ Scripts Auxiliares

### 17. [scripts.ps1](scripts.ps1)
**Scripts PowerShell**
- Menu interativo
- Setup automático
- Comandos úteis
- Gerar chaves

### 18. [setup.js](setup.js)
**Script de instalação**
- Setup automatizado
- Instalação de dependências
- Configuração do banco

---

## 📁 Estrutura de Código

### Frontend (src/app/)
- **page.tsx** - Página inicial (redirect)
- **layout.tsx** - Layout principal
- **globals.css** - Estilos globais

#### Páginas
- **login/page.tsx** - Página de login
- **register/page.tsx** - Página de registro
- **dashboard/page.tsx** - Dashboard principal
- **saved-bets/page.tsx** - Apostas salvas
- **admin/page.tsx** - Painel administrativo

#### API Routes (src/app/api/)
- **auth/** - Autenticação
  - login/route.ts
  - register/route.ts
  - me/route.ts
- **signals/** - Sinais
  - route.ts (GET)
  - create/route.ts (POST)
- **saved-bets/** - Apostas
  - route.ts (GET, POST)
  - [id]/route.ts (DELETE)
- **admin/users/** - Admin
  - route.ts (GET)
  - [id]/route.ts (PATCH)
  - [id]/subscription/route.ts (POST)

### Componentes (src/components/)

#### Layouts
- **layouts/DashboardLayout.tsx** - Layout do dashboard

#### Providers
- **providers/AuthProvider.tsx** - Context de autenticação

#### Dashboard
- **dashboard/SignalCard.tsx** - Card de sinal
- **dashboard/SignalFilters.tsx** - Filtros
- **dashboard/AccessDenied.tsx** - Acesso negado

#### Saved Bets
- **saved-bets/SavedBetForm.tsx** - Formulário
- **saved-bets/SavedBetsTable.tsx** - Tabela

#### Admin
- **admin/UsersTable.tsx** - Tabela de usuários

### Biblioteca (src/lib/)
- **auth.ts** - JWT e autenticação
- **prisma.ts** - Cliente Prisma
- **socket.ts** - WebSocket
- **subscription.ts** - Controle de acesso
- **middleware.ts** - Middlewares
- **utils.ts** - Utilitários

### Hooks (src/hooks/)
- **useSignals.ts** - Hook para sinais em tempo real

---

## 📊 Fluxos do Sistema

### Fluxo de Registro
1. Usuário acessa /register
2. Preenche dados
3. Backend cria usuário com trial de 5 dias
4. Gera JWT token
5. Redireciona para dashboard

### Fluxo de Login
1. Usuário acessa /login
2. Envia credenciais
3. Backend valida e gera JWT
4. Redireciona para dashboard

### Fluxo de Sinais
1. Sistema externo envia POST /api/signals/create
2. Backend valida API_SECRET
3. Salva sinal no banco
4. Broadcast via WebSocket
5. Todos clientes recebem atualização
6. Sinal expira após 2 horas (remoção automática)

### Fluxo de Assinatura
1. Trial expira após 5 dias
2. Sistema bloqueia acesso
3. Usuário vê tela de renovação
4. Admin pode estender manualmente
5. Acesso é liberado automaticamente

---

## 🎯 Comandos Rápidos

### Setup
\`\`\`bash
npm run setup        # Setup completo
npm run server       # Iniciar com WebSocket
npm run dev          # Desenvolvimento
\`\`\`

### Banco de Dados
\`\`\`bash
npm run db:push      # Aplicar schema
npm run db:studio    # Abrir Prisma Studio
npm run seed         # Criar admin
\`\`\`

### Build
\`\`\`bash
npm run build        # Build produção
npm start            # Iniciar produção
\`\`\`

---

## 🆘 Suporte e Troubleshooting

### Documentos de Ajuda
- [WINDOWS_SETUP.md](WINDOWS_SETUP.md#-problemas-comuns-no-windows)
- [README.md](README.md#-troubleshooting)
- [QUICKSTART.md](QUICKSTART.md#-problemas-comuns)

### Problemas Comuns
1. **PostgreSQL não conecta**: Veja WINDOWS_SETUP.md
2. **WebSocket não funciona**: Use \`npm run server\`
3. **Erro de permissão**: Execute PowerShell como admin
4. **Porta em uso**: Mude PORT no .env

---

## 📞 Onde Encontrar

| Preciso de... | Veja o arquivo... |
|---------------|-------------------|
| Começar rapidamente | QUICKSTART.md |
| Instalar no Windows | WINDOWS_SETUP.md |
| Documentação completa | README.md |
| Status do projeto | PROJECT_STATUS.md |
| Resumo executivo | EXECUTIVE_SUMMARY.md |
| Configurar .env | .env.example |
| Exemplos de código | examples/ |
| Scripts úteis | scripts.ps1 |
| Deploy Docker | docker-compose.yml |
| API endpoints | README.md#-endpoints-da-api |

---

## 🎓 Ordem de Leitura Recomendada

### Para Iniciantes
1. EXECUTIVE_SUMMARY.md (visão geral)
2. QUICKSTART.md (começar)
3. WINDOWS_SETUP.md (se usa Windows)
4. README.md (documentação completa)

### Para Desenvolvedores
1. PROJECT_STATUS.md (estrutura)
2. README.md (APIs e arquitetura)
3. Código fonte em src/
4. examples/ (integração)

### Para Deploy
1. README.md#deploy
2. Dockerfile
3. docker-compose.yml
4. .env.example

---

## 📝 Licença e Créditos

Este é um projeto completo e funcional desenvolvido com as melhores práticas:
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- PostgreSQL
- Prisma
- Socket.IO

**Status**: ✅ 100% Completo e Pronto para Produção

---

**Última atualização**: Dezembro 2024
