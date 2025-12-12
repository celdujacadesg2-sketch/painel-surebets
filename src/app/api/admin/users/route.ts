import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware';
import { getAccessStatus } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    // Add access status to each user
    const usersWithStatus = users.map(user => ({
      ...user,
      accessStatus: getAccessStatus(user),
    }));

    return NextResponse.json({ users: usersWithStatus });
  } catch (error: any) {
    console.error('Get users error:', error);
    
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
