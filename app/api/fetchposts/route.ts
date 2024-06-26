import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = cookies();

  try {
    // Authentication (using JWT)
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string };
    const userId = parseInt(decodedToken.userId, 10);

    // Query user's posts from the database
    const userPosts = await prisma.post.findMany({
      where: {
        userId: userId,
        isPublic: true,
      },
      select: {
        id: true,
        content: true,
        userId: true,
        channel: true,
        channelName: true, // Add this line to include channelName in the query
        timestamp: true,
        postType: true,
        mediaUrl: true,
        contentProvider: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json({ userPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user posts" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}