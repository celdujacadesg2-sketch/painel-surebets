require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Configurações
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_GROUP_IDS = process.env.TELEGRAM_GROUP_ID
  ? process.env.TELEGRAM_GROUP_ID.split(',').map(id => id.trim())
  : null;

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
if (TELEGRAM_GROUP_IDS) {
  console.log(`📢 Monitorando grupos: ${TELEGRAM_GROUP_IDS.join(', ')}`);
}

// Função para extrair informações do sinal (formato GreenSurebet EXATO)
function parseSinal(text, entities = []) {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    console.log('🔍 Parseando sinal com', lines.length, 'linhas');
    
    const signal = {
      sport: '',
      event: '',
      eventDate: null,
      market: '',
      roi: 0,
      odds: [],
      bookmakers: []
    };

    // Extrair URLs das entities
    const urls = [];
    if (entities && entities.length > 0) {
      for (const entity of entities) {
        if (entity.type === 'text_link' && entity.url) {
          urls.push(entity.url);
        }
      }
    }
    console.log(`   📎 ${urls.length} links encontrados`);

    let bookmaker1 = null;
    let bookmaker2 = null;
    let currentBookmaker = null;
    let eventDate1 = null;
    let eventDate2 = null;
    let dateCount = 0;
    
    // Processar cada linha
    for (const line of lines) {
      // 1. CASAS (🏘 Casas: NoviBet x Pinnacle)
      if (line.includes('🏘') && line.includes('Casas:')) {
        const casasMatch = line.match(/Casas:\s*(.+?)\s+x\s+(.+)/i);
        if (casasMatch) {
          bookmaker1 = { name: casasMatch[1].trim(), odd: '', aposta: '' };
          bookmaker2 = { name: casasMatch[2].trim(), odd: '', aposta: '' };
          console.log(`   🏠 Casas: ${bookmaker1.name} x ${bookmaker2.name}`);
        }
      }
      
      // 2. ROI (💰 LUCRO: 13.08%)
      if (line.includes('💰') && line.includes('LUCRO:')) {
        const roiMatch = line.match(/LUCRO:\s*([\d.]+)%/i);
        if (roiMatch) {
          signal.roi = parseFloat(roiMatch[1]);
          console.log(`   💰 ROI: ${signal.roi}%`);
        }
      }
      
      // 3. TIMES (➡ Ferro Carril Oeste - Ciclista Olimpico De La Banda)
      if (!signal.event && line.includes('➡') && line.includes(' - ')) {
        signal.event = line.replace(/➡/g, '').trim();
        console.log(`   📍 Times: ${signal.event}`);
      }
      
      // 4. ESPORTE + LIGA (🏆 Basquete / Argentina - La Liga Proximo)
      if (!signal.sport && line.includes('🏆')) {
        signal.sport = line.replace(/🏆/g, '').trim();
        console.log(`   ⚽ Esporte/Liga: ${signal.sport}`);
      }
      
      // 5. DATA/HORA (⏰ Data: 12/12 20:05) - capturar ambas
      if (line.includes('⏰') && line.includes('Data:')) {
        const dateMatch = line.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);
        if (dateMatch) {
          const [, day, month, hour, minute] = dateMatch;
          const year = new Date().getFullYear();
          const eventDate = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)).toISOString();
          const timeStr = `${day}/${month} às ${hour}:${minute}`;
          
          dateCount++;
          if (dateCount === 1) {
            eventDate1 = { iso: eventDate, display: timeStr };
            signal.eventDate = eventDate; // Usar primeira como padrão
            console.log(`   📅 Data Casa 1: ${timeStr}`);
          } else if (dateCount === 2) {
            eventDate2 = { iso: eventDate, display: timeStr };
            console.log(`   📅 Data Casa 2: ${timeStr}`);
          }
        }
      }
      
      // 6. PRIMEIRA CASA (🟡 NoviBet: @2.45)
      if (bookmaker1 && !bookmaker1.odd && line.includes('🟡') && line.includes(bookmaker1.name)) {
        const oddMatch = line.match(/@([\d.]+)/);
        if (oddMatch) {
          bookmaker1.odd = oddMatch[1];
          currentBookmaker = bookmaker1;
          console.log(`   🟡 ${bookmaker1.name}: @${bookmaker1.odd}`);
        }
      }
      
      // 7. SEGUNDA CASA (🟡 Pinnacle: @2.10)
      if (bookmaker2 && !bookmaker2.odd && line.includes('🟡') && line.includes(bookmaker2.name)) {
        const oddMatch = line.match(/@([\d.]+)/);
        if (oddMatch) {
          bookmaker2.odd = oddMatch[1];
          currentBookmaker = bookmaker2;
          console.log(`   🟡 ${bookmaker2.name}: @${bookmaker2.odd}`);
        }
      }
      
      // 8. APOSTA (✅ Aposta: AH1 (-14.5) with OT)
      if (currentBookmaker && !currentBookmaker.aposta && line.includes('✅') && line.includes('Aposta:')) {
        const apostaMatch = line.match(/Aposta:\s*(.+)/i);
        if (apostaMatch) {
          currentBookmaker.aposta = apostaMatch[1].trim();
          console.log(`   ✅ ${currentBookmaker.name} Aposta: ${currentBookmaker.aposta}`);
        }
      }
    }
    
    // Montar estrutura final
    if (bookmaker1 && bookmaker1.odd && bookmaker1.aposta) {
      signal.odds.push({
        selection: bookmaker1.aposta,
        value: bookmaker1.odd,
        eventTime: eventDate1 ? eventDate1.display : null
      });
      signal.bookmakers.push({
        name: bookmaker1.name,
        url: urls[0] || `https://www.${bookmaker1.name.toLowerCase().replace(/\s/g, '')}.com`,
        eventTime: eventDate1 ? eventDate1.display : null
      });
    }
    
    if (bookmaker2 && bookmaker2.odd && bookmaker2.aposta) {
      signal.odds.push({
        selection: bookmaker2.aposta,
        value: bookmaker2.odd,
        eventTime: eventDate2 ? eventDate2.display : null
      });
      signal.bookmakers.push({
        name: bookmaker2.name,
        url: urls[1] || `https://www.${bookmaker2.name.toLowerCase().replace(/\s/g, '')}.com`,
        eventTime: eventDate2 ? eventDate2.display : null
      });
    }
    
    // Verificar se horários são diferentes
    const timesDifferent = eventDate1 && eventDate2 && eventDate1.iso !== eventDate2.iso;
    if (timesDifferent) {
      signal.timesWarning = true;
      console.log(`   ⚠️  HORÁRIOS DIFERENTES! ${eventDate1.display} vs ${eventDate2.display}`);
    }
    
    // Market = liga completa (se tiver) ou primeira aposta
    if (!signal.market && signal.odds.length > 0) {
      signal.market = signal.odds[0].selection;
    }
    
    // Market = esporte/liga completo
    if (signal.sport) {
      signal.market = signal.sport;
    }
    
    // Validação
    if (!signal.event || signal.bookmakers.length < 2 || signal.roi === 0) {
      console.log('❌ Sinal incompleto');
      return null;
    }
    
    // Extrair apenas o esporte base para o campo sport
    if (signal.sport && signal.sport.toLowerCase().includes('basquete')) {
      signal.sport = 'Basquete';
    } else if (signal.sport && signal.sport.toLowerCase().includes('futebol')) {
      signal.sport = 'Futebol';
    } else if (!signal.sport) {
      signal.sport = 'Surebet';
    }
    
    console.log('✅ Sinal completo:');
    console.log(`   Times: ${signal.event}`);
    console.log(`   Esporte: ${signal.sport}`);
    console.log(`   ROI: ${signal.roi}%`);
    console.log(`   ${bookmaker1.name}: ${bookmaker1.aposta} @${bookmaker1.odd}`);
    console.log(`   ${bookmaker2.name}: ${bookmaker2.aposta} @${bookmaker2.odd}`);
    
    return signal;
  } catch (error) {
    console.error('❌ Erro ao fazer parse:', error);
    return null;
  }
}

