import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { cookies } from "next/headers"; // Import the getCookie function
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
    // 1. Get the JWT token from the cookie
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify the JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string };
    const userId = parseInt(decodedToken.userId, 10);
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const newTicker = await request.json();
    const tickerSymbol = req.nextUrl.searchParams.get('ticker') as string; 
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tickers: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if the ticker is already in the list
      if (user.tickers.some(existingTicker => existingTicker === tickerSymbol)) {
        return NextResponse.json({ error: "Ticker already exists" }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          tickers: {
            create: [newTicker],
          },
        },
      });

    return NextResponse.json({
      message: "Ticker added",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error adding ticker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  try {
    // 1. Get the JWT token from the cookie
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify the JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string };

    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
    const userId = parseInt(decodedToken.userId, 10) // parse token to int

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tickers: true,
      },
    });

    return NextResponse.json(user?.tickers || []); 
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma-specific known request errors
      switch (error.code) {
        case "P2002": // Unique constraint violation
          return NextResponse.json({ error: "Ticker already exists for this user" }, { status: 409 });
        case "P2025": // Record to update/delete not found
          return NextResponse.json({ error: "User or ticker not found" }, { status: 404 });
        // Add other Prisma error codes you want to handle explicitly
        default:
          console.error("Prisma Error:", error); // Log for debugging
          return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      // Prisma validation errors (e.g., invalid data types)
      return NextResponse.json({ error: "Invalid data provided" }, { status: 422 });
    } else {
      // Other unexpected errors
      console.error("Unexpected Error:", error); // Log for debugging
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }
}