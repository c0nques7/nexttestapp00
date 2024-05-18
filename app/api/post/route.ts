import { PostType, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();


interface CreatePostRequestBody {
    content: string;
    channelId?: number;  // Optional channel ID
    isPublic?: boolean;  // Optional visibility
    postType: PostType;    // Assuming a string enum (e.g., "TEXT", "IMAGE", "VIDEO")
    mediaUrl?: string;   // Optional media URL
  }

  export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    try {
      // 1. Authentication (using JWT) 
      const token = cookieStore.get('token')?.value;
  
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string }; // Decode JWT
      const userId = parseInt(decodedToken.userId, 10); // Parse userId to a number
  
      // 2. Get Request Data & Input Validation
      const postData: CreatePostRequestBody = await request.json();

      // Log the content and post type
      console.log("Received Content:", postData.content);
      console.log("Received Post Type:", postData.postType);
      
      if (!postData.content || !postData.postType) {
        return NextResponse.json({ error: 'Content and post type are required' }, { status: 400 });
      }
  
      // Check if postType is a valid enum value
      if (!Object.values(PostType).includes(postData.postType)) { 
        return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
      }
  
      // 3. Create Post using Prisma
      const post = await prisma.post.create({
        data: {
          content: postData.content,
          postType: postData.postType,
          isPublic: postData.isPublic || true,
          mediaUrl: postData.mediaUrl,
          user: { connect: { id: userId } }, // Use the parsed userId
          channel: postData.channelId 
              ? { connect: { id: postData.channelId } } 
              : undefined,
        },
      });
  
      return NextResponse.json({ message: 'Post created successfully', postId: post.id }, { status: 201 });
    } catch (error) {
      console.error("Post creation error:", error);
      return NextResponse.json({ error: "An error occurred while creating the post" }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }