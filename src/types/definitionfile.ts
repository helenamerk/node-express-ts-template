import { Request } from 'express';

export interface IPreAuthenticatedRequest extends Request {
  user?: any; // or any other type
  userId?: string;
  device?: string;
}

export interface IAuthenticatedRequest extends Request {
  user: any; // or any other type
  userId: string;
  device?: string;
}
