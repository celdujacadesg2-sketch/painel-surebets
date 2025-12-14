const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestSignal() {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    const signal = await prisma.signal.create({
      data: {
        sport: 'Futebol',
        event: 'Flamengo vs Palmeiras',
        market: 'Resultado Final',
        roi: 5.8,
        odds: JSON.stringify([
          { selection: '1', value: '2.10' },
          { selection: 'X', value: '3.40' }
        ]),
        bookmakers: JSON.stringify([
          { name: 'Bet365', url: 'https://www.bet365.com' },
          { name: 'Betano', url: 'https://www.betano.com' }
        ]),
        expiresAt: expiresAt
      }
    });

    console.log('✅ Sinal de teste criado com sucesso!');
    console.log(signal);
  } catch (error) {
    console.error('❌ Erro ao criar sinal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestSignal();
