import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { cookies } from "next/headers"; // Import the getCookie function
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  try {
    // 1. Extract JWT from Cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify JWT
    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string };
    
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const userId = parseInt(decodedToken.userId, 10);

    // 3. Get Ticker Symbol from Search Body
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("symbol")?.toUpperCase();
    console.log("here's the ticker: ", ticker);
    

    /// 4. Input Validation
    if (!ticker) { 
      return NextResponse.json({ error: "Invalid ticker symbol" }, { status: 400 });
    }

    // 5. Check if Ticker Exists for the User
    const existingTicker = await prisma.ticker.findFirst({
      where: { userId, symbol: ticker },
    });

    if (existingTicker) {
      return NextResponse.json({ error: "Ticker already exists" }, { status: 400 });
    }

    // 6. Create New Ticker (assuming `stockData.data` is fetched elsewhere)
    await prisma.ticker.create({
      data: {
        symbol: ticker,
        user: { connect: { id: userId } },
      },
    });

    // 7. Return Success Response
    return NextResponse.json({ message: "Ticker added", ticker });

  } catch (error: any) {
    // 8. Handle Specific Errors 
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    console.error("Error adding ticker:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 }); 
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  try {
    // 1. Get and Verify JWT
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string };
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
    const userId = parseInt(decodedToken.userId, 10);

    // 2. Fetch User with Tickers (Optimized Query)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        tickers: true,  // Eagerly load tickers in a single query
      },
    });

    // 3. Handle User Not Found
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return Tickers (or Empty Array if None)
    return NextResponse.json(user.tickers || []); 
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