import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
dotenv.config()

interface PolygonAgg {
  t: number; // Unix timestamp in milliseconds
  c: number; // Close price
}

interface PolygonResponse {
  resultsCount: number;
  results: PolygonAgg[];
  status?: string; // Potential 'error' status from Polygon API
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Missing stock symbol" }, { status: 400 });
  }

  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  const formattedFrom = from.toISOString().split("T")[0];
  const formattedTo = to.toISOString().split("T")[0];

  try {
    const apiKey = process.env.POLYGON_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Polygon API key" }, { status: 500 });
    }

    const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${formattedFrom}/${formattedTo}?adjusted=true&sort=asc&limit=365&apiKey=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      // More specific error handling based on Polygon API response
      const errorData: PolygonResponse = await response.json();
      const errorMessage = errorData.status === 'error'
        ? errorData.status
        : `Failed to fetch stock data (${response.status})`;

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data: PolygonResponse = await response.json();

    if (data.resultsCount === 0) {
      return NextResponse.json(
        { error: "No data found for the given symbol" }, 
        { status: 404 }
      );
    }

    const formattedData = data.results.map(item => ({
      date: new Date(item.t).toLocaleDateString("en-US"), 
      close: item.c,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching stock chart data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
