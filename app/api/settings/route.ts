import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // Update with your actual path
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


const prisma = new PrismaClient(); // Update with your actual path

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  const cookieStore = cookies();

  try {
    // 1. Extract and Verify JWT (Assuming it's in a cookie named 'token')
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: number };
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 2. Fetch User Settings
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Extract and Parse Settings
    let settings = {}; 
    if (user.settings !== null) {
      settings = JSON.parse(user.settings as string);
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();

  try {
    // 1. Extract and Verify JWT (Assuming it's in a cookie named 'token')
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET!) as { userId: number };
    if (!decodedToken || !decodedToken.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // 2. Parse Request Body
    const { settings } = await request.json();

    // 3. Validate Settings (Optional, but recommended)
    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
    }

    // 4. Update User Settings
    await prisma.user.update({
      where: { id: decodedToken.userId },
      data: { settings: JSON.stringify(settings) },
    });

    return NextResponse.json({ message: "Settings saved successfully" });

  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}