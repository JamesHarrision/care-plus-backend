import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import { SystemRole } from '@prisma/client'
import { access } from 'fs';
import { JwtPayLoad } from '../interfaces/interfaces';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const JWT_ACCESS_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

export const TokenUtil = {
  generateOTP: (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  generateToken: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },

  signAccessToken: (payload: JwtPayLoad): string => {
    return jwt.sign(payload, ACCESS_SECRET as string, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
  },

  signRefreshToken: (payload: { userId: string }): string => {
    return jwt.sign(payload, REFRESH_SECRET as string, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  },

  getExpiresAt: (unit: 'hours' | 'days' | 'minutes', amount: number): Date => {
    const date = new Date();
    if (unit === 'minutes') date.setMinutes(date.getMinutes() + amount);
    if (unit === 'hours') date.setHours(date.getHours() + amount);
    if (unit === 'days') date.setDate(date.getDate() + amount);
    return date;
  },

  verifyAccessToken: (token: string) => {
    return jwt.verify(token, ACCESS_SECRET as string) as JwtPayLoad;
  }
}