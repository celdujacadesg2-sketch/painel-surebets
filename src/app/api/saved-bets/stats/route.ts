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
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, all

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default: // today
        break;
    }

    // Get all settled bets in period
    const bets = await prisma.savedBet.findMany({
      where: {
        userId: payload.userId,
        settledAt: {
          gte: startDate,
        },
        status: {
          in: ['won', 'lost'],
        },
      },
      orderBy: {
        settledAt: 'desc',
      },
    });

    // Calculate statistics
    const totalBets = bets.length;
    const wonBets = bets.filter((b: any) => b.status === 'won').length;
    const lostBets = bets.filter((b: any) => b.status === 'lost').length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

    const totalInvested = bets.reduce((sum: number, bet: any) => sum + bet.stake, 0);
    const totalProfit = bets.reduce((sum: number, bet: any) => sum + (bet.actualProfit || 0), 0);
    const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    // Daily breakdown (only for today)
    const todayBets = period === 'today' ? bets : bets.filter((bet: any) => {
      const betDate = new Date(bet.settledAt!);
      betDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return betDate.getTime() === today.getTime();
    });

    const todayProfit = todayBets.reduce((sum: number, bet: any) => sum + (bet.actualProfit || 0), 0);

    return NextResponse.json({
      stats: {
        period,
        totalBets,
        wonBets,
        lostBets,
        winRate: winRate.toFixed(2),
        totalInvested: totalInvested.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        roi: roi.toFixed(2),
        todayProfit: todayProfit.toFixed(2),
      },
      bets,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
