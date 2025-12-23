import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware';

/**
 * Cria um novo pagamento e retorna o link de checkout
 * POST /api/payments/create
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { gateway = 'pagbank', plan = 'monthly' } = await request.json();

    // Definir valores do plano
    const plans = {
      monthly: { days: 30, amount: 29.90, name: 'Plano Mensal' },
      quarterly: { days: 90, amount: 79.90, name: 'Plano Trimestral' },
      yearly: { days: 365, amount: 299.90, name: 'Plano Anual' },
    };

    const selectedPlan = plans[plan as keyof typeof plans] || plans.monthly;

    // Criar registro de pagamento pendente
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: selectedPlan.amount,
        currency: 'BRL',
        status: 'pending',
        gateway,
        subscriptionDays: selectedPlan.days,
      },
    });

    // Gerar link de pagamento baseado no gateway
    let checkoutUrl = '';

    if (gateway === 'pagbank') {
      checkoutUrl = await createPagBankCheckout({
        paymentId: payment.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        amount: selectedPlan.amount,
        description: selectedPlan.name,
      });
    } else {
      // Outros gateways podem ser implementados aqui
      return NextResponse.json(
        { error: 'Gateway not supported' },
        { status: 400 }
      );
    }

    // Atualizar payment com referência interna
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayOrderId: `INTERNAL-${payment.id}`, // Prefixo para identificar como ID interno
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        checkoutUrl,
      },
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Cria checkout no PagBank
 */
async function createPagBankCheckout(params: {
  paymentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
}): Promise<string> {
  const pagBankToken = process.env.PAGBANK_TOKEN;
  const pagBankEnv = process.env.PAGBANK_ENVIRONMENT || 'sandbox';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  if (!pagBankToken) {
    throw new Error('PAGBANK_TOKEN não configurado');
  }

  // URL da API do PagBank
  const apiUrl = pagBankEnv === 'production'
    ? 'https://ws.pagseguro.uol.com.br/v2/checkout'
    : 'https://ws.sandbox.pagseguro.uol.com.br/v2/checkout';

  // Escapar valores para prevenir XML injection
  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Montar XML de requisição (PagBank usa XML)
  const checkoutXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<checkout>
  <currency>BRL</currency>
  <redirectURL>${appUrl}/dashboard?payment=success</redirectURL>
  <notificationURL>${appUrl}/api/payments/webhook</notificationURL>
  <items>
    <item>
      <id>1</id>
      <description>${escapeXml(params.description)}</description>
      <amount>${params.amount.toFixed(2)}</amount>
      <quantity>1</quantity>
    </item>
  </items>
  <reference>${params.userId}</reference>
  <sender>
    <name>${escapeXml(params.userName)}</name>
    <email>${escapeXml(params.userEmail)}</email>
  </sender>
</checkout>`;

  try {
    const response = await fetch(`${apiUrl}?token=${pagBankToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
      },
      body: checkoutXml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao criar checkout PagBank:', errorText);
      throw new Error('Erro ao criar checkout no PagBank');
    }

    const responseText = await response.text();
    
    // Extrair código do checkout da resposta XML
    const codeMatch = responseText.match(/<code>(.*?)<\/code>/);
    
    if (!codeMatch) {
      console.error('❌ Código de checkout não encontrado na resposta');
      throw new Error('Código de checkout não encontrado');
    }

    const checkoutCode = codeMatch[1];

    // Montar URL de checkout
    const checkoutUrl = pagBankEnv === 'production'
      ? `https://pagseguro.uol.com.br/v2/checkout/payment.html?code=${checkoutCode}`
      : `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${checkoutCode}`;

    console.log('✅ Checkout criado com sucesso:', checkoutUrl);

    return checkoutUrl;

  } catch (error) {
    console.error('❌ Erro ao criar checkout PagBank:', error);
    throw error;
  }
}