// Enviar sinal para API
async function enviarSinal(signal) {
  try {
    // Se API_URL já contém '/api/', não concatenar novamente
    const url = API_URL.includes('/api/') ? API_URL : `${API_URL}/api/signals/create`;
    console.log('🔗 Enviando para URL:', url);

    const response = await axios.post(
      url,
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

    // Log status e body
    console.log('📥 Status:', response.status);
    console.log('📥 Body:', response.data);

    // Detectar HTML na resposta
    if (typeof response.data === 'string' && response.data.includes('<html')) {
      throw new Error('Endpoint errado: recebeu HTML');
    }

    if (response.data && (response.data.success || response.data.ok)) {
      console.log('✅ Sinal enviado com sucesso!');
      return true;
    } else {
      console.error('❌ Erro na resposta:', response.data);
      return false;
    }
  } catch (error) {
    if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<html')) {
      console.error('❌ Endpoint errado: recebeu HTML');
    } else {
      console.error('❌ Erro ao enviar sinal:', error.response?.data || error.message);
    }
    return false;
  }
}

// Monitorar mensagens
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text || msg.caption || '';
  
  console.log('\n📨 ========== NOVA MENSAGEM ==========');
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Mensagem: ${text.substring(0, 100)}...`);
  console.log('=====================================\n');
  
  // Verificar se é de um dos grupos configurados
  if (TELEGRAM_GROUP_IDS && !TELEGRAM_GROUP_IDS.includes(chatId)) {
    return;
  }
  
  // Verificar se parece ser um sinal
  if (text.includes('🏘') && text.includes('Casas:') && text.includes('LUCRO:')) {
    console.log('✅ Detectado como sinal!');
    
    const signal = parseSinal(text, msg.entities || []);
    
    if (signal) {
      await enviarSinal(signal);
      console.log('🎉 Sinal processado com sucesso!\n');
    } else {
      console.log('❌ Falha ao processar sinal\n');
    }
  }
});

// Tratamento de erros
bot.on('polling_error', (error) => {
  console.error('❌ Erro de polling:', error.message);
});

process.on('SIGINT', () => {
  console.log('\n👋 Encerrando bot...');
  bot.stopPolling();
  process.exit(0);
});
