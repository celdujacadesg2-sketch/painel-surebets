import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastSignal } from '@/lib/socket';

export async function POST(request: NextRequest) {
  try {
    // Verify API secret
    const apiSecret = request.headers.get('x-api-secret');
    
    if (apiSecret !== process.env.API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const { sport, event, market, roi, odds, bookmakers } = data;

    if (!sport || !event || !market || roi === undefined || !odds || !bookmakers) {
      return NextResponse.json(
        { error: 'Missing required fields: sport, event, market, roi, odds, bookmakers' },
        { status: 400 }
      );
    }

    // Create signal with expiration (2 hours)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    const signal = await prisma.signal.create({
      data: {
        sport,
        event,
        market,
        roi: parseFloat(roi),
        odds,
        bookmakers,
        expiresAt,
      },
    });

    // Broadcast to all connected clients via WebSocket
    broadcastSignal(signal);

    return NextResponse.json({ 
      success: true, 
      signal: {
        id: signal.id,
        createdAt: signal.createdAt,
      }
    });
  } catch (error) {
    console.error('Create signal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
