import { PrismaClient, Priority, RequestStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@facility.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@facility.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@facility.com" },
    update: {},
    create: {
      name: "Standard User",
      email: "user@facility.com",
      passwordHash: userPassword,
      role: UserRole.USER,
    },
  });

  await prisma.maintenanceRequest.createMany({
    data: [
      {
        title: "HVAC filter replacement",
        description: "Quarterly filter replacement needed for 2nd floor HVAC.",
        location: "Building A - Floor 2",
        category: "HVAC",
        priority: Priority.MEDIUM,
        status: RequestStatus.OPEN,
        requesterId: user.id,
      },
      {
        title: "Lobby light flickering",
        description: "Main lobby lights flicker intermittently after 6 PM.",
        location: "Building A - Lobby",
        category: "Electrical",
        priority: Priority.HIGH,
        status: RequestStatus.IN_PROGRESS,
        requesterId: admin.id,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
