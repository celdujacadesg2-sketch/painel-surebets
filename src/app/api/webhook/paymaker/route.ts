
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint para receber webhooks do Paymaker
export async function POST(request: NextRequest) {
  // 1. Validar token do header
  const token = request.headers.get('authorization') || request.headers.get('x-webhook-token');
  const expectedToken = process.env.PAYMAKER_WEBHOOK_TOKEN;
  if (!token || token.replace('Bearer ', '') !== expectedToken) {
    return NextResponse.json({ ok: false, error: 'Token inválido' }, { status: 401 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Payload inválido' }, { status: 400 });
  }

  // 2. Validar evento
  if (data?.event !== 'compra_aprovada' || !data?.email) {
    return NextResponse.json({ ok: false, error: 'Evento ignorado ou payload incompleto' }, { status: 400 });
  }

  // 3. Buscar usuário pelo email
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Usuário não encontrado' }, { status: 400 });
  }

  // 4. Calcular nova data de expiração
  const now = new Date();
  let newSubscriptionEndsAt: Date;
  if (user.subscriptionEndsAt && user.subscriptionEndsAt > now) {
    // Assinatura ativa: estende mais 30 dias
    newSubscriptionEndsAt = new Date(user.subscriptionEndsAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    // Sem assinatura ativa: 30 dias a partir de agora
    newSubscriptionEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  // 5. Atualizar usuário
  await prisma.user.update({
    where: { email: data.email },
    data: {
      subscriptionEndsAt: newSubscriptionEndsAt,
    },
  });

  return NextResponse.json({ ok: true, message: 'Assinatura criada/renovada e acesso liberado.' });
}
