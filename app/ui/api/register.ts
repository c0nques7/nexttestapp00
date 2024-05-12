import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import type { NextApiRequest, NextApiResponse } from 'next'; // Import types for req/res

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { username, email, password } = req.body;

  try {
    // Check if username or email already exists
    const { rows: existingUsers } = await sql`
      SELECT 1 FROM users WHERE username = ${username} OR email = ${email}
    `;

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
    `;

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
}