import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const secret = process.env.JWT_SECRET;
const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: { params: { commentId: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, secret!) as { userId: number };

    const commentId = parseInt(params.commentId, 10);
    if (!commentId) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    // Fetch the comment and associated post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }, // Include the post for authorization check
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Authorization: Only the comment author or post author can delete
    if (comment.userId !== decoded.userId && comment.post.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this comment' }, { status: 403 });
    }

    // Handle Replies (Optional): You might want to decide how to handle replies:
    // 1. Delete all replies along with the comment
    // 2. Keep replies but remove the parent association

    // Option 1: Delete all replies recursively (more complex)
    // ... code to recursively delete replies ...

    // Option 2: Keep replies, remove parent association (simpler)
    await prisma.comment.updateMany({
      where: { parentId: commentId },
      data: { parentId: null }, // Remove parent association
    });

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });

  } catch (error: any) {
    // ... (error handling similar to the post deletion example)
  }
}