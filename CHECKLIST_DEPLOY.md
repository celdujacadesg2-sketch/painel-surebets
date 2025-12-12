# ✅ CHECKLIST DE DEPLOY

## 📋 PRÉ-REQUISITOS

- [ ] Node.js instalado (v18+)
- [ ] Git instalado
- [ ] Conta no GitHub
- [ ] Token do bot Telegram (@BotFather)
- [ ] Bot adicionado no grupo
- [ ] ID do grupo descoberto

---

## 1️⃣ SUPABASE (Banco de Dados)

- [ ] Conta criada em https://supabase.com
- [ ] Projeto criado com nome "painel-surebets"
- [ ] Region: South America (São Paulo)
- [ ] Senha do banco anotada
- [ ] Connection String (URI) copiada
- [ ] URL do banco salva em local seguro

**URL do Supabase:**
```
postgresql://postgres.[ID]:[SENHA]@[HOST].pooler.supabase.com:5432/postgres
```

---

## 2️⃣ GITHUB (Controle de Versão)

- [ ] Repositório criado: `painel-surebets`
- [ ] Repositório configurado como Private
- [ ] Git inicializado no projeto (`git init`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Primeiro commit feito (`git commit -m "Deploy inicial"`)
- [ ] Remote configurado (`git remote add origin ...`)
- [ ] Push para GitHub (`git push -u origin main`)

**URL do Repositório:**
```
https://github.com/[SEU-USUARIO]/painel-surebets
```

---

## 3️⃣ VERCEL (Dashboard + API)

### Deploy Inicial

- [ ] Conta criada em https://vercel.com
- [ ] Login com GitHub
- [ ] Projeto importado do repositório
- [ ] Build command: `prisma generate && next build` (automático)
- [ ] Install command: `npm install` (automático)

### Variáveis de Ambiente

- [ ] `DATABASE_URL` = [URL do Supabase]
- [ ] `JWT_SECRET` = [Chave aleatória 32 bytes]
- [ ] `API_SECRET` = [Outra chave aleatória]
- [ ] `ADMIN_EMAIL` = [seu@email.com]
- [ ] `ADMIN_PASSWORD` = [SenhaForte123]
- [ ] `NODE_ENV` = production
- [ ] `NEXT_PUBLIC_APP_URL` = [vazio por enquanto]

### Após Deploy

- [ ] Build concluído com sucesso
- [ ] URL do painel copiada
- [ ] `NEXT_PUBLIC_APP_URL` atualizada com URL do painel
- [ ] Redeploy executado
- [ ] Painel acessível via navegador

**URL do Painel:**
```
https://painel-surebets-[ID].vercel.app
```

---

## 4️⃣ BANCO DE DADOS (Configuração)

- [ ] `.env` local atualizado com URL do Supabase
- [ ] `npx prisma generate` executado
- [ ] `npx prisma db push` executado sem erros
- [ ] Tabelas criadas no Supabase (verificar no Table Editor)
- [ ] `npx ts-node prisma/seed.ts` executado (criar admin)

---

## 5️⃣ RAILWAY (Bot Telegram)

### Deploy

- [ ] Conta criada em https://railway.app
- [ ] Login com GitHub
- [ ] Novo projeto criado
- [ ] Repositório conectado
- [ ] Deploy from GitHub selecionado

### Variáveis de Ambiente

- [ ] `TELEGRAM_BOT_TOKEN` = [Token do @BotFather]
- [ ] `TELEGRAM_GROUP_ID` = [ID do grupo com sinais]
- [ ] `API_URL` = [URL do Vercel]
- [ ] `API_SECRET` = [MESMA chave usada no Vercel]

### Configuração

- [ ] Start Command: `node telegram-bot-new.js`
- [ ] Deploy concluído
- [ ] Logs mostram: "🤖 Bot do Telegram iniciado..."
- [ ] Sem erros nos logs

---

## 6️⃣ TESTES

### Teste de Acesso

- [ ] Painel acessível via URL
- [ ] Login funciona (admin@... / senha)
- [ ] Dashboard carrega sem erros
- [ ] Menu de navegação funciona

### Teste de Sinais

- [ ] Mensagem de teste enviada no grupo Telegram
- [ ] Bot capturou a mensagem (verificar logs Railway)
- [ ] Sinal apareceu no painel (recarregar página)
- [ ] Som de notificação tocou
- [ ] Informações do sinal corretas
- [ ] Links das casas funcionam

### Teste de Autenticação

- [ ] Logout funciona
- [ ] Login novamente funciona
- [ ] Páginas protegidas não acessíveis sem login
- [ ] Token JWT sendo gerado corretamente

---

## 7️⃣ OTIMIZAÇÕES (Opcional)

- [ ] Domínio próprio configurado
- [ ] DNS propagado (24-48h)
- [ ] SSL/HTTPS funcionando
- [ ] Favicon customizado
- [ ] Meta tags para SEO

---

## 8️⃣ DOCUMENTAÇÃO

- [ ] README.md atualizado
- [ ] Credenciais salvas em local seguro
- [ ] URLs importantes anotadas
- [ ] Senhas em gerenciador de senhas

---

## 9️⃣ MONITORAMENTO

- [ ] Vercel Dashboard favoritado
- [ ] Railway Dashboard favoritado
- [ ] Supabase Dashboard favoritado
- [ ] Alertas configurados (opcional)

---

## 🎯 VERIFICAÇÃO FINAL

- [ ] Sistema acessível 24/7
- [ ] Não depende mais do PC local
- [ ] Bot capturando sinais automaticamente
- [ ] Dashboard atualizando em tempo real
- [ ] Sem erros nos logs
- [ ] Backup do banco configurado
- [ ] Custos dentro do esperado

---

## 📊 INFORMAÇÕES IMPORTANTES

### URLs

| Serviço | URL |
|---------|-----|
| Painel | https://painel-surebets-[ID].vercel.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Railway Dashboard | https://railway.app/dashboard |
| Supabase Dashboard | https://app.supabase.com |
| GitHub Repo | https://github.com/[USER]/painel-surebets |

### Credenciais

⚠️ **NUNCA compartilhe essas informações!**

- [ ] DATABASE_URL salva
- [ ] JWT_SECRET salvo
- [ ] API_SECRET salvo
- [ ] TELEGRAM_BOT_TOKEN salvo
- [ ] Senha admin salva
- [ ] Senha Supabase salva

### Custos Mensais

- Vercel: R$ 0 (até 100GB bandwidth)
- Supabase: R$ 0 (até 500MB storage)
- Railway: ~R$ 25 ($5)
- **Total: R$ 25/mês**

---

## 🆘 PROBLEMAS?

### Build falhou na Vercel
1. Ver logs de build
2. Verificar variáveis de ambiente
3. Confirmar package.json correto
4. Testar build local: `npm run build`

### Bot não funciona
1. Verificar logs no Railway
2. Confirmar API_SECRET igual em Vercel e Railway
3. Verificar API_URL correto
4. Testar token do Telegram

### Banco não conecta
1. Verificar DATABASE_URL
2. Confirmar senha do Supabase
3. Testar conexão com Prisma Studio
4. Verificar IP whitelist no Supabase

### Painel não carrega
1. Verificar deploy concluído na Vercel
2. Limpar cache do navegador
3. Testar em modo anônimo
4. Ver logs de função na Vercel

---

## ✅ DEPLOY CONCLUÍDO!

Parabéns! Seu sistema agora está 100% online e rodando na nuvem! 🎉

**Próximos passos:**
1. [ ] Adicionar sistema de pagamentos (aguardar PagBank)
2. [ ] Convidar primeiros clientes para teste
3. [ ] Coletar feedback
4. [ ] Iterar e melhorar

---

**Data do Deploy:** _______________

**Feito por:** _______________

**Custos estimados:** R$ 25/mês

**Capacidade:** 50-100 usuários simultâneos
