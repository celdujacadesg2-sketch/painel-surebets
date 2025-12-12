# 🚀 Deploy no Hostinger com Domínio surecapta.com

## 📋 Pré-requisitos
- Conta Hostinger com Node.js habilitado
- Domínio surecapta.com configurado
- Acesso SSH ao servidor

## 🔧 Passo 1: Preparar o Projeto Localmente

### 1.1 Configurar variáveis de ambiente
Crie arquivo `.env.production`:

```env
DATABASE_URL="postgresql://neondb_owner:your_password@ep-fragrant-tree-a47x7w95-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_jwt_secret_here"
NEXT_PUBLIC_API_URL="https://surecapta.com"
NODE_ENV="production"
```

### 1.2 Build local para testar
```bash
npm run build
npm start
```

## 🌐 Passo 2: Configurar Hostinger

### 2.1 Conectar domínio surecapta.com
1. No painel Hostinger, vá em **Domínios**
2. Clique em **surecapta.com** 
3. Vá em **DNS/Nameservers**
4. Adicione registro A apontando para IP do servidor Node.js
5. Aguarde propagação DNS (até 24h)

### 2.2 Configurar Node.js App
1. Acesse **Hospedagem** → **Node.js**
2. Clique em **Criar Aplicação**
3. Configure:
   - **Domínio:** surecapta.com
   - **Versão Node.js:** 18.x ou superior
   - **Diretório raiz:** `/`
   - **Comando de inicialização:** `npm start`
   - **Porta:** 3000 (Next.js padrão)

## 📦 Passo 3: Upload do Projeto

### Opção A: Via SSH (Recomendado)

```bash
# 1. Conectar via SSH
ssh u123456789@your-server.hostinger.com

# 2. Navegar para diretório da aplicação
cd domains/surecapta.com/public_html

# 3. Clonar repositório
git clone https://github.com/celdujacadesg2-sketch/painel-surebets.git .

# 4. Instalar dependências
npm install

# 5. Criar arquivo .env.production
nano .env.production
# (Cole as variáveis de ambiente)

# 6. Build da aplicação
npm run build

# 7. Iniciar aplicação
npm start
```

### Opção B: Via FTP/File Manager

1. Zipar projeto localmente (exceto node_modules e .next)
2. Upload via File Manager do Hostinger
3. Descompactar no servidor
4. Via SSH, rodar:
```bash
npm install
npm run build
npm start
```

## 🔄 Passo 4: Configurar PM2 (Manter app rodando)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar app com PM2
pm2 start npm --name "surecapta" -- start

# Salvar configuração
pm2 save

# Configurar auto-restart
pm2 startup
```

## 🤖 Passo 5: Atualizar Bot

Edite `telegram-bot-new.js` com novo domínio:

```javascript
const API_BASE_URL = 'https://surecapta.com/api';
```

Commit e push:
```bash
git add telegram-bot-new.js
git commit -m "Update API URL to surecapta.com"
git push
```

No servidor, pull as mudanças:
```bash
git pull
pm2 restart surecapta
```

## ✅ Passo 6: Verificar Funcionamento

1. Acesse: https://surecapta.com
2. Teste registro: https://surecapta.com/register
3. Teste login: https://surecapta.com/login
4. Verifique dashboard com sinais em tempo real

## 🔐 Passo 7: Configurar SSL (HTTPS)

No painel Hostinger:
1. Vá em **SSL**
2. Selecione domínio **surecapta.com**
3. Ative **Let's Encrypt SSL** (gratuito)
4. Aguarde ativação (alguns minutos)

## 🚨 Solução de Problemas

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Porta em uso
```bash
pm2 stop all
pm2 start npm --name "surecapta" -- start
```

### Banco de dados não conecta
- Verificar se IP do servidor Hostinger está na whitelist do Neon
- Ir em Neon dashboard → Settings → IP Allow List → Add Hostinger IP

### App não inicia
```bash
# Ver logs
pm2 logs surecapta

# Reiniciar
pm2 restart surecapta
```

## 📊 Monitoramento

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs surecapta --lines 100

# Reiniciar se necessário
pm2 restart surecapta

# Parar aplicação
pm2 stop surecapta
```

## 🎯 Checklist Final

- [ ] Domínio surecapta.com apontando para Hostinger
- [ ] SSL/HTTPS configurado e funcionando
- [ ] Aplicação rodando com PM2
- [ ] Bot atualizado com nova URL
- [ ] Registro de usuários funcionando
- [ ] Dashboard exibindo sinais
- [ ] Banco Neon conectado corretamente

## 💰 Custos

- **Hostinger:** ~R$ 10-30/mês (plano Node.js)
- **Domínio:** Já está pago
- **Neon Database:** R$ 0/mês (continua grátis)
- **Total:** ~R$ 10-30/mês

---

**Vantagens da migração:**
✅ Domínio próprio profissional (surecapta.com)
✅ Mais controle sobre servidor
✅ Sem limite de builds (Vercel limitava)
✅ Suporte brasileiro
