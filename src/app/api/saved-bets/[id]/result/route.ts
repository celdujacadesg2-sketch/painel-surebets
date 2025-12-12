import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware';
import { hasActiveAccess } from '@/lib/subscription';

export async function PATCH(
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

    // Check user access
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !hasActiveAccess(user)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { status, result, actualProfit } = await request.json();

    if (!status || !['won', 'lost', 'void'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: won, lost, or void' },
        { status: 400 }
      );
    }

    // Get the bet to verify ownership
    const bet = await prisma.savedBet.findUnique({
      where: { id: params.id },
    });

    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    if (bet.userId !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this bet' },
        { status: 403 }
      );
    }

    // Update bet result
    const updatedBet = await prisma.savedBet.update({
      where: { id: params.id },
      data: {
        status,
        result: result ? JSON.stringify(result) : null,
        actualProfit: actualProfit !== undefined ? parseFloat(actualProfit) : null,
        settledAt: new Date(),
      },
    });

    return NextResponse.json({ bet: updatedBet });
  } catch (error) {
    console.error('Update bet result error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
