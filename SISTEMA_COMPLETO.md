# 📋 Sistema Surecapta - Guia Completo

## ✅ O QUE ESTÁ FUNCIONANDO

### 🌐 Painel Web
- **URL:** https://surecapta.com
- **Hospedagem:** Vercel (grátis)
- **Framework:** Next.js 14
- **Status:** 100% operacional

### 💾 Banco de Dados
- **Serviço:** Neon PostgreSQL
- **Host:** ep-fragrant-tree-a47x7w95-pooler.us-east-1.aws.neon.tech
- **Status:** Online 24/7
- **Custo:** R$ 0/mês (plano grátis)

### 🤖 Bot Telegram
- **Localização:** VPS Hostinger (31.97.28.175)
- **Arquivo:** /var/www/telegram-bot/bot.js
- **Gerenciador:** PM2 (reinicia automaticamente)
- **Status:** Rodando 24/7
- **Token:** 8271352284:AAFWIiWNX0-qxWrjodFFC1inJguezswH2y0
- **Grupo:** -5053501924

### 🌍 Domínio
- **Nome:** surecapta.com
- **Registrador:** Hostinger
- **DNS:** Apontando para Vercel
- **SSL:** Ativo (HTTPS funcionando)

---

## 🔑 CREDENCIAIS IMPORTANTES

### Admin do Painel
- **URL:** https://surecapta.com/login
- **Email:** admin@surebet.com
- **Senha:** Admin@123

### Banco Neon
- **URL:** https://console.neon.tech
- **Connection String:** 
  ```
  postgresql://neondb_owner:npg_GWaQWbhzWnX0@ep-fragrant-tree-a47x7w95-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

### VPS Hostinger
- **IP:** 31.97.28.175
- **Usuário SSH:** root
- **Senha SSH:** Rikudou2222@
- **Porta SSH:** 22 (pode não funcionar de algumas redes)
- **Acesso Web:** Terminal no painel da Hostinger

### Vercel
- **Dashboard:** https://vercel.com/dashboard
- **Projeto:** painel-surebets-3

### GitHub
- **Repositório:** https://github.com/celdujacadesg2-sketch/painel-surebets
- **Branch:** main

---

## 🛠️ COMANDOS ÚTEIS

### Gerenciar Bot no VPS

**Acessar VPS via SSH:**
```bash
ssh root@31.97.28.175
# Senha: Rikudou2222@
```

**Ver status do bot:**
```bash
pm2 list
```

**Ver logs em tempo real:**
```bash
pm2 logs telegram-bot
```

**Ver últimas 50 linhas de logs:**
```bash
pm2 logs telegram-bot --lines 50
```

**Reiniciar bot:**
```bash
pm2 restart telegram-bot
```

**Parar bot:**
```bash
pm2 stop telegram-bot
```

**Iniciar bot (se estiver parado):**
```bash
pm2 start telegram-bot
```

**Ver uso de recursos:**
```bash
pm2 monit
```

---

## 🔄 COMO ATUALIZAR O CÓDIGO

### Atualizar Painel (Vercel)

**1. No seu PC, faça as alterações nos arquivos**

**2. Commit e push para GitHub:**
```powershell
git add .
git commit -m "Descrição da mudança"
git push
```

**3. Vercel vai deployar automaticamente em 1-2 minutos**

**4. Verifique em:** https://surecapta.com

### Atualizar Bot no VPS

**Opção A: Atualizar arquivo individual**

**1. No seu PC (PowerShell):**
```powershell
scp telegram-bot-new.js root@31.97.28.175:/var/www/telegram-bot/bot.js
# Senha: Rikudou2222@
```

**2. No SSH do VPS:**
```bash
pm2 restart telegram-bot
```

**Opção B: Baixar do GitHub (se commitou mudanças)**

**No SSH do VPS:**
```bash
cd /var/www/telegram-bot
curl -o bot.js https://raw.githubusercontent.com/celdujacadesg2-sketch/painel-surebets/main/telegram-bot-new.js
pm2 restart telegram-bot
pm2 logs telegram-bot --lines 10
```

---

## 📊 MONITORAMENTO

### Verificar se tudo está online

**1. Painel:**
- Acesse https://surecapta.com
- Se carregar = OK

**2. Bot:**
```bash
ssh root@31.97.28.175
pm2 list
# Status deve estar "online"
```

**3. Sinais chegando:**
- Acesse https://surecapta.com/dashboard
- Deve aparecer sinais em tempo real
- Se aparecer = bot funcionando

### Ver quantos usuários cadastrados

**No painel Neon:**
1. Acesse https://console.neon.tech
2. Abra SQL Editor
3. Execute:
```sql
SELECT COUNT(*) FROM "User";
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Bot parou de funcionar

