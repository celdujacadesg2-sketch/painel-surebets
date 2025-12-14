import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch (e) {
    db = false;
  }
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    db,
  });
}
