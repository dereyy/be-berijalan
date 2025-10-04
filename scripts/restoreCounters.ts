import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counters = await prisma.counter.findMany();
  if (counters.length === 0) {
    console.log("Tidak ada counter untuk direstorasi.");
    return;
  }

  for (const c of counters) {
    await prisma.counter.update({
      where: { id: c.id },
      data: { deletedAt: null, isActive: true },
    });
    console.log(`Restore counter id=${c.id} name=${c.name}`);
  }

  console.log("Selesai merestore semua counter.");
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
