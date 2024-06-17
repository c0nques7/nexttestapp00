import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const searchQuery = searchParams.get('query');

  try {
    // Fetch channels that match the search query (case-insensitive)
    const channels = await prisma.channel.findMany({
      where: searchQuery
        ? { name: { contains: searchQuery, mode: 'insensitive' } }
        : undefined,
    });

    // Map channels to an object with name and id properties
    const channelNames = channels.map(channel => ({ name: channel.name, id: channel.id }));
    
    return NextResponse.json(channelNames);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get Data from Request Body
    const data = await request.json();
    const { name } = data; // Assuming the client sends the channel name as { name: "channelName" }

    // 2. Input Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid channel name' }, { status: 400 });
    }

    // 3. Check for Existing Channel (optional)
    const existingChannel = await prisma.channel.findUnique({
      where: { name },
    });
    if (existingChannel) {
      return NextResponse.json({ error: 'Channel name already exists' }, { status: 400 });
    }

    // 4. Create the Channel
    const channel = await prisma.channel.create({
      data: { name },
    });

    return NextResponse.json(channel, { status: 201 }); // Indicate successful creation
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, secret!) as JwtPayload;
    const userId = (decoded as { userId: number }).userId; // Type assertion

    const channelName = searchParams.get('name') as string;
    if (!channelName) {
      return NextResponse.json({ error: 'Missing channel name' }, { status: 400 });
    }

    await prisma.channelSubscription.deleteMany({
      where: {
        userId,
        channel: { name: channelName }, // Assuming you're using channel name as id
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}