**1. Verificar status:**
```bash
pm2 list
```

**2. Ver logs de erro:**
```bash
pm2 logs telegram-bot --err --lines 50
```

**3. Reiniciar:**
```bash
pm2 restart telegram-bot
```

**4. Se não resolver, parar e iniciar novamente:**
```bash
pm2 delete telegram-bot
cd /var/www/telegram-bot
pm2 start bot.js --name telegram-bot
pm2 save
```

### Painel fora do ar

**1. Verificar Vercel:**
- Acesse https://vercel.com
- Veja se tem algum erro de deploy

**2. Se deploy falhou:**
- Veja os logs de erro no Vercel
- Corrija o erro no código
- Faça novo commit

### Banco de dados não conecta

**1. Verificar status Neon:**
- Acesse https://console.neon.tech
- Veja se banco está online

**2. Testar conexão:**
```bash
# No SSH do VPS
npm install -g pg
node -e "const { Client } = require('pg'); const client = new Client({connectionString: 'postgresql://neondb_owner:npg_GWaQWbhzWnX0@ep-fragrant-tree-a47x7w95-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'}); client.connect().then(() => console.log('Conectado!')).catch(e => console.error(e));"
```

### Token do Telegram inválido

**1. Pegar novo token com @BotFather no Telegram:**
- Envie `/mybots`
- Selecione seu bot
- Clique em "API Token"
- Copie o token

**2. Atualizar no VPS:**
```bash
cd /var/www/telegram-bot
nano .env
# Altere a linha TELEGRAM_BOT_TOKEN=
# Ctrl+O para salvar, Enter, Ctrl+X para sair

pm2 restart telegram-bot
```

### Domínio não abre

**1. Verificar DNS:**
- Acesse painel Hostinger
- Vá em Domínios → surecapta.com → DNS
- Deve ter:
  - CNAME: www → cname.vercel-dns.com
  - A: @ → 76.76.21.21

**2. Aguardar propagação:**
- DNS pode levar até 24h para atualizar
- Teste em: https://dnschecker.org

---

## 💰 CUSTOS MENSAIS

- **Vercel:** R$ 0 (grátis)
- **Neon PostgreSQL:** R$ 0 (grátis)
- **VPS Hostinger:** ~R$ 25/mês
- **Domínio surecapta.com:** ~R$ 40/ano (já pago)
- **TOTAL:** ~R$ 25/mês

---

## 📁 ESTRUTURA DOS ARQUIVOS

### No VPS (/var/www/telegram-bot/)
```
/var/www/telegram-bot/
├── bot.js              # Bot principal
├── .env                # Variáveis de ambiente
├── package.json        # Dependências
└── node_modules/       # Bibliotecas instaladas
```

