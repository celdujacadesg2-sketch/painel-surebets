require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Configurações
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID; // ID do grupo que envia sinais

const API_URL = process.env.API_URL;
const API_SECRET = process.env.API_SECRET;

if (process.env.NODE_ENV === 'production') {
  if (!API_URL) {
    console.error('❌ [FATAL] API_URL não definida em produção. Configure no .env.bot.production');
    process.exit(1);
  }
  if (!API_SECRET) {
    console.error('❌ [FATAL] API_SECRET não definida em produção. Configure no .env.bot.production');
    process.exit(1);
  }
}

if (!TELEGRAM_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN não configurado no .env');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log('🤖 Bot do Telegram iniciado e monitorando mensagens...');
console.log(`📡 API: ${API_URL}`);
if (TELEGRAM_GROUP_ID) {
  console.log(`📢 Monitorando grupo: ${TELEGRAM_GROUP_ID}`);
}

// Função para extrair informações do sinal (formato GreenSurebet)
function parseSinal(text, entities = []) {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    console.log('🔍 Parseando sinal com', lines.length, 'linhas');
    
    const signal = {
      sport: 'Futebol', // Default
      event: '',
      eventDate: null,
      market: '',
      roi: 0,
      odds: [],
      bookmakers: []
    };

    // Extrair URLs das entities (links do Telegram) - MELHORADO
    const urls = [];
    console.log(`   📎 Total de entities: ${entities.length}`);
    
    if (entities && entities.length > 0) {
      for (const entity of entities) {
        if (entity.type === 'text_link' && entity.url) {
          urls.push(entity.url);
          console.log(`   🔗 Text Link encontrado: ${entity.url}`);
        } else if (entity.type === 'url') {
          const url = text.substring(entity.offset, entity.offset + entity.length);
          urls.push(url);
          console.log(`   🔗 URL encontrada: ${url}`);
        }
      }
    }
    
    console.log(`   ✅ Total de URLs capturadas: ${urls.length}`);
    
    // Arrays para armazenar informações temporárias
    const bookmakerData = [];
    let currentData = null;
    
    // Processar cada linha
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      
      // Detectar data/hora (formatos: 11/12 às 14:30, 11/12 14:30, 12/12 10:00, etc) - pegar apenas a primeira
      if (!signal.eventDate && (line.includes('⏰') || line.includes('Data:'))) {
        const dateMatch = line.match(/(\d{1,2})\/(\d{1,2})(?:\s+às)?\s+(\d{1,2}):(\d{2})/i);
        if (dateMatch) {
          const [, day, month, hour, minute] = dateMatch;
          const year = new Date().getFullYear();
          const eventDate = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
          signal.eventDate = eventDate.toISOString();
          console.log(`   📅 Data do evento: ${day}/${month} às ${hour}:${minute}`);
        }
      }
      
      // Detectar evento (times) - PRIORIZAR linhas com ➡
      if (line.includes('➡') && line.includes(' - ')) {
        const eventName = line.replace(/➡/g, '').replace(/🔵/g, '').replace(/⚽/g, '').replace(/🏀/g, '').trim();
        // Só atualizar se não tiver um evento melhor (mais curto geralmente é o nome simplificado)
        if (!signal.event || eventName.length < signal.event.length) {
          signal.event = eventName;
          console.log(`   📍 Evento: ${signal.event}`);
        }
      }
      
      // Detectar esporte
      if (lower.includes('futebol') || lower.includes('⚽')) {
        signal.sport = 'Futebol';
      } else if (lower.includes('basquete') || lower.includes('nba') || lower.includes('🏀')) {
        signal.sport = 'Basquete';
      }
      
      // Detectar LUCRO (ROI)
      const lucroMatch = line.match(/LUCRO[:\s]*([\d.]+)%/i);
      if (lucroMatch) {
        signal.roi = parseFloat(lucroMatch[1]);
        console.log(`   💰 ROI: ${signal.roi}%`);
      }
      
      // Detectar casa de aposta com odd (🟡 Estrelabet: @2.40)
      if (line.includes('🟡') || line.match(/(Estrelabet|Pinnacle|NoviBet|Betano|22Bet|Bet365):/i)) {
        
        // Se já tinha uma casa anterior, finalizar ela
        if (currentData && currentData.odd) {
          bookmakerData.push(currentData);
        }
        
        const bookmakersNames = ['Estrelabet', 'Pinnacle', 'NoviBet', 'Betano', '22Bet', 'Bet365'];
        let bookmakersName = null;
        
        for (const name of bookmakersNames) {
          if (line.includes(name)) {
            bookmakersName = name;
            break;
          }
        }
        
        if (bookmakersName) {
          const oddsMatch = line.match(/@([\d.]+)/);
          if (oddsMatch) {
            currentData = {
              name: bookmakersName,
              odd: oddsMatch[1],
              selection: '',
              description: ''
            };
            console.log(`   🏠 Casa: ${bookmakersName} @${oddsMatch[1]}`);
          }
        }
      }
      
      // Detectar "Aposta:" (TO (1.5) Time1)
      if (line.includes('✅') && lower.includes('aposta:')) {
        const apostaMatch = line.match(/Aposta:\s*(.+)/i);
        if (apostaMatch && currentData) {
          currentData.selection = apostaMatch[1].trim();
          console.log(`   ✅ Aposta: ${currentData.selection}`);
        }
      }
      
      // Detectar "Descrição:" (Total Over (1.5) Time1)
      if (line.includes('✅') && lower.includes('descrição:')) {
        const descMatch = line.match(/Descrição:\s*(.+)/i);
        if (descMatch && currentData) {
          currentData.description = descMatch[1].trim();
          console.log(`   📝 Descrição: ${currentData.description}`);
        }
      }
    }
    
    // Adicionar última casa se existir
    if (currentData && currentData.odd) {
      bookmakerData.push(currentData);
    }
    
    console.log(`   📊 Total de casas encontradas: ${bookmakerData.length}`);
    
    // Associar URLs às casas (garantir que cada casa tenha seu link)
    bookmakerData.forEach((data, index) => {
      const url = urls[index] || `https://www.${data.name.toLowerCase().replace(/\s/g, '')}.com`;
      
      signal.odds.push({
        selection: `${data.selection} - ${data.description}`,
        value: data.odd
      });
      
      signal.bookmakers.push({
        name: data.name,
        url: url
      });
      
      console.log(`   🔗 ${index + 1}. ${data.name}: ${url}`);
    });
    
    // Validação
    if (!signal.event) {
      console.log('❌ Evento não encontrado');
      return null;
    }
    
    if (signal.bookmakers.length === 0) {
      console.log('❌ Nenhuma casa de aposta encontrada');
      return null;
    }
    
    // Verificar se tem pelo menos 2 casas
    if (signal.bookmakers.length < 2) {
      console.log('⚠️  Apenas 1 casa encontrada, sinal incompleto');
      return null;
    }
    
    // Usar primeira descrição como mercado principal
    if (signal.odds.length > 0) {
      const firstOdd = signal.odds[0];
      if (firstOdd.selection) {
        signal.market = firstOdd.selection.split(' - ')[1] || 'Surebet';
      }
    }
    
    if (!signal.market) signal.market = 'Surebet';
    if (signal.roi === 0) signal.roi = 2.5;
    
    console.log('✅ Sinal parseado com sucesso:');
    console.log(`   Evento: ${signal.event}`);
    console.log(`   Mercado: ${signal.market}`);
    console.log(`   ROI: ${signal.roi}%`);
    console.log(`   Casas: ${signal.bookmakers.length}`);
    signal.odds.forEach((odd, i) => {
      console.log(`   ${i + 1}. ${signal.bookmakers[i].name}: @${odd.value} - ${odd.selection}`);
      console.log(`      URL: ${signal.bookmakers[i].url}`);
    });
    
    return signal;
  } catch (error) {
    console.error('❌ Erro ao parsear sinal:', error);
    return null;
  }
}

