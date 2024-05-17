import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/app/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import { JsonWebTokenError } from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function (Improved case-insensitive check)
async function isValidSubreddit(subreddit: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit.toLowerCase()}/about.json`);
    return response.ok;
  } catch (error) {
    console.error("Error validating subreddit:", error);
    return false; 
  }
}

// GET Route (Error handling and type safety)
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await verifyJwtToken(token);
    const userId = decodedToken.userId;

    const user = await prisma.site_users.findUnique({
      where: { id: userId }, 
      select: { mySubs: true } // Use explicit selection for type safety
    });

    if (user?.mySubs) {
      console.log('mySubs:', JSON.stringify(user.mySubs, null, 2));
      return NextResponse.json(user.mySubs);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } else {
      console.error('Error fetching saved subreddits:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}

// POST Route (Streamlined and defensive coding)
export async function POST(request: NextRequest) {
  const authorizationHeader = request.headers.get('authorization');
  const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.substring(7) : null; 

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subreddit } = await request.json();

  try {
    const decodedToken = await verifyJwtToken(token);
    const userId = decodedToken.userId;


    await prisma.site_users.update({
      where: { id: userId },
      data: {
        mySubs: {
          push: subreddit, // Prisma handles string pushing to JSON array
        },
      },
    });

    return NextResponse.json({ message: 'Subreddit saved successfully' });
  } catch (error) {
    console.error('Error saving subreddit:', error);
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { 
      return NextResponse.json({ error: 'Subreddit already saved' }, { status: 400 });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to save subreddit' }, { status: 500 });
  }
}
