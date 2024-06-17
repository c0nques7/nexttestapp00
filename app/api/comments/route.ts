import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Comment } from '@/app/lib/types'
import { createRef } from 'react';

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
          user: true,
          votes: {
              include: {
                  user: true,
              },
          },
          flags: {
              include: {
                  user: true,
                  post: true,
              },
          },
          replies: {
              include: {
                  user: true,
                  votes: {
                      include: {
                          user: true,
                      },
                  },
                  flags: {
                      include: {
                          user: true,
                          post: true,
                      }
                  },
                  replies: {
                      include: {
                          user: true,
                          votes: {
                              include: {
                                  user: true,
                              },
                          },
                          flags: {
                              include: {
                                  user: true,
                                  post: true,
                              }
                          },
                      }
                  }
              },
          },
          post: {
              select: { id: true } 
          }
      },
        orderBy: { timestamp: 'desc' },
      });

      
      const commentsByPostId = allComments.reduce<Record<string, Comment[]>>(
        (acc, comment) => {
          const postId = comment.postId.toString();
      
          if (!acc[postId]) {
            acc[postId] = [];
          }
      
          // Use TypeScript's utility type `Pick` to create a new object with only the necessary properties
          const transformComment = (c: any): Comment => ({
            // Existing properties from the comment object
            ...c,
            showDeleteCover: false,
            ref: createRef<HTMLDivElement>(),
            // Recursive transformation for replies (if present)
            replies: c.replies?.map(transformComment), // Recursively map replies
          });
      
          acc[postId].push(transformComment(comment)); // Transform the comment
          return acc;
        },
        {} // Initialize as an empty object
      );

    return NextResponse.json({ data: commentsByPostId }); // Wrap data in a "data" object
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
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