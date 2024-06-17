// /lib/prisma-client-edge.ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

export const isEdgeFunction = () => {
  // Check for Web Fetch API specific features that exist only in Edge functions
  return (
    typeof Request !== 'undefined' && typeof Response !== 'undefined' && typeof fetch !== 'undefined'
  );
};

const neon = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL })
const adapter = new PrismaNeon(neon)
const prisma = isEdgeFunction() ? new PrismaClient({ adapter }) : new PrismaClient()

export default prisma
