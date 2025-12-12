# 🛠️ COMANDOS ÚTEIS - PAINEL SUREBETS

## 📦 Instalação

```powershell
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Criar banco de dados (desenvolvimento)
npx prisma db push

# Criar usuário admin inicial
npx ts-node prisma/seed.ts
```

## 🚀 Desenvolvimento Local

```powershell
# Rodar servidor Next.js
npm run dev

# Rodar bot do Telegram (em outro terminal)
node telegram-bot-new.js

# Acessar painel
# http://localhost:3002
```

## 🔐 Gerar Chaves Seguras

```powershell
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# API Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Banco de Dados

```powershell
# Ver estrutura do banco
npx prisma studio

# Resetar banco (CUIDADO: apaga tudo!)
npx prisma db push --force-reset

# Migrar mudanças do schema
npx prisma db push
```

## 🌐 Deploy

### 1. Preparar para GitHub

```powershell
# Inicializar Git
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "Deploy inicial"

# Conectar com GitHub (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/painel-surebets.git

# Enviar
git push -u origin main
```

### 2. Atualizar após mudanças

```powershell
# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição da mudança"

# Enviar (deploy automático na Vercel/Railway)
git push
```

## 🐛 Troubleshooting

### Limpar cache Next.js

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Reinstalar dependências

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Verificar servidor

```powershell
# Ver processos Node rodando
Get-Process node

# Matar todos os processos Node
Get-Process -Name node | Stop-Process -Force
```

### Testar API

```powershell
# Verificar se servidor está respondendo
Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing
```

## 📝 Logs

### Ver logs do bot

```powershell
# Rodar bot com saída detalhada
node telegram-bot-new.js

# Railway: ver logs online no dashboard
```

### Ver logs do Next.js

```powershell
# Logs aparecem no terminal onde rodou npm run dev

# Vercel: ver logs no dashboard > Deployments > Functions
```

## 🔄 Backup

### Backup do banco SQLite (local)

```powershell
# Copiar arquivo do banco
Copy-Item prisma/dev.db prisma/backup_$(Get-Date -Format 'yyyy-MM-dd').db
```

### Backup do PostgreSQL (Supabase)

```
1. Acessar dashboard do Supabase
2. Settings > Database > Database Backup
3. Fazer download do backup
```

## 🧪 Testes

### Enviar sinal de teste

```powershell
node add-test-signal.js
```

### Teste completo do fluxo

```
1. Enviar mensagem no grupo Telegram
2. Bot captura e envia para API
3. API salva no banco
4. Dashboard atualiza em tempo real
5. Som de notificação toca
```

## 📊 Monitoramento

### Vercel

```
Dashboard > seu-projeto > Deployments
- Ver status de builds
- Logs de execução
- Métricas de uso
```

### Railway

```
Dashboard > seu-bot > Logs
- Ver output em tempo real
- Erros e warnings
- Uso de recursos
```

### Supabase

```
Dashboard > seu-projeto
- Table Editor (ver dados)
- Database > Usage (métricas)
- Logs (queries executadas)
```

## 💰 Custos

### Verificar uso Vercel

```
Dashboard > Settings > Usage
- Bandwidth usado
- Function executions
- Build minutes
```

### Verificar uso Railway

```
Dashboard > Settings > Usage
- Créditos restantes
- Projeção de custo mensal
```

### Verificar uso Supabase

```
Dashboard > Settings > Billing
- Storage usado
- Bandwidth usado
- Database size
```

## 🆘 Suporte

- **Vercel:** https://vercel.com/docs
- **Railway:** https://docs.railway.app
- **Supabase:** https://supabase.com/docs
- **Prisma:** https://www.prisma.io/docs
- **Next.js:** https://nextjs.org/docs

## 📚 Arquivos Importantes

- `DEPLOY.md` - Guia completo de deploy
- `DEPLOY_RAPIDO.md` - Resumo rápido em 3 passos
- `.env.example` - Template de variáveis de ambiente
- `prisma/schema.prisma` - Estrutura do banco de dados
- `telegram-bot-new.js` - Bot do Telegram
- `vercel.json` - Configuração do Vercel
- `Procfile` - Configuração do Railway
