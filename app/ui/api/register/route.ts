import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Or a stricter regex
  return emailRegex.test(email);
};

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json() as RegisterRequestBody;

    // Enhanced Input Validation
    if (
      !username || 
      !email || 
      !password || 
      username.length < 3 ||  
      password.length < 8 || 
      !validateEmail(email)
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data. Please check your username, email, and password.' }), 
        { status: 400 }
      );
    }

    // Check for Existing User and Create New User (with upsert)
    const existingUser = await prisma.site_users.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email is already registered' }),
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12); 
    await prisma.site_users.create({ data: { username, email, password: hashedPassword } });
    
    // Security: Don't expose details on successful registration
    return new Response(JSON.stringify({ message: 'User registered successfully' }), { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during registration. Please try again later.' }), { status: 500 }); 
  } finally {
    await prisma.$disconnect(); 
  }
}

