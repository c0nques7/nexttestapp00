import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

interface LoginRequestBody {
  identifier: string; // Can be either email or username
  password: string;
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json() as LoginRequestBody;

    // Basic Input Validation
    if (!identifier || !password) {
      return new Response(JSON.stringify({ error: 'Missing email/username or password' }), { status: 400 });
    }

    // Fetch User (allowing login with either email or username)
    const user = await prisma.site_users.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 }); // 401 Unauthorized
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // Successful Login (Consider implementing a session or JWT for authentication here)
    return new Response(
      JSON.stringify({ message: 'Login successful', user: { id: user.id, username: user.username } }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during login' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
