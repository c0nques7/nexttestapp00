import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/app/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';
import { JsonWebTokenError } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value; // Replace 'access_token' with your cookie name

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify and Decode JWT using verifyJwtToken
    console.log("Verifying token:", token);
    const decodedToken = await verifyJwtToken(token);
    console.log("Decoded token:", decodedToken);

    const userId = decodedToken.userId.toString();

    // Fetch User from Database and Return `mySubs`
    const user = await prisma.site_users.findUnique({
      where: { id: userId },
      select: { mySubs: true }
    });

    if (!user || !user.mySubs) {
      return NextResponse.json({ error: 'User or subreddits not found' }, { status: 404 });
    }

    return NextResponse.json({ mySubs: user.mySubs });
  } catch (error) {
    console.error('Error fetching subreddit:', error);
    // Error Handling (Same as before)
    if (error instanceof JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // User not found
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Failed to save subreddit' }, { status: 500 });
  }
}