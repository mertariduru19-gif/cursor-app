import { prisma } from "../config/prisma";
import { UserRole } from "../models/enums";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

const toProfile = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: UserRole.USER,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: toProfile(user) };
};

export const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await comparePassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: toProfile(user) };
};
