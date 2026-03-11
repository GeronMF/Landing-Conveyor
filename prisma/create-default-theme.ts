import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Проверяем, существует ли уже стандартная тема
  const existingTheme = await prisma.theme.findFirst({
    where: { name: 'Стандартна' },
  });

  if (existingTheme) {
    console.log('✅ Стандартна тема вже існує:', existingTheme.id);
    return;
  }

  // Создаем стандартную тему с параметрами из кода
  const defaultTheme = await prisma.theme.create({
    data: {
      name: 'Стандартна',
      primaryColor: '#2563eb', // синий
      accentColor: '#10b981', // зеленый
      gradientFrom: '#dbeafe', // blue-200
      gradientVia: '#cffafe', // cyan-200
      gradientTo: '#ccfbf1', // teal-200
    },
  });

  console.log('✅ Стандартна тема створена:', defaultTheme.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
