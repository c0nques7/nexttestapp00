import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';



const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } },
) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET!) as {
      userId: number;
    };

    if (params?.postId == null) {
        return NextResponse.json(
          { message: 'PostId is Required' },
          { status: 403 },
        );
      }
    const postId = parseInt(params.postId,10);
    if (postId == null) {
      return NextResponse.json(
        { message: 'PostId is Required' },
        { status: 403 },
      );
    }
    console.log('Attempting to delete post with ID:', postId); // Log the postId before deletion

    // Check if post exists and user is authorized
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      console.warn('Post not found with ID:', postId);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.userId !== decoded.userId) {
      console.error(
        'User (ID:',
        decoded.userId,
        ') unauthorized to delete post (ID:',
        postId,
        ')',
      );
      return NextResponse.json(
        { error: 'Unauthorized to delete this post' },
        { status: 403 },
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });
    
    console.log('Post deleted successfully (ID:', postId, ')');
    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid or expired token:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    console.error('Error deleting post (ID:', params.postId, '):', error);
    return NextResponse.json(
      //{ error: 'An error occurred while deleting the post' },
      { error: error },
      { status: 500 },
    );
  }
}
