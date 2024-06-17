import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async function GET(request: NextRequest, { params }: { params: { channelName: string } }) {
  try {
    const posts = await prisma.post.findMany({
      where: { channel: { name: params.channelName } },
      include: { 
        user: true, // Include user details if needed
        // ... (include other related data if necessary)
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching channel posts:', error);
    return NextResponse.json({ error: 'Failed to fetch channel posts' }, { status: 500 });
  }
}