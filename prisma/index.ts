import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// 1. Initialize a standard PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Wrap the pool in Prisma's official adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter directly into the Prisma Client constructor
const prisma = new PrismaClient({ adapter });

export default prisma;
