import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const datasourceUrl = process.env.DATABASE_URL;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

if (!datasourceUrl) {
  throw new Error("DATABASE_URL is not set.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ 
        adapter
   });


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
