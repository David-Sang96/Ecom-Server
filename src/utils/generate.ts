import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ENV_VARS } from '../config/envVars';

export const generateToken = () => {
  return randomBytes(32).toString('hex');
};

export const generateJwtTokens = (id: Types.ObjectId, email: string) => {
  const accessTokenPayload = { userId: id };
  const refreshTokenPayload = { userId: id, email };

  const accessToken = jwt.sign(
    accessTokenPayload,
    ENV_VARS.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    ENV_VARS.REFRESH_TOKEN_SECRET!,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};
