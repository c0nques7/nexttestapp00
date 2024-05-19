import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') as string, 10);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tickers: true },
  });

  return NextResponse.json(user?.tickers || []);
}

export async function POST(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') as string, 10);
  const newTicker = await req.json();

  if (!newTicker || !newTicker.symbol || !newTicker.data) {
    return NextResponse.json({ error: 'Invalid ticker data' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tickers: { create: newTicker },
      },
      include: { tickers: true },
    });

    return NextResponse.json({ message: 'Ticker added', user: updatedUser }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint
        return NextResponse.json({ error: 'Ticker already exists' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 }); 
  }
}

export async function DELETE(req: NextRequest) {
  const userId = parseInt(req.nextUrl.searchParams.get('userId') as string, 10);
  const tickerToRemove = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tickers: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingTicker = user.tickers.find(t => t.symbol === tickerToRemove.symbol);

    if (!existingTicker) {
      return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
    }

    await prisma.ticker.delete({
      where: { id: existingTicker.id },
    });

    return NextResponse.json({ message: 'Ticker removed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove ticker' }, { status: 500 });
  }
}
