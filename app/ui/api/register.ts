import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { NextApiRequest, NextApiResponse } from 'next'; // Import types for req/res

const prisma = new PrismaClient();

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponseBody {
  error?: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RegisterResponseBody>) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    // 1. Extract and Validate Data (manually)
    const { username, email, password } = req.body as RegisterRequestBody;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (username.length < 1 || password.length < 6) {
      return res.status(400).json({ error: 'Invalid username or password' }); // Simplified for brevity
    }

    if (!validateEmail(email)) { // assuming you have a validateEmail function
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // 2. Check for Existing User (using Prisma)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create New User (using Prisma)
    await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { // Unique constraint violation
        return res.status(409).json({ error: 'Username or email already taken' });
      }
    }

    res.status(500).json({ error: 'An error occurred during registration' });
  } finally {
    await prisma.$disconnect(); // Important: Close Prisma connection
  }
}