import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = parseInt(req.query.userId as string, 10); // Use radix for parseInt

  try {
    if (req.method === 'GET') {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              tickers: true,
            },
          });

      res.status(200).json(user?.tickers || []);
    } else if (req.method === 'POST') {
      const newTicker = req.body.ticker;

      // ... Input Validation ...

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          tickers: {
            push: newTicker,
          },
        },
      });

      res.status(201).json({ message: 'Ticker added', user: updatedUser });
    } else if (req.method === 'DELETE') {
        const userId = parseInt(req.query.userId as string, 10);
        const tickerToRemove = req.body.ticker;
    
        try {
          // 1. Fetch the user's current tickers
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tickers: true },
          });
    
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
    
          // 2. Update the user's tickers, removing the specified ticker
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              tickers: {
                set: user.tickers.filter(t => t !== tickerToRemove) 
              },
            },
          });
    
          res.status(200).json({ message: 'Ticker removed', user: updatedUser });
        } catch (error) {
          res.status(500).json({ error: 'Failed to remove ticker' });
        }
      }else {
      res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma-specific known request errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          res.status(409).json({ error: 'Ticker already exists for this user' });
          break;
        case 'P2025': // Record to update/delete not found
          res.status(404).json({ error: 'User or ticker not found' });
          break;
        // Add other Prisma error codes you want to handle explicitly
        default:
          console.error('Prisma Error:', error); // Log for debugging
          res.status(500).json({ error: 'Database error' });
      }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      // Prisma validation errors (e.g., invalid data types)
      res.status(422).json({ error: 'Invalid data provided' });
    } else {
      // Other unexpected errors
      console.error('Unexpected Error:', error); // Log for debugging
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}