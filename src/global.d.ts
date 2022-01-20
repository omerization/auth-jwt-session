import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';


//types and interfaces globally declared below

namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGO_URI: string;
  }
}

module 'express-session' {
  export interface SessionData {
      user: object,
      isLoggedIn: boolean
  }
}

module "express" { 
  export interface Request {
    user: string | JwtPayload
  }
}


export type MiddlewareFn = (req: Request, res: Response, next: NextFunction) => void;
