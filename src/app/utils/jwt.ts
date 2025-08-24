import jwt, { JwtPayload } from 'jsonwebtoken';



declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const createToken = (
  jwtPayload: { userId: string; role: string , email: string },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn:"10d",
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};