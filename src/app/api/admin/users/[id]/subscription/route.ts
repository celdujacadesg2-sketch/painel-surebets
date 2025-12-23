import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware';
import { calculateNewSubscriptionEnd } from '@/lib/subscription';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const { id } = params;
    const { days } = await request.json();

    if (!days || days <= 0) {
      return NextResponse.json(
        { error: 'Invalid days value' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Extend or create subscription
    const newSubscriptionEnd = calculateNewSubscriptionEnd(user.subscriptionEndsAt, days);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        subscriptionEndsAt: newSubscriptionEnd,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Extend subscription error:', error);
    
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