### No GitHub (painel-surebets/)
```
painel-surebets/
├── src/
│   ├── app/            # Páginas Next.js
│   ├── components/     # Componentes React
│   └── lib/            # Funções auxiliares
├── prisma/
│   └── schema.prisma   # Schema do banco
├── telegram-bot-new.js # Código do bot
└── package.json        # Dependências
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

### Painel (Vercel)
```env
DATABASE_URL=postgresql://neondb_owner:npg_GWaQWbhzWnX0@ep-fragrant-tree-a47x7w95-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=seu_jwt_secret_super_seguro_painel_surebets_2024
NEXT_PUBLIC_API_URL=https://surecapta.com
NODE_ENV=production
```

### Bot (VPS)
```env
TELEGRAM_BOT_TOKEN=8271352284:AAFWIiWNX0-qxWrjodFFC1inJguezswH2y0
TELEGRAM_GROUP_ID=-5053501924
API_URL=https://surecapta.com
API_SECRET=f11c79dcd3e5e0f8e8c6a5d3d9f0a5c5e3f0c8a5d3d9f0a5c5e3f0c8a5d3d9f0
NODE_ENV=production
```

---

## 📞 COMANDOS RÁPIDOS

### Backup do banco
```bash
# No Neon dashboard → Backups
# Ou via pg_dump (necessário instalar)
```

### Ver usuários cadastrados
```sql
-- No Neon SQL Editor
SELECT email, name, role, "trialEndsAt", "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;
```

### Limpar sinais antigos (opcional)
```sql
-- No Neon SQL Editor
DELETE FROM "Signal" 
WHERE "createdAt" < NOW() - INTERVAL '7 days';
```

### Reiniciar tudo após reboot do VPS
```bash
# PM2 já reinicia automaticamente
# Mas se precisar verificar:
pm2 startup
pm2 save
pm2 list
```

---

## 🎯 FUNCIONALIDADES DO SISTEMA

### Para Usuários
- ✅ Cadastro com 5 dias grátis
- ✅ Login/Logout
- ✅ Dashboard com sinais em tempo real
- ✅ Filtros (esporte, mercado, ROI)
- ✅ Abrir casas de apostas diretamente
- ✅ Calculadora de stakes
- ✅ Salvar apostas favoritas
- ✅ Notificações popup

### Para Admin
- ✅ Login admin separado
- ✅ Ver todos os usuários
- ✅ Gerenciar assinaturas
- ✅ Ver estatísticas
- ✅ Controlar sinais

### Bot
- ✅ Captura sinais do grupo Telegram
- ✅ Parse automático de informações
- ✅ Envia para API do painel
- ✅ Suporta múltiplas casas de apostas
- ✅ Detecta horários diferentes
- ✅ Calcula ROI automaticamente

---

## 🚀 MELHORIAS FUTURAS (Opcional)

1. **Pagamentos:**
   - Integrar PagBank/Mercado Pago
   - Criar planos mensais
   - Sistema de trial automático

2. **Notificações:**
   - Push notifications
   - Email de sinais importantes
   - SMS (opcional)

3. **Analytics:**
   - Dashboard de estatísticas
   - Taxa de acerto dos sinais
   - ROI médio por esporte

4. **Mobile:**
   - App nativo Android/iOS
   - PWA (Progressive Web App)

---

## 📝 CHECKLIST DE MANUTENÇÃO MENSAL

- [ ] Verificar logs do bot: `pm2 logs telegram-bot`
- [ ] Ver status do VPS: `pm2 list`
- [ ] Checar espaço em disco: `df -h`
- [ ] Atualizar dependências Node.js (opcional)
- [ ] Fazer backup do banco de dados
- [ ] Verificar se domínio vai vencer
- [ ] Revisar custos Hostinger

---

## ⚠️ IMPORTANTE

### NÃO COMMITTAR NO GITHUB:
- ❌ Senhas
- ❌ Tokens do Telegram
- ❌ Connection strings do banco
- ❌ Arquivo .env

### SEMPRE USAR .gitignore:
```
.env
.env.local
.env.production
node_modules/
.next/
```

---

## 📞 SUPORTE

### Problemas técnicos:
1. Verificar logs: `pm2 logs telegram-bot`
2. Reiniciar serviço: `pm2 restart telegram-bot`
3. Verificar Vercel dashboard
4. Checar Neon status

### Dúvidas sobre código:
- Repositório: https://github.com/celdujacadesg2-sketch/painel-surebets
- Documentação Next.js: https://nextjs.org/docs
- Documentação Prisma: https://www.prisma.io/docs

---

**Sistema operacional 24/7! 🎉**
**Última atualização:** 12/12/2025
