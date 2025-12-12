import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const { id } = params;
    const data = await request.json();

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: data.isBlocked !== undefined ? data.isBlocked : undefined,
        subscriptionEndsAt: data.subscriptionEndsAt !== undefined ? 
          (data.subscriptionEndsAt ? new Date(data.subscriptionEndsAt) : null) : 
          undefined,
        trialEndsAt: data.trialEndsAt !== undefined ?
          (data.trialEndsAt ? new Date(data.trialEndsAt) : null) :
          undefined,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Update user error:', error);
    
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
