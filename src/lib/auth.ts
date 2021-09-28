import jwt from 'jsonwebtoken';

export type CustomJWTPayload = {
  _id: string;
  device: string;
};

export const generateAuthToken = (userId: string, device?: string) => {
  const token = jwt.sign(
    { _id: userId, device },
    process.env.PRIVATE_AUTH_KEY ?? 'dropouts'
  );
  return token;
};
