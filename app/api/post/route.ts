import { ContentProvider, PostType, PrismaClient, Post } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { CreatePostRequestBody } from '@/app/lib/types';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();



// GET handler: Fetch all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true, // Include user information
        comments: true, // Include related comments
        // Add more relations if needed
      },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      // 1. Authentication (using JWT)
      const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number }; 

      // 2. Get Request Data & Input Validation
      const postData: CreatePostRequestBody = await req.json();

      if (!postData.content || !postData.postType) {
          return NextResponse.json({ error: 'Content and post type are required' }, { status: 400 });
      }
      if (!Object.values(PostType).includes(postData.postType)) {
          return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
      }
      
      // Check for postDestination and channelId if destination is CHANNEL
      if (postData.postDestination === 'CHANNEL' && !postData.channelId) {
          return NextResponse.json({ error: 'Channel ID is required for channel posts' }, { status: 400 });
      }


      // 3. Fetch Channel Details (only if needed)
      let selectedChannel = null;
      if (postData.channelId) {
          selectedChannel = await prisma.channel.findUnique({
              where: { id: postData.channelId },
          });

          if (!selectedChannel) {
              return NextResponse.json({ error: 'Channel not found' }, { status: 400 });
          }
      }

      // 4. Create Post
      const post = await prisma.post.create({
          data: {
              content: postData.content,
              postType: postData.postType,
              contentProvider: ContentProvider.PEAKEFEED,  // Default to 'USER_GENERATED'
              mediaUrl: postData.mediaUrl || null,
              isPublic: postData.isPublic || true,
              transactionHash: postData.transactionHash || null,
              channelName: selectedChannel?.name ?? '',
              userId: decoded.userId, // Use the userId from the decoded token
              channelId: selectedChannel ? selectedChannel.id : null, // Use the channelId if a channel was selected
          },
      });

      const responseData = {
          ...post, // Include all other post data
          channelName: selectedChannel ? selectedChannel.name : null // Explicitly include channelName if selected
      };


      return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
      console.error('Post creation error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
          return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
