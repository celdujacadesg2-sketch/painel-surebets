# 🚀 GUIA COMPLETO DE DEPLOY - PAINEL SUREBETS

Este guia vai te ajudar a colocar seu painel online 24/7 sem depender do seu computador.

**Custo total: R$ 0-25/mês** (suficiente para 50-100 clientes)

---

## 📋 O QUE VAMOS FAZER

1. **Vercel** - Hospedar o dashboard (frontend + API)
2. **Supabase** - Banco de dados PostgreSQL
3. **Railway** - Rodar o bot do Telegram 24/7

---

## 1️⃣ PREPARAR BANCO DE DADOS (Supabase)

### Passo 1: Criar conta no Supabase

1. Acesse https://supabase.com
2. Clique em **"Start your project"**
3. Login com GitHub ou e-mail
4. Crie uma **nova organização** (gratuita)

### Passo 2: Criar projeto

1. Clique em **"New Project"**
2. Preencha:
   - **Name:** `painel-surebets`
   - **Database Password:** Crie uma senha forte (ANOTE!)
   - **Region:** `South America (São Paulo)` (mais próximo)
   - **Pricing Plan:** `Free` (R$ 0/mês)
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos (criação do banco)

### Passo 3: Copiar URL do banco

1. Quando terminar, vá em **Settings** (engrenagem) > **Database**
2. Role até **"Connection string"** > **URI**
3. Copie a URL completa (formato: `postgresql://postgres:[PASSWORD]@...`)
4. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 2
5. Guarde essa URL, você vai usar em vários lugares

**Exemplo de URL:**
```
postgresql://postgres.abcdefghijk:SuaSenhaAqui@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 2️⃣ DEPLOY DO DASHBOARD (Vercel)

### Passo 1: Preparar repositório GitHub

**Se ainda não tem o projeto no GitHub:**

1. Acesse https://github.com
2. Login na sua conta
3. Clique no **"+"** (canto superior direito) > **"New repository"**
4. Preencha:
   - **Repository name:** `painel-surebets`
   - **Description:** "Painel de Surebets em tempo real"
   - **Private** (recomendado)
5. Clique em **"Create repository"**

**Agora no seu computador (PowerShell):**

```powershell
cd "C:\Users\lucas\Desktop\Painel Surebets"

# Inicializar Git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Deploy inicial - Painel Surebets"

# Conectar com o GitHub (substitua SEU-USUARIO e painel-surebets pelo nome do seu repo)
git remote add origin https://github.com/SEU-USUARIO/painel-surebets.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

**Se pedir login:** Use seu usuário e senha do GitHub (ou Personal Access Token).

### Passo 2: Criar conta na Vercel

1. Acesse https://vercel.com
2. Clique em **"Start Deploying"**
3. Login com **GitHub** (use a mesma conta do passo anterior)
4. Autorize o acesso da Vercel ao GitHub

### Passo 3: Importar projeto

1. No dashboard da Vercel, clique em **"Add New..."** > **"Project"**
2. Encontre o repositório **`painel-surebets`** na lista
3. Clique em **"Import"**

### Passo 4: Configurar variáveis de ambiente

**ANTES de fazer deploy**, configure as variáveis:

1. Na página de configuração do projeto, role até **"Environment Variables"**
2. Adicione **TODAS** essas variáveis (clique em **"Add Another"** para cada):

| Name | Value |
|------|-------|
| `DATABASE_URL` | Cole a URL do Supabase (do passo 1.3) |
| `JWT_SECRET` | Gere uma chave aleatória* |
| `API_SECRET` | Gere outra chave aleatória* |
| `ADMIN_EMAIL` | `admin@seudominio.com` (seu e-mail) |
| `ADMIN_PASSWORD` | Senha forte do admin |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | Deixe vazio por enquanto |

**\*Para gerar chaves aleatórias seguras no PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Execute duas vezes e use as chaves diferentes para JWT_SECRET e API_SECRET.

### Passo 5: Deploy!

1. Após adicionar todas as variáveis, clique em **"Deploy"**
2. Aguarde 2-5 minutos (Vercel vai instalar, compilar e publicar)
3. Quando aparecer **"Congratulations!"**, clique no botão **"Visit"**
4. Copie a URL do seu painel (exemplo: `https://painel-surebets-abc123.vercel.app`)

### Passo 6: Atualizar URL no ambiente

1. Volte no dashboard da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Edite a variável `NEXT_PUBLIC_APP_URL`
4. Cole a URL do seu painel (exemplo: `https://painel-surebets-abc123.vercel.app`)
5. Clique em **"Save"**
6. Vá em **Deployments** > clique nos **"..."** do último deploy > **"Redeploy"**

### Passo 7: Configurar banco de dados

Agora que o painel está online, precisamos criar as tabelas no banco:

```powershell
# No seu computador, atualize o .env com a URL do Supabase
# Edite o arquivo .env e substitua DATABASE_URL pela URL do Supabase

# Depois rode:
npx prisma db push
npx prisma generate
```

---

## 3️⃣ BOT DO TELEGRAM (Railway)

### Passo 1: Criar conta no Railway

1. Acesse https://railway.app
2. Clique em **"Login"**
3. Login com **GitHub** (mesma conta)
4. Autorize o acesso

### Passo 2: Criar novo projeto