// Função para enviar sinal para a API
async function enviarSinalParaAPI(signal) {
  try {
    const response = await axios.post(
      API_URL,
      {
        sport: signal.sport,
        event: signal.event,
        eventDate: signal.eventDate,
        market: signal.market,
        roi: signal.roi,
        odds: JSON.stringify(signal.odds),
        bookmakers: JSON.stringify(signal.bookmakers)
      },
      {
        headers: {
          'x-api-secret': API_SECRET,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Sinal enviado com sucesso:', signal.event);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar sinal:', error.response?.data || error.message);
    return false;
  }
}

// Monitorar mensagens do grupo
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text || msg.caption || '';
  
  // Debug: mostrar info COMPLETA da mensagem
  console.log('\n📨 ========== NOVA MENSAGEM ==========');
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Chat Type: ${msg.chat.type}`);
  console.log(`   Chat Title: ${msg.chat.title || msg.chat.first_name}`);
  console.log(`   From User: ${msg.from.first_name} ${msg.from.last_name || ''}`);
  console.log(`   From Username: @${msg.from.username || 'N/A'}`);
  console.log(`   Is Bot: ${msg.from.is_bot || false}`);
  console.log(`   Message Length: ${text.length}`);
  console.log(`   Group ID esperado: ${TELEGRAM_GROUP_ID || 'QUALQUER'}`);
  console.log(`   IDs Match: ${chatId === TELEGRAM_GROUP_ID}`);
  console.log('   Text preview:');
  console.log(`   ${text.substring(0, 200)}...`);
  console.log('=====================================\n');
  
  // TEMPORARIAMENTE DESABILITADO: Testar se recebe mensagens
  // if (TELEGRAM_GROUP_ID && chatId !== TELEGRAM_GROUP_ID) {
  //   console.log(`❌ MENSAGEM IGNORADA - Chat ID ${chatId} diferente de ${TELEGRAM_GROUP_ID}`);
  //   return;
  // }
  
  console.log('✅ Processando mensagem...');
  
  // Debug: mostrar entities (links)
  if (msg.entities && msg.entities.length > 0) {
    console.log('📎 Entities encontradas:', msg.entities.length);
    for (const entity of msg.entities) {
      console.log(`   - Type: ${entity.type}, URL: ${entity.url || 'N/A'}`);
    }
  }
  
  // TESTE: Processar QUALQUER mensagem por enquanto
  console.log('🎯 Tentando processar como sinal...');
  
  const signal = parseSinal(text, msg.entities || []);
  
  if (signal) {
    console.log('✨ Sinal validado! Enviando para API...');
    const success = await enviarSinalParaAPI(signal);
    
    if (success) {
      console.log('🎉 Sinal enviado com sucesso para o painel!');
    } else {
      console.log('❌ Falha ao enviar sinal para o painel');
    }
  } else {
    console.log('⚠️  Não foi possível extrair informações suficientes do sinal');
  }
});

// Comandos úteis
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
    '🤖 Bot de Sinais Ativo!\n\n' +
    '📡 Estou monitorando este grupo e enviando sinais automaticamente para o painel.\n\n' +
    'Comandos:\n' +
    '/status - Ver status do bot\n' +
    '/chatid - Ver ID deste chat\n' +
    '/test - Enviar sinal de teste'
  );
});

bot.onText(/\/status/, (msg) => {
  bot.sendMessage(msg.chat.id, 
    '✅ Bot Online\n' +
    `📡 API: ${API_URL}\n` +
    `🆔 Chat ID: ${msg.chat.id}`
  );
});

bot.onText(/\/chatid/, (msg) => {
  bot.sendMessage(msg.chat.id, 
    `🆔 ID deste chat: \`${msg.chat.id}\`\n\n` +
    'Use este ID na variável TELEGRAM_GROUP_ID no .env',
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/test/, async (msg) => {
  const testSignal = {
    sport: 'Futebol',
    event: 'Flamengo vs Palmeiras',
    market: 'Resultado Final',
    roi: 5.2,
    odds: [
      { selection: '1', value: '2.10' },
      { selection: 'X', value: '3.40' }
    ],
    bookmakers: [
      { name: 'Bet365', url: 'https://www.bet365.com' },
      { name: 'Betano', url: 'https://www.betano.com' }
    ]
  };
  
  const success = await enviarSinalParaAPI(testSignal);
  
  if (success) {
    bot.sendMessage(msg.chat.id, '✅ Sinal de teste enviado com sucesso!');
  } else {
    bot.sendMessage(msg.chat.id, '❌ Erro ao enviar sinal de teste');
  }
});

// Tratamento de erros
bot.on('polling_error', (error) => {
  console.error('Erro no polling:', error.message);
});

process.on('SIGINT', () => {
  console.log('\n👋 Encerrando bot...');
  bot.stopPolling();
  process.exit(0);
});
