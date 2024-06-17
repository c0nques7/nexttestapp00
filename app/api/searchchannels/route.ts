// pages/api/searchchannels.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    // 1. Get Query Parameter
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query"); // Assuming the query parameter is named "query"

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    // 2. Perform Database Search (with optional refinements)
    const channels = await prisma.channel.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: { // Only select necessary fields
        id: true,
        name: true,
        // isCorpAccount: true, // Include if needed
      },
    });
    
    // 3. Return Response
    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error searching channels:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}