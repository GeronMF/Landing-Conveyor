import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Получаем все варианты
  const variants = await prisma.variant.findMany({
    where: {
      OR: [
        { economyText: null },
        { faqLinkText: null },
      ],
    },
  });

  console.log(`Найдено ${variants.length} вариантов для обновления`);

  // Обновляем каждый вариант
  for (const variant of variants) {
    await prisma.variant.update({
      where: { id: variant.id },
      data: {
        economyText: variant.economyText || 'Економія',
        faqLinkText: variant.faqLinkText || 'Часті питання',
      },
    });
    console.log(`Обновлен вариант: ${variant.id} - ${variant.title}`);
  }

  console.log('✅ Все варианты обновлены');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
