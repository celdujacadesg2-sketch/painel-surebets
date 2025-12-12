// Exemplo de integração com Telegram Bot (Node.js)

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/signals/create';
const API_SECRET = process.env.API_SECRET || 'sua-chave-api-secreta-para-enviar-sinais';

async function enviarSinal(sport, event, market, roi, odds, bookmakers) {
  try {
    const response = await axios.post(
      API_URL,
      {
        sport,
        event,
        market,
        roi,
        odds,
        bookmakers,
      },
      {
        headers: {
          'x-api-secret': API_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Sinal enviado com sucesso:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar sinal:', error.response?.data || error.message);
    return false;
  }
}

// Exemplo de uso com Telegram Bot
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Comando: /sinal
bot.onText(/\/sinal/, (msg) => {
  const chatId = msg.chat.id;
  
  // Exemplo de sinal recebido do Telegram
  enviarSinal(
    'Futebol',
    'Real Madrid vs Barcelona',
    'Over/Under 2.5',
    4.2,
    [
      { selection: 'Over 2.5', value: '1.75' },
      { selection: 'Under 2.5', value: '2.15' }
    ],
    [
      { name: 'Bet365', url: 'https://bet365.com' },
      { name: 'Betano', url: 'https://betano.com' }
    ]
  );

  bot.sendMessage(chatId, '✅ Sinal enviado para o painel!');
});

console.log('🤖 Bot do Telegram rodando...');
