export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/middleware';
import { hasActiveAccess } from '@/lib/subscription';

export async function GET(request: NextRequest) {
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
        { error: 'Access denied. Please subscribe or renew your subscription.' },
        { status: 403 }
      );
    }

    // Get active signals (not expired)
    const now = new Date();
    const signals = await prisma.signal.findMany({
      where: {
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ signals });
  } catch (error) {
    console.error('Get signals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
