import { NextFunction, Response } from 'express';
import { IPreAuthenticatedRequest } from '../types/definitionfile';

// TODO: add error types

/**
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const AuthMiddleware = (
  req: IPreAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // if no token found, just continue!
  if (!req.userId) {
    return res.status(401).send('You need to be authenticated for this');
  } else {
    return next();
  }
};
