import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const secret = process.env.JWT_SECRET;
const prisma = new PrismaClient();

// Helper function for authentication
async function authenticateUser(req: NextRequest): Promise<number | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, secret!) as { userId: string };
    return parseInt(decoded.userId, 10);
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// GET handler: Fetch all comments
export async function GET() {
  try {
    const allComments = await prisma.comment.findMany({
        include: {
            user: true,          // Include user data
            votes: true,         // Include vote data (if you want to display vote counts)
            replies: {           // Include replies recursively
              include: {
                user: true,  // Include user data for replies
                votes: true, // Include vote data for replies
              }
            },
            post: {
              select: { id: true }
            }
          },
          orderBy: { timestamp: 'desc' }  // Sort comments by timestamp (newest first)
        });

    return NextResponse.json(allComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
  }
}

// POST handler: Create a new comment
export async function POST(req: NextRequest) {
  const userId = await authenticateUser(req);
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { content, parentId, postId } = await req.json();

  if (!content.trim()) {
    return new NextResponse(JSON.stringify({ error: 'Comment content is required' }), { status: 400 });
  }
  if (!postId) {
    return new NextResponse(JSON.stringify({ error: 'postId is required' }), { status: 400 });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } },
        user: { connect: { id: userId } },
        parentId: parentId || undefined, // Correctly handle optional parentId
      },
      include: { user: true }, // Include user data in the response
    });

    return NextResponse.json(newComment, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating comment:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to add comment' }), { status: 500 });
  }
}