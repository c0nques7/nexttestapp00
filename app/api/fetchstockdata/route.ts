import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.POLYGON_API_KEY;

const prisma = new PrismaClient();


async function fetchStockData(symbol: string | null, userId: string) {
  if (!symbol) {
    throw new Error("Missing symbol");
  }

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const formattedFrom = oneYearAgo.toISOString().split("T")[0];
  const formattedTo = today.toISOString().split("T")[0];
  const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${formattedFrom}/${formattedTo}?adjusted=true&sort=asc&limit=365&apiKey=${API_KEY}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch stock data from Polygon.io");
  }

  const data = await response.json();

  if (data.resultsCount === 0) {
    throw new Error("No results found for the given symbol");
  }
  
  const parsedUserId = parseInt(userId, 10);
  // 4. Check if the ticker is already associated with the user
  const user = await prisma.user.findUnique({
    
    where: {
      id: parsedUserId
    },
    select: { tickers: true },
  });

  const existingTickers = user?.tickers; 
  const isTickerAlreadyAdded = existingTickers?.some(
    (t) => t.symbol === symbol
  );

  // Return the data from the API with the flag. 
  return {data: data.results, isTickerAlreadyAdded};
}


export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  try {
    // 1. Get JWT Token from Cookie
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify JWT Token
    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: string };
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const stockData = await fetchStockData(symbol, decodedToken.userId); // Pass userId to fetchStockData
    return NextResponse.json(stockData); // Return the stock data
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching stock data:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