1. No dashboard, clique em **"New Project"**
2. Escolha **"Deploy from GitHub repo"**
3. Autorize acesso ao repositório `painel-surebets`
4. Selecione o repositório na lista

### Passo 3: Configurar variáveis de ambiente

1. Após importar, clique na aba **"Variables"**
2. Adicione essas variáveis:

| Name | Value |
|------|-------|
| `TELEGRAM_BOT_TOKEN` | Seu token do @BotFather |
| `TELEGRAM_GROUP_ID` | ID do grupo (-5053501924) |
| `API_URL` | URL do Vercel (https://painel-surebets-abc123.vercel.app) |
| `API_SECRET` | **MESMA** chave usada no Vercel |

### Passo 4: Configurar start command

1. Ainda no Railway, vá na aba **"Settings"**
2. Role até **"Start Command"**
3. Digite: `node telegram-bot-new.js`
4. Clique em **"Update"**

### Passo 5: Deploy

1. Railway vai automaticamente fazer o deploy
2. Aguarde 1-2 minutos
3. Vá na aba **"Logs"** para ver se está rodando
4. Você deve ver: `"🤖 Bot do Telegram iniciado e monitorando mensagens..."`

### Passo 6: Verificar se está funcionando

1. Envie uma mensagem de teste no grupo do Telegram
2. Aguarde 5-10 segundos
3. Acesse seu painel na Vercel
4. Verifique se o sinal apareceu!

---

## 4️⃣ DOMÍNIO PRÓPRIO (Opcional)

Se você quiser um domínio customizado (ex: `seusite.com` ao invés de `vercel.app`):

### Vercel:

1. Compre um domínio (Registro.br, GoDaddy, Namecheap)
2. Na Vercel, vá em **Settings** > **Domains**
3. Adicione seu domínio
4. Configure os DNS conforme instruções da Vercel
5. Aguarde propagação (1-24 horas)

---

## 5️⃣ MONITORAMENTO E MANUTENÇÃO

### Verificar se tudo está online:

**Painel (Vercel):**
- Dashboard da Vercel mostra status e logs
- Acesse a URL do painel no navegador

**Bot (Railway):**
- Aba "Logs" mostra atividade em tempo real
- Deve mostrar mensagens quando sinais chegam

**Banco (Supabase):**
- Dashboard do Supabase mostra uso
- Aba "Table Editor" permite ver/editar dados

### Custos e Limites:

**Vercel (Grátis):**
- 100 GB bandwidth/mês
- Invocações ilimitadas
- Se ultrapassar: upgrade para Pro ($20/mês)

**Supabase (Grátis):**
- 500 MB storage
- 2 GB bandwidth/mês
- Se ultrapassar: upgrade para Pro ($25/mês)

**Railway ($5/mês):**
- $5 de crédito grátis/mês
- Bot consome ~$2-3/mês
- Se ultrapassar: paga o excedente

---

## 6️⃣ ATUALIZAR O SISTEMA

Quando você fizer mudanças no código:

```powershell
cd "C:\Users\lucas\Desktop\Painel Surebets"

# Adicionar mudanças
git add .

# Commit com descrição
git commit -m "Descrição da mudança"

# Enviar para GitHub
git push

# Vercel e Railway vão automaticamente detectar e fazer redeploy!
```

---

## 🆘 PROBLEMAS COMUNS

### Build falhou na Vercel
- Verifique se todas as variáveis de ambiente estão corretas
- Veja os logs de build para identificar o erro
- Certifique-se que `package.json` está correto

### Bot não está recebendo sinais
- Verifique se `API_SECRET` é o mesmo na Vercel e Railway
- Confirme `API_URL` aponta para URL correta do Vercel
- Veja logs no Railway para erros

### Erro de conexão com banco
- Confirme que `DATABASE_URL` está correto
- Verifique senha do Supabase
- Rode `npx prisma db push` novamente

### Painel não carrega
- Verifique DNS se usar domínio próprio
- Limpe cache do navegador
- Veja logs na Vercel

---

## 📊 RESUMO DO DEPLOY

| Componente | Onde | Custo | Status |
|------------|------|-------|--------|
| **Dashboard** | Vercel | Grátis | ✅ |
| **Banco de Dados** | Supabase | Grátis | ✅ |
| **Bot Telegram** | Railway | $5/mês | ✅ |
| **Domínio** | Opcional | ~R$40/ano | ⚪ |

**Total: R$ 0-25/mês** para sistema completo 24/7!

---

## ✅ CHECKLIST FINAL

- [ ] Banco criado no Supabase
- [ ] DATABASE_URL copiada e salva
- [ ] Projeto enviado para GitHub
- [ ] Deploy feito na Vercel
- [ ] Todas variáveis configuradas na Vercel
- [ ] `npx prisma db push` executado
- [ ] Painel acessível via URL
- [ ] Bot configurado no Railway
- [ ] Bot rodando e monitorando grupo
- [ ] Teste enviado e sinal apareceu no painel

---

## 🎉 PRONTO!

Seu sistema agora está 100% online e não depende mais do seu computador!

**Próximos passos:**
1. Aguardar aprovação PagBank para implementar pagamentos
2. Adicionar domínio próprio (opcional)
3. Começar a adicionar clientes!

**Suporte:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Railway: https://docs.railway.app

---

**Desenvolvido com ❤️ para escalar seu negócio de surebets!**
