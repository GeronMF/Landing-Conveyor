import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      passwordHash: adminPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  const demoLanding = await prisma.landing.upsert({
    where: { slug: 'demo-winter-suit' },
    update: {},
    create: {
      slug: 'demo-winter-suit',
      status: 'published',
      pageTitle: 'Зимовий костюм "Прогулянка"',
      introText:
        'Теплий і стильний костюм для зимових прогулянок. Якісні матеріали, сучасний дизайн.',
      globalFAQTitle: 'Часті питання',
      seoTitle: 'Зимовий костюм "Прогулянка" - купити онлайн',
      seoDescription:
        'Тепло, комфорт і стиль в одному костюмі. Замовте зараз зі знижкою!',
      themePrimaryColor: '#2563eb',
      themeAccentColor: '#10b981',
      companyName: 'ТОВ "Розпакуй"',
      legalText:
        'ТОВ "Розпакуй", ЄДРПОУ 12345678, м. Київ, вул. Прикладна 1',
      phone: '+380 (67) 123-45-67',
      email: 'info@example.com',
      socials: {
        instagram: 'https://instagram.com/example',
        facebook: 'https://facebook.com/example',
      },
      links: {
        privacyPolicy: '/privacy',
        termsOfService: '/terms',
      },
    },
  });

  console.log('✅ Demo landing created:', demoLanding.slug);

  const variant1 = await prisma.variant.create({
    data: {
      landingId: demoLanding.id,
      order: 1,
      title: 'Костюм "Зимова Прогулянка" - М\'ятний',
      subtitle: 'Теплий і стильний костюм для зимових прогулянок',
      offerText:
        'Тепло, комфорт і стиль в одному костюмі! Ідеальний вибір для холодної зими.',
      badgeText: 'Знижка 50%',
      price: 1499,
      oldPrice: 2999,
      currency: 'UAH',
      ctaPrimaryText: 'Замовити зараз',
      ctaSecondaryPhoneText: 'Або телефонуйте',
      primaryPhone: '+380 (67) 123-45-67',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoTitle: 'Відео огляд костюма',
      videoText: 'Подивіться детальний огляд всіх особливостей костюма',
      repeatOfferBlocks: 2,
    },
  });

  await prisma.variantImage.createMany({
    data: [
      {
        variantId: variant1.id,
        url: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg',
        alt: 'Зимовий костюм м\'ятного кольору',
        order: 1,
      },
      {
        variantId: variant1.id,
        url: 'https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg',
        alt: 'Деталі костюма',
        order: 2,
      },
      {
        variantId: variant1.id,
        url: 'https://images.pexels.com/photos/1126999/pexels-photo-1126999.jpeg',
        alt: 'Костюм на моделі',
        order: 3,
      },
    ],
  });

  await prisma.benefit.createMany({
    data: [
      {
        variantId: variant1.id,
        title: 'Водонепроникний',
        text: 'Спеціальна мембрана захищає від дощу і снігу',
        order: 1,
      },
      {
        variantId: variant1.id,
        title: 'Утеплений',
        text: 'Сучасний утеплювач зберігає тепло до -25°C',
        order: 2,
      },
      {
        variantId: variant1.id,
        title: 'Зручний крій',
        text: 'Продуманий крій не сковує рухів',
        order: 3,
      },
      {
        variantId: variant1.id,
        title: 'Якісні матеріали',
        text: 'Використані лише перевірені гіпоалергенні тканини',
        order: 4,
      },
    ],
  });

  await prisma.specification.createMany({
    data: [
      {
        variantId: variant1.id,
        key: 'Матеріал верху',
        value: 'Поліестер з мембраною',
        order: 1,
      },
      {
        variantId: variant1.id,
        key: 'Утеплювач',
        value: 'Холофайбер 300г/м²',
        order: 2,
      },
      {
        variantId: variant1.id,
        key: 'Підкладка',
        value: 'Фліс',
        order: 3,
      },
      {
        variantId: variant1.id,
        key: 'Температурний режим',
        value: 'До -25°C',
        order: 4,
      },
      {
        variantId: variant1.id,
        key: 'Догляд',
        value: 'Машинне прання 30°C',
        order: 5,
      },
    ],
  });

  const sizeTable = await prisma.sizeTable.create({
    data: {
      variantId: variant1.id,
      title: 'Таблиця розмірів',
      order: 1,
    },
  });

  await prisma.sizeTableRow.createMany({
    data: [
      {
        sizeTableId: sizeTable.id,
        sizeLabel: 'S',
        columns: { bust: '88-92', waist: '70-74', hips: '94-98' },
        order: 1,
      },
      {
        sizeTableId: sizeTable.id,
        sizeLabel: 'M',
        columns: { bust: '92-96', waist: '74-78', hips: '98-102' },
        order: 2,
      },
      {
        sizeTableId: sizeTable.id,
        sizeLabel: 'L',
        columns: { bust: '96-100', waist: '78-82', hips: '102-106' },
        order: 3,
      },
      {
        sizeTableId: sizeTable.id,
        sizeLabel: 'XL',
        columns: { bust: '100-104', waist: '82-86', hips: '106-110' },
        order: 4,
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        variantId: variant1.id,
        authorName: 'Олена К.',
        rating: 5,
        text: 'Чудовий костюм! Дуже теплий і зручний. Дякую!',
        order: 1,
      },
      {
        variantId: variant1.id,
        authorName: 'Марина В.',
        rating: 5,
        text: 'Замовляла для доньки, вона в захваті. Якість супер!',
        order: 2,
      },
      {
        variantId: variant1.id,
        authorName: 'Андрій П.',
        rating: 4,
        text: 'Добрий костюм, трохи довго йшла доставка, але якість чудова.',
        order: 3,
      },
    ],
  });

  const variant2 = await prisma.variant.create({
    data: {
      landingId: demoLanding.id,
      order: 2,
      title: 'Костюм "Зимова Прогулянка" - Синій',
      subtitle: 'Класичний синій колір для справжніх морозів',
      offerText:
        'Теплий зимовий костюм синього кольору з посиленим утепленням!',
      badgeText: 'Хіт продажів',
      price: 1699,
      oldPrice: 3299,
      currency: 'UAH',
      ctaPrimaryText: 'Замовити зараз',
      primaryPhone: '+380 (67) 123-45-67',
      repeatOfferBlocks: 2,
    },
  });

  await prisma.variantImage.createMany({
    data: [
      {
        variantId: variant2.id,
        url: 'https://images.pexels.com/photos/1124960/pexels-photo-1124960.jpeg',
        alt: 'Зимовий костюм синього кольору',
        order: 1,
      },
      {
        variantId: variant2.id,
        url: 'https://images.pexels.com/photos/1102840/pexels-photo-1102840.jpeg',
        alt: 'Синій костюм на моделі',
        order: 2,
      },
    ],
  });

  await prisma.benefit.createMany({
    data: [
      {
        variantId: variant2.id,
        title: 'Посилене утеплення',
        text: 'Витримує морози до -30°C',
        order: 1,
      },
      {
        variantId: variant2.id,
        title: 'Класичний дизайн',
        text: 'Універсальний синій колір підходить під будь-який стиль',
        order: 2,
      },
      {
        variantId: variant2.id,
        title: 'Міцні блискавки',
        text: 'Якісна фурнітура YKK',
        order: 3,
      },
    ],
  });

  await prisma.specification.createMany({
    data: [
      {
        variantId: variant2.id,
        key: 'Матеріал верху',
        value: 'Поліестер з мембраною',
        order: 1,
      },
      {
        variantId: variant2.id,
        key: 'Утеплювач',
        value: 'Холофайбер 400г/м²',
        order: 2,
      },
      {
        variantId: variant2.id,
        key: 'Температурний режим',
        value: 'До -30°C',
        order: 3,
      },
    ],
  });

  await prisma.fAQ.createMany({
    data: [
      {
        landingId: demoLanding.id,
        question: 'Як швидко відбувається доставка?',
        answer:
          'Доставка по Україні займає 1-3 робочі дні. Нова Пошта або Укрпошта на ваш вибір.',
        order: 1,
      },
      {
        landingId: demoLanding.id,
        question: 'Чи можна обміняти або повернути товар?',
        answer:
          'Так, протягом 14 днів ви можете повернути або обміняти товар без пояснення причин.',
        order: 2,
      },
      {
        landingId: demoLanding.id,
        question: 'Як оплатити замовлення?',
        answer:
          'Накладений платіж при отриманні, або передплата на карту. Будь-який зручний для вас спосіб.',
        order: 3,
      },
      {
        landingId: demoLanding.id,
        question: 'Які розміри є в наявності?',
        answer: 'В наявності розміри від S до XXL. Див. таблицю розмірів вище.',
        order: 4,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📧 Admin credentials:');
  console.log(
    `   Email: ${process.env.ADMIN_EMAIL || 'admin@example.com'}`
  );
  console.log(
    `   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`
  );
  console.log('\n🔗 Demo landing:');
  console.log(`   http://localhost:3000/l/demo-winter-suit`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
