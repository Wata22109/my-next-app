import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const testStage = {
    name: "Tutorial Stage",
    width: 3,
    height: 3,
    pipes: [
      [
        { type: "start", direction: 0, isFixed: true },
        { type: "straight", direction: 90, isFixed: true },
        { type: "end", direction: 180, isFixed: true },
      ],
      [
        { type: "empty", direction: 0, isFixed: false },
        { type: "corner", direction: 0, isFixed: false },
        { type: "empty", direction: 0, isFixed: false },
      ],
      [
        { type: "empty", direction: 0, isFixed: false },
        { type: "straight", direction: 0, isFixed: false },
        { type: "empty", direction: 0, isFixed: false },
      ],
    ],
  };

  await prisma.stage.create({
    data: testStage,
  });

  console.log("Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
