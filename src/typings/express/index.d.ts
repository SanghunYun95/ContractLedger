import 'express';

declare module 'express' {
  export interface Request {
    user?: { role: string };
  }
}