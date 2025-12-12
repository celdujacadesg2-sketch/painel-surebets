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
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get saved bets for this user
    const savedBets = await prisma.savedBet.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ savedBets });
  } catch (error) {
    console.error('Get saved bets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.json();
    const { sport, event, market, odds, stake, bookmaker, notes } = data;

    if (!sport || !event || !market || !odds || !stake || !bookmaker) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const savedBet = await prisma.savedBet.create({
      data: {
        userId: payload.userId,
        sport,
        event,
        market,
        odds,
        stake: parseFloat(stake),
        bookmaker,
        notes: notes || null,
      },
    });

    return NextResponse.json({ savedBet });
  } catch (error) {
    console.error('Create saved bet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
