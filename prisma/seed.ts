import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dusuns = ["Dusun 1", "Dusun 2", "Dusun 3", "Dusun 4", "Dusun 5"];

  console.log("Seeding Dusun...");
  for (const nama of dusuns) {
    await prisma.dusun.create({
      data: {
        nama,
      },
    });
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
