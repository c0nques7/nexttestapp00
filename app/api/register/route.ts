import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request: NextRequest) {
  try {
    const userData: RegisterRequestBody = await request.json();
    const origin = request.headers.get('origin');

    if (!validateEmail(userData.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          role: 'STANDARD',
        },
      });

      return NextResponse.json({ success: true, message: 'User registered successfully.' }, { status: 201 });

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json({ success: false, error: 'Email is already registered' }, { status: 400 });
        }
      }
      console.error('Registration error:', error);
      return NextResponse.json({ success: false, error: 'An error occurred during registration.' }, { status: 500 });
    }
  } catch (error) {
    // Handle JSON parsing errors
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}