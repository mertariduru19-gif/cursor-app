import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/enums";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
