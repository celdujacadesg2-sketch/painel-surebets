import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateNewSubscriptionEnd } from '@/lib/subscription';
import crypto from 'crypto';

/**
 * Webhook endpoint para receber notificações de pagamento do gateway
 * POST /api/payments/webhook
 * 
 * Este endpoint é chamado automaticamente pelo gateway de pagamento
 * quando o status de um pagamento muda (aprovado, recusado, etc)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    console.log('📩 Webhook recebido:', data);

    // Verificar autenticidade do webhook (PagBank usa token de notificação)
    const notificationCode = data.notificationCode || data.notification_code;
    
    if (!notificationCode && !data.id) {
      console.log('❌ Webhook inválido: sem código de notificação');
      return NextResponse.json(
        { error: 'Invalid notification' },
        { status: 400 }
      );
    }

    // Para PagBank: buscar detalhes da transação
    if (data.notificationCode || data.notification_code) {
      return await handlePagBankWebhook(data, body);
    }

    // Para outros gateways: processar diretamente
    return await handleGenericWebhook(data);

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Processa webhook do PagBank
 */
async function handlePagBankWebhook(data: any, rawBody: string) {
  const notificationCode = data.notificationCode || data.notification_code;
  
  console.log('🏦 Processando notificação PagBank:', notificationCode);

  // Buscar detalhes da transação na API do PagBank
  const pagBankToken = process.env.PAGBANK_TOKEN;
  const pagBankEnv = process.env.PAGBANK_ENVIRONMENT || 'sandbox';
  
  if (!pagBankToken) {
    console.error('❌ PAGBANK_TOKEN não configurado');
    return NextResponse.json({ received: true });
  }

  try {
    const apiUrl = pagBankEnv === 'production'
      ? `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}`
      : `https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}`;

    const response = await fetch(`${apiUrl}?token=${pagBankToken}`);
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar transação PagBank:', response.statusText);
      return NextResponse.json({ received: true });
    }

    const transactionData = await response.text();
    // PagBank retorna XML, aqui simplificado para exemplo
    console.log('📄 Dados da transação:', transactionData);

    // Parsear status do pagamento
    // Status PagBank: 1=Aguardando, 3=Paga, 7=Cancelada
    const statusMatch = transactionData.match(/<status>(\d+)<\/status>/);
    const referenceMatch = transactionData.match(/<reference>(.*?)<\/reference>/);
    const codeMatch = transactionData.match(/<code>(.*?)<\/code>/);
    const grossAmountMatch = transactionData.match(/<grossAmount>([\d.]+)<\/grossAmount>/);
    
    if (!statusMatch || !referenceMatch) {
      console.error('❌ Dados inválidos na resposta do PagBank');
      return NextResponse.json({ received: true });
    }

    const status = parseInt(statusMatch[1]);
    const reference = referenceMatch[1]; // userId enviado na criação do pagamento
    const paymentCode = codeMatch ? codeMatch[1] : notificationCode;
    const amount = grossAmountMatch ? parseFloat(grossAmountMatch[1]) : 0;

    // Status 3 = Pagamento aprovado
    if (status === 3) {
      await processApprovedPayment({
        userId: reference,
        gatewayPaymentId: paymentCode,
        gateway: 'pagbank',
        amount: amount,
        metadata: transactionData,
      });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erro ao processar PagBank webhook:', error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Processa webhook genérico (MercadoPago, Stripe, etc)
 */
async function handleGenericWebhook(data: any) {
  // Exemplo de estrutura genérica
  const { 
    payment_id, 
    user_id, 
    status, 
    amount,
    gateway = 'generic',
    metadata 
  } = data;

  if (status === 'approved' || status === 'completed') {
    await processApprovedPayment({
      userId: user_id,
      gatewayPaymentId: payment_id,
      gateway,
      amount,
      metadata: JSON.stringify(data),
    });
  }

  return NextResponse.json({ received: true });
}

/**
 * Processa pagamento aprovado e renova assinatura
 */
async function processApprovedPayment(params: {
  userId: string;
  gatewayPaymentId: string;
  gateway: string;
  amount: number;
  metadata?: string;
}) {
  const { userId, gatewayPaymentId, gateway, amount, metadata } = params;

  console.log('✅ Processando pagamento aprovado:', { userId, gatewayPaymentId });

  // Verificar se o pagamento já foi processado
  const existingPayment = await prisma.payment.findUnique({
    where: { gatewayPaymentId },
  });

  if (existingPayment) {
    console.log('⚠️ Pagamento já processado anteriormente');
    return;
  }

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error('❌ Usuário não encontrado:', userId);
    return;
  }

  // Calcular nova data de expiração da assinatura
  const subscriptionDays = 30; // 30 dias por pagamento
  const newSubscriptionEnd = calculateNewSubscriptionEnd(user.subscriptionEndsAt, subscriptionDays);

  // Criar registro de pagamento e atualizar assinatura em uma transação
  await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'BRL',
        status: 'completed',
        gateway,
        gatewayPaymentId,
        subscriptionDays,
        appliedAt: new Date(),
        metadata,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionEndsAt: newSubscriptionEnd,
      },
    }),
  ]);

  console.log('🎉 Assinatura renovada com sucesso!');
  console.log(`👤 Usuário: ${user.email}`);
  console.log(`📅 Nova data de expiração: ${newSubscriptionEnd.toISOString()}`);
}
