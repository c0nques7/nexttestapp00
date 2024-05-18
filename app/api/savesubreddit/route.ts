import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/app/lib/auth'; // Adjust path if necessary
import { PrismaClient, Prisma } from '@prisma/client';
import { JsonWebTokenError } from 'jsonwebtoken';

const prisma = new PrismaClient();

// POST Route (Updated)
export async function POST(request: NextRequest) {
  const authorizationHeader = request.headers.get('authorization');
  console.log('Authorization header:', authorizationHeader);
  const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.substring(7) : null;

  if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subreddit } = await request.json();
    const decodedToken = await verifyJwtToken(token);
    const userId = decodedToken.userId.toString();

    const existingUser = await prisma.site_users.findUnique({
      where: { id: userId },
      select: { mySubs: true }
    });

    // Update the 'mySubs' string (append with comma if not empty)
    const updatedSubreddits = existingUser?.mySubs 
      ? `${existingUser.mySubs},${subreddit}` 
      : subreddit; 

    await prisma.site_users.update({
      where: { id: userId },
      data: {
        mySubs: updatedSubreddits,
      },
    });

      return NextResponse.json({ message: 'Subreddit saved successfully' }); // No need to fetch again

  } catch (error) {
      console.error('Error saving subreddit:', error);
      
      // Error Handling (Same as before)
      if (error instanceof JsonWebTokenError) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') { // User not found
              return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
      } 

      return NextResponse.json({ error: 'Failed to save subreddit' }, { status: 500 });
  }
}