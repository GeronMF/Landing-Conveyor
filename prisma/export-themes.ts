import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('📤 Exporting themes from local database...');

  const themes = await prisma.theme.findMany({
    orderBy: { createdAt: 'asc' },
  });

  if (themes.length === 0) {
    console.log('❌ No themes found in database');
    return;
  }

  const exportData = themes.map((theme) => ({
    name: theme.name,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    gradientFrom: theme.gradientFrom,
    gradientVia: theme.gradientVia,
    gradientTo: theme.gradientTo,
    buttonFrom: theme.buttonFrom,
    buttonVia: theme.buttonVia,
    buttonTo: theme.buttonTo,
    titleFrom: theme.titleFrom,
    titleVia: theme.titleVia,
    titleTo: theme.titleTo,
  }));

  const outputPath = path.join(__dirname, 'themes-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`✅ Exported ${themes.length} themes to ${outputPath}`);
  console.log('\n📋 Themes:');
  themes.forEach((theme) => {
    console.log(`   - ${theme.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Export failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
