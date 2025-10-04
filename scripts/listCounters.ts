import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counters = await prisma.counter.findMany({
    orderBy: { id: 'asc' },
  });
  console.log(JSON.stringify(counters, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
