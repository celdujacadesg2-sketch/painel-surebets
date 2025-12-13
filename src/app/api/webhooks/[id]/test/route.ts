import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware';
import { triggerWebhooks } from '@/lib/webhook';

// POST /api/webhooks/[id]/test - Test webhook delivery (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await authenticateRequest(request);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Create test signal data
    const testSignal = {
      id: 'test-' + Date.now(),
      sport: 'Futebol',
      event: 'Time A vs Time B (TESTE)',
      market: '1x2',
      roi: 5.5,
      odds: JSON.stringify([
        { selection: 'Time A', value: '2.10' },
        { selection: 'Empate', value: '3.40' },
        { selection: 'Time B', value: '2.80' }
      ]),
      bookmakers: JSON.stringify([
        { name: 'Casa 1', url: 'https://casa1.com' },
        { name: 'Casa 2', url: 'https://casa2.com' }
      ]),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    };

    // Trigger webhook with test data
    await triggerWebhooks('signal.created', testSignal);

    return NextResponse.json({ 
      success: true,
      message: 'Test webhook sent successfully'
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
