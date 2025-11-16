import { JwtPayload } from 'jsonwebtoken';

type EnvironmentVariables = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
};

export interface TokenPayload extends JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }

  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export {};
