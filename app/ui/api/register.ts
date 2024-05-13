import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { validateEmail } from '@/app/lib/utils'; 

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end(); // Method Not Allowed

  try {
    const { username, email, password } = req.body as RegisterRequestBody;

    // Enhanced Input Validation
    if (
      !username || 
      !email || 
      !password || 
      username.length < 3 ||  // Minimum username length of 3
      password.length < 8 || // Minimum password length of 8 (industry best practice)
      !validateEmail(email)
    ) {
      return res.status(400).json({ error: 'Invalid input data. Please check your username, email, and password.' });
    }

    // Check for Existing User and Create New User (with upsert)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // 12 is a good work factor for bcrypt
    await prisma.user.create({ data: { username, email, password: hashedPassword } });
    
    // Security: Don't expose details on successful registration
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);

    // General Error Handling 
    res.status(500).json({ error: 'An error occurred during registration. Please try again later.' }); 
  } finally {
    await prisma.$disconnect(); 
  }
}
