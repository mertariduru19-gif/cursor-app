import { prisma } from "../config/prisma";
import { AppError } from "../utils/appError";

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
