import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { cookies } from "next/headers"; // Import the getCookie function
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
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

    // 3. Get Ticker Symbol from Request Body
    const { ticker } = await request.json();
    console.log("here's the ticker: ", ticker);
    let stockData = null;

    // 4. Check if Ticker Exists for the User
    const existingTicker = await prisma.ticker.findFirst({
      where: { userId, symbol: ticker },
    });

    if (existingTicker) {
      return NextResponse.json({ error: "Ticker already exists" }, { status: 400 });
    }

    // 5. Create New Ticker (assuming `stockData.data` is fetched elsewhere)
    const newTicker = await prisma.ticker.create({
      data: { 
        symbol: ticker.toUpperCase(), 
        userId,
      },
    });

    // 6. Return Success Response
    return NextResponse.json({ message: "Ticker added", ticker: newTicker });

  } catch (error: any) {
    // 7. Handle Specific Errors 
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