import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const exist = await prisma.counter.findFirst();
  if (exist) {
    console.log("Counter sudah ada, lewati seed.");
    return;
  }

  const counters = [
    { name: "Loket Pelayanan A", maxQueue: 20 },
    { name: "Loket Pelayanan B", maxQueue: 15 },
  ];

  for (const c of counters) {
    await prisma.counter.create({ data: c });
    console.log(`Membuat counter: ${c.name}`);
  }

  console.log("Seed selesai.");
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
