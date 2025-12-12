# ⚡ DEPLOY RÁPIDO - 3 PASSOS

## 1️⃣ SUPABASE (Banco de Dados)
1. https://supabase.com → Login com GitHub
2. New Project → Nome: `painel-surebets` → Region: São Paulo → Free
3. Settings → Database → Connection String (URI) → Copiar URL completa
4. **Anotar a URL** (precisa em vários lugares)

## 2️⃣ VERCEL (Dashboard)
1. https://vercel.com → Login com GitHub
2. New Project → Importar repositório `painel-surebets`
3. **Environment Variables** (adicionar todas):
   ```
   DATABASE_URL = (URL do Supabase)
   JWT_SECRET = (gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   API_SECRET = (gerar outra chave diferente)
   ADMIN_EMAIL = seu@email.com
   ADMIN_PASSWORD = SenhaForte123
   NODE_ENV = production
   NEXT_PUBLIC_APP_URL = (deixar vazio, preencher depois)
   ```
4. Deploy → Copiar URL do painel
5. Voltar em Settings → Environment Variables → Editar `NEXT_PUBLIC_APP_URL` → Colar URL
6. Redeploy

**Rodar no seu PC:**
```powershell
# Atualizar .env com URL do Supabase
npx prisma db push
```

## 3️⃣ RAILWAY (Bot Telegram)
1. https://railway.app → Login com GitHub
2. New Project → Deploy from GitHub → Selecionar `painel-surebets`
3. **Variables** (adicionar):
   ```
   TELEGRAM_BOT_TOKEN = (token do @BotFather)
   TELEGRAM_GROUP_ID = -5053501924
   API_URL = (URL do Vercel)
   API_SECRET = (MESMA do Vercel)
   ```
4. Settings → Start Command: `node telegram-bot-new.js`
5. Deploy automático → Verificar Logs

## ✅ TESTAR
1. Enviar mensagem de teste no grupo Telegram
2. Acessar URL do painel
3. Login com ADMIN_EMAIL e ADMIN_PASSWORD
4. Verificar se sinal apareceu

## 💰 CUSTO
- Vercel: R$ 0
- Supabase: R$ 0
- Railway: ~R$ 25/mês
- **Total: R$ 25/mês** para 50-100 clientes

## 📚 Guia completo: DEPLOY.md
