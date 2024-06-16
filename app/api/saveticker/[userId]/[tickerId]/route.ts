import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tickerId: string,userId:string } },
) {
  if (params?.userId == null) {
    return NextResponse.json(
      { message: 'userId is Required' },
      { status: 403 },
    );
  }
  const userId = parseInt(params.userId, 10);

  if (params?.tickerId == null) {
    return NextResponse.json(
      { message: 'tickerId is Required' },
      { status: 403 },
    );
  }
  const tickerId = parseInt(params.tickerId, 10);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tickers: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingTicker = user.tickers.find(
      (t) => t.id  === tickerId,
    );

    if (!existingTicker) {
      return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
    }

    await prisma.ticker.delete({
      where: { id: existingTicker.id },
    });

    return NextResponse.json({ message: 'Ticker removed' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove ticker' },
      { status: 500 },
    );
  }
}
