# 🤖 Como Conectar o Bot do Telegram aos Sinais

## 📋 Pré-requisitos

- Node.js instalado
- Conta no Telegram
- Acesso ao grupo que envia os sinais

## 🚀 Passo a Passo

### 1️⃣ Criar o Bot no Telegram

1. Abra o Telegram e busque por **@BotFather**
2. Envie o comando `/newbot`
3. Escolha um nome para o bot (ex: "Sinais Surebets Bot")
4. Escolha um username (ex: "sinais_surebets_bot")
5. O BotFather vai te dar um **TOKEN** - guarde ele!

```
Exemplo de token: 7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

### 2️⃣ Adicionar o Bot ao Grupo

1. Adicione o bot ao grupo que recebe os sinais
2. Dê permissão de **administrador** para o bot (ou pelo menos permissão de ler mensagens)

### 3️⃣ Descobrir o ID do Grupo

1. No terminal, instale as dependências:
```bash
npm install node-telegram-bot-api axios dotenv
```

2. Configure o arquivo `.env` com o token do bot:
```env
TELEGRAM_BOT_TOKEN="seu-token-aqui"
```

3. Rode o bot temporariamente:
```bash
node telegram-bot.js
```

4. No grupo do Telegram, envie o comando:
```
/chatid
```

5. O bot vai responder com o ID do grupo. Copie esse ID!

### 4️⃣ Configurar o .env

Edite o arquivo `.env` na raiz do projeto:

```env
# Token do bot do Telegram
TELEGRAM_BOT_TOKEN="7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"

# ID do grupo (opcional - deixe vazio para monitorar todos)
TELEGRAM_GROUP_ID="-1001234567890"

# Chave secreta da API (já configurada)
API_SECRET="sua-chave-api-secreta-para-enviar-sinais"

# URL da API local
API_URL="http://localhost:3002/api/signals/create"
```

### 5️⃣ Rodar o Bot

No terminal, execute:

```bash
node telegram-bot.js
```

Você verá:
```
🤖 Bot do Telegram iniciado e monitorando mensagens...
📡 API: http://localhost:3002/api/signals/create
📢 Monitorando grupo: -1001234567890
```

### 6️⃣ Testar o Bot

Envie `/test` no grupo para testar se o bot está funcionando.

## 📝 Formato dos Sinais

O bot detecta automaticamente sinais com estas palavras-chave:
- "sinal"
- "surebet"
- "aposta"
- " vs " ou " x "
- "@" (odds)
- "roi"

### Exemplo de Mensagem que Será Detectada:

```
⚽ SINAL - FUTEBOL

🏆 Real Madrid vs Barcelona
📊 Mercado: Resultado Final
💰 ROI: 4.5%

Casa 1: 1.85 @Bet365
Casa 2: 2.15 @Betano

✅ Aposte agora!
```

O bot vai extrair:
- Esporte: Futebol
- Evento: Real Madrid vs Barcelona
- Mercado: Resultado Final
- ROI: 4.5
- Odds: [1.85, 2.15]
- Casas: Bet365, Betano

## 🔧 Personalizações

### Ajustar o Parser de Sinais

Se o formato dos sinais do seu grupo for diferente, edite a função `parseSinal()` no arquivo `telegram-bot.js`.

### Desabilitar Respostas Automáticas

Por padrão, o bot NÃO responde no grupo. Se quiser que ele responda, descomente estas linhas:

```javascript
// await bot.sendMessage(chatId, '✅ Sinal recebido e enviado para o painel!', {
//   reply_to_message_id: msg.message_id
// });
```

## 🛠️ Comandos do Bot

- `/start` - Informações do bot
- `/status` - Ver se o bot está online
- `/chatid` - Ver o ID do chat atual
- `/test` - Enviar um sinal de teste

## 🔄 Rodar em Produção

### Opção 1: PM2 (Recomendado)

```bash
npm install -g pm2
pm2 start telegram-bot.js --name "telegram-bot"
pm2 save
pm2 startup
```

### Opção 2: Screen (Linux)

```bash
screen -S telegram-bot
node telegram-bot.js
# Ctrl+A depois D para desanexar
```

### Opção 3: Windows Service

Use `node-windows` para criar um serviço do Windows.

## ❓ Problemas Comuns

### Bot não recebe mensagens

- Certifique-se que o bot tem permissão de ler mensagens no grupo
- Verifique se o bot é administrador do grupo
- Confirme que o `TELEGRAM_GROUP_ID` está correto

### Sinais não chegam ao painel

- Verifique se o servidor Next.js está rodando (`npm run dev`)
- Confirme que o `API_SECRET` no `.env` está correto
- Veja os logs do bot para ver se há erros

### Bot fica offline

- Use PM2 ou outro gerenciador de processos
- Configure restart automático

## 📊 Logs

O bot mostra logs no console:

```
📨 Nova mensagem recebida:
   Chat: Grupo Sinais VIP (-1001234567890)
   User: João Silva
   Text: ⚽ SINAL - FUTEBOL...
🎯 Possível sinal detectado! Processando...
✨ Sinal parseado: { sport: 'Futebol', event: 'Real Madrid vs Barcelona', ... }
✅ Sinal enviado com sucesso: Real Madrid vs Barcelona
```

## 🎯 Próximos Passos

Depois que o bot estiver funcionando:

1. Os sinais aparecerão automaticamente no Dashboard
2. Clientes logados verão os sinais em tempo real
3. Sinais expiram após 2 horas automaticamente
4. Use as estatísticas para acompanhar o desempenho
