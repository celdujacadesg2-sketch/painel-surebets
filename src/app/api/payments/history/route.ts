import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware';

/**
 * Lista histórico de pagamentos do usuário
 * GET /api/payments/history
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar pagamentos do usuário
    const payments = await prisma.payment.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        gateway: true,
        subscriptionDays: true,
        appliedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
