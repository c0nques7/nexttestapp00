import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const channelName = url.searchParams.get('channelName'); // Get the channelName from the query parameter
  
  if (!channelName) {
    return NextResponse.json({ error: "Missing channelName parameter" }, { status: 400 });
  }

  try {
    // Query posts from the specified channel
    const channelPosts = await prisma.post.findMany({
        where: {
            channel: {
              name: channelName,
            },
            isPublic: true,
          },
      select: {
        id: true,
        content: true,
        userId: true, // Optionally include the userId if you need it
        channel: true,
        timestamp: true,
        postType: true,
        mediaUrl: true,
      },
      orderBy: {
        timestamp: 'asc', // Sort by timestamp (oldest first) or 'desc' (newest first)
      },
    });

    return NextResponse.json({ channelPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching channel posts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching channel posts" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
