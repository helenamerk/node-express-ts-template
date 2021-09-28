/*
Parse jwt token from header
*/

import { NextFunction, Response } from 'express';
import { IPreAuthenticatedRequest } from '../types/definitionfile';
import jwt from 'jsonwebtoken';
import parser from 'ua-parser-js';
import _ from 'lodash';
import { CustomJWTPayload } from '../lib/auth';

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */

export const ParseUserHeader = (
  req: IPreAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const agent = parser(req.headers['user-agent']);
  req.device = _.get(agent, 'os.name', 'unknown');

  const token = req.headers['x-access-token'] || req.headers.authorization;

  // if no token found, just continue!
  if (!token) {
    next();
  } else {
    try {
      // if can verify the token, set req.user_id and pass to next middleware
      // @ts-ignore
      const decoded: CustomJWTPayload = jwt.verify(
        token.toString(),
        process.env.PRIVATE_AUTH_KEY ?? 'dropouts'
      );

      req.userId = decoded._id;

      // backwards compatibility check:
      // older tokens do not have device name stored.
      if (decoded.device && !(req.device === decoded.device)) {
        console.log('token used does not match device that created token');
        throw new Error();
      }

      next();
    } catch (err) {
      res.status(401).send('Invalid token.');
    }
  }
};
