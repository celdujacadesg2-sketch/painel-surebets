#!/bin/bash
# Script para deploy do Bot Telegram no VPS Hostinger

echo "🤖 Configurando Bot Telegram no VPS..."

# Criar diretório para o bot
mkdir -p /var/www/telegram-bot
cd /var/www/telegram-bot

# Baixar apenas os arquivos necessários do bot
curl -o telegram-bot-new.js https://raw.githubusercontent.com/celdujacadesg2-sketch/painel-surebets/main/telegram-bot-new.js
curl -o package.json https://raw.githubusercontent.com/celdujacadesg2-sketch/painel-surebets/main/bot-package.json

# Criar .env
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN="7832215044:AAH0cdRLj8IHdDieMDxUIklBfVFtpKJ2rE0"
TELEGRAM_GROUP_ID="-5053501924"
API_URL="https://surecapta.com/api"
API_SECRET="f11c79dcd3e5e0f8e8c6a5d3d9f0a5c5e3f0c8a5d3d9f0a5c5e3f0c8a5d3d9f0"
NODE_ENV="production"
EOF

# Instalar dependências
npm install

# Iniciar bot com PM2
pm2 start telegram-bot-new.js --name telegram-bot
pm2 save

echo "✅ Bot configurado e rodando!"
echo "📊 Status: pm2 list"
echo "📝 Logs: pm2 logs telegram-bot"
