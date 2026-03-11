import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating "Стандартна (без темы)" theme with correct values...');

  // Ищем тему "Стандартна (без темы)" или "Стандартна"
  let theme = await prisma.theme.findFirst({
    where: { 
      OR: [
        { name: 'Стандартна (без темы)' },
        { name: 'Стандартна' }
      ]
    },
  });

  if (!theme) {
    console.log('❌ Theme "Стандартна (без темы)" or "Стандартна" not found');
    return;
  }

  console.log(`   Found theme: "${theme.name}" (ID: ${theme.id})`);

  // Обновляем тему с правильными значениями из стандартной темы
  // Используем более яркий и красивый градиент фона
  const updated = await prisma.theme.update({
    where: { id: theme.id },
    data: {
      primaryColor: '#2563eb',
      accentColor: '#10b981',
      // Более яркий и красивый градиент фона (как было локально)
      gradientFrom: '#eff6ff',  // blue-50 - очень светлый
      gradientVia: '#dbeafe',   // blue-100 - средний
      gradientTo: '#e0f2fe',    // cyan-50 - светлый
      // Кнопки
      buttonFrom: '#1e3a8a',
      buttonVia: '#0891b2',
      buttonTo: '#0d9488',
      // Заголовки
      titleFrom: '#2563eb',
      titleVia: '#0891b2',
      titleTo: '#0d9488',
    },
  });

  console.log(`✅ Theme "${updated.name}" updated successfully!`);
  console.log('   ID:', updated.id);
  console.log('   Background gradient:', updated.gradientFrom, '→', updated.gradientVia, '→', updated.gradientTo);
  console.log('   Button gradient:', updated.buttonFrom, '→', updated.buttonVia, '→', updated.buttonTo);
  console.log('   Title gradient:', updated.titleFrom, '→', updated.titleVia, '→', updated.titleTo);
  console.log('\n💡 Note: Orbs are automatically made almost invisible for "Стандартна" theme in theme-provider.tsx');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
