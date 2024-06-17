import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: number; // Adjust this type according to your JWT payload structure
}

export async function verifyJwtToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET!, 
      { algorithms: ['HS256'] }, // Specify the algorithm used to sign the JWT (replace HS256 if needed)
      (err, decodedToken) => {
        if (err || !decodedToken) {
          reject(err); 
        } else {
          resolve(decodedToken as TokenPayload);
        }
      }
    );
  });
}