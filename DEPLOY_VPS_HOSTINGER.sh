#!/bin/bash
# Deploy Painel Surebets no VPS Hostinger
# Cole estes comandos um por vez no terminal SSH

echo "🚀 Iniciando deploy do Painel Surebets..."

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 18
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git

# 3. Verificar instalação
node -v
npm -v

# 4. Instalar PM2
echo "📦 Instalando PM2..."
npm install -g pm2

# 5. Criar diretório do projeto
echo "📁 Criando diretório..."
mkdir -p /var/www/surecapta
cd /var/www/surecapta

# 6. Clonar projeto do GitHub
echo "📥 Clonando projeto..."
git clone https://github.com/celdujacadesg2-sketch/painel-surebets.git .

# 7. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 8. Criar arquivo .env
echo "⚙️ Criando arquivo .env..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://neondb_owner:npg_GWaQWbhzWnX0@ep-fragrant-tree-a47x7w95-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="seu_jwt_secret_super_seguro_painel_surebets_2024"
NEXT_PUBLIC_API_URL="http://31.97.38.175:3000"
NODE_ENV="production"
TELEGRAM_BOT_TOKEN="7832215044:AAH0cdRLj8IHdDieMDxUIklBfVFtpKJ2rE0"
TELEGRAM_GROUP_ID="-5053501924"
API_URL="http://31.97.38.175:3000/api"
API_SECRET="sua-chave-api-secreta-para-enviar-sinais"
PORT=3000
EOF

# 9. Build do projeto
echo "🔨 Buildando projeto..."
npm run build

# 10. Iniciar com PM2
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 11. Configurar firewall
echo "🔒 Configurando firewall..."
ufw allow 3000/tcp
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 12. Verificar status
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status da aplicação:"
pm2 list
echo ""
echo "🌐 Acesse: http://31.97.38.175:3000"
echo "📝 Logs: pm2 logs surecapta"
