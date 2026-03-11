import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const importPath = path.join(__dirname, 'themes-export.json');

  if (!fs.existsSync(importPath)) {
    console.error(`❌ File not found: ${importPath}`);
    console.log('💡 First run: npm run export-themes (on local machine)');
    process.exit(1);
  }

  console.log('📥 Importing themes to database...');

  const themesData = JSON.parse(fs.readFileSync(importPath, 'utf-8'));

  let imported = 0;
  let skipped = 0;

  for (const themeData of themesData) {
    const existing = await prisma.theme.findFirst({
      where: { name: themeData.name },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${themeData.name}" (already exists)`);
      skipped++;
      continue;
    }

    await prisma.theme.create({
      data: {
        name: themeData.name,
        primaryColor: themeData.primaryColor,
        accentColor: themeData.accentColor,
        gradientFrom: themeData.gradientFrom,
        gradientVia: themeData.gradientVia,
        gradientTo: themeData.gradientTo,
        buttonFrom: themeData.buttonFrom,
        buttonVia: themeData.buttonVia,
        buttonTo: themeData.buttonTo,
        titleFrom: themeData.titleFrom,
        titleVia: themeData.titleVia,
        titleTo: themeData.titleTo,
      },
    });

    console.log(`✅ Imported "${themeData.name}"`);
    imported++;
  }

  console.log(`\n✅ Import completed!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
