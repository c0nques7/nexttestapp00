// pages/api/searchchannels.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') { // Handle GET method
      const query = req.query.query as string; // Assuming query is a string
  
      const channels = await prisma.channel.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive', // Case-insensitive search
          },
        },
        select: {
          id: true,
          name: true
        }
      });
      
      res.status(200).json({ channels });
    } else {
      res.status(405).end(); // Method Not Allowed for other methods
    }
  }