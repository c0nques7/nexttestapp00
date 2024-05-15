// /app/api/login/route.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface LoginRequestBody {
  identifier: string;
  password: string;
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json() as LoginRequestBody;

    // Input Validation (more thorough)
    if (!identifier || !password) {
      return new NextResponse("Missing credentials", { status: 400 }); 
    } else if (identifier.length < 3 || password.length < 8) {
      return new NextResponse("Invalid credentials", { status: 400 });
    }

    // Fetch User (allowing login with either email or username)
    const user = await prisma.site_users.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 }); // Unauthorized
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Generate JWT on Successful Login
    const tokenPayload = { userId: user.id }; // Include user role if needed
    const token = jwt.sign(tokenPayload, JWT_SECRET!, { expiresIn: '1h' }); // 1 hour (adjust)
    console.log('Generated JWT:', token)

    // Set JWT as HTTP-only cookie (refined for better security)
    const response = NextResponse.json({ message: 'Login successful', user: tokenPayload });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    // Instead of PrismaClientKnownRequestError, handle general errors
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
