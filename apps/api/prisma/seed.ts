import { PrismaClient, BookFormatType, BookStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

const books = [
  {
    title: 'The Quiet Horizon',
    description:
      'A contemplative journey across distant shores, where memory and tide rewrite what home means.',
    language: 'en',
    rating: 4.6,
    reviews: 234,
    categories: ['fiction'],
    author: 'M. Ellison',
    physical: 18.99,
    ebook: 9.99,
    stock: 42,
  },
  {
    title: 'The Silent Voyage',
    description:
      'An award-winning maritime mystery that follows a vanished freighter and the crew left behind.',
    language: 'en',
    rating: 4.6,
    reviews: 2345,
    categories: ['fiction', 'bestsellers'],
    author: 'E. Morgan',
    physical: 16.99,
    ebook: 9.99,
    stock: 8,
  },
  {
    title: 'Ember & Ash',
    description:
      'Epic fantasy of twin realms bound by fire magic and an uneasy peace.',
    language: 'en',
    rating: 4.8,
    reviews: 891,
    categories: ['fantasy'],
    author: 'R. Vale',
    physical: 21.5,
    ebook: 11.99,
    stock: 55,
  },
  {
    title: 'Atomic Habits for Readers',
    description:
      'Practical systems for building a lifelong reading habit without burnout.',
    language: 'en',
    rating: 4.7,
    reviews: 1204,
    categories: ['self-help'],
    author: 'A. Chen',
    physical: 19.99,
    ebook: 12.99,
    stock: 120,
  },
  {
    title: 'Startup Ledger',
    description:
      'A field guide to fundraising, runway discipline, and product-market fit.',
    language: 'en',
    rating: 4.3,
    reviews: 412,
    categories: ['business'],
    author: 'J. Okonkwo',
    physical: 24.0,
    ebook: 14.99,
    stock: 33,
  },
  {
    title: 'Maps of Midnight',
    description:
      'Noir fantasy through rain-slicked alleys where cartographers sell forbidden routes.',
    language: 'en',
    rating: 4.5,
    reviews: 677,
    categories: ['fantasy', 'fiction'],
    author: 'L. Prado',
    physical: 17.5,
    ebook: 8.99,
    stock: 5,
  },
  {
    title: 'Deep Work Weekly',
    description:
      'A weekly planner and manifesto for focused craft in a distracted world.',
    language: 'en',
    rating: 4.4,
    reviews: 998,
    categories: ['self-help', 'business'],
    author: 'A. Chen',
    physical: 15.99,
    ebook: 7.99,
    stock: 76,
  },
  {
    title: 'Garden of Glass',
    description:
      'Literary fiction set in a conservatory where every bloom remembers a secret.',
    language: 'en',
    rating: 4.2,
    reviews: 301,
    categories: ['fiction'],
    author: 'M. Ellison',
    physical: 16.5,
    ebook: 9.49,
    stock: 18,
  },
  {
    title: 'Dragon Protocol',
    description:
      'Sci-fantasy thriller: ancient dragons awaken inside a corporate AI cluster.',
    language: 'en',
    rating: 4.1,
    reviews: 540,
    categories: ['fantasy', 'bestsellers'],
    author: 'R. Vale',
    physical: 20.99,
    ebook: 10.99,
    stock: 2,
  },
  {
    title: 'Coastal Economics',
    description:
      'How ports, climate, and trade reshape regional prosperity.',
    language: 'en',
    rating: 4.0,
    reviews: 188,
    categories: ['business'],
    author: 'J. Okonkwo',
    physical: 28.0,
    ebook: 16.99,
    stock: 40,
  },
  {
    title: 'Night Market Recipes',
    description:
      'Street-food stories and recipes from Asia’s most vibrant night markets.',
    language: 'en',
    rating: 4.9,
    reviews: 1502,
    categories: ['bestsellers'],
    author: 'L. Prado',
    physical: 22.99,
    ebook: 13.99,
    stock: 64,
  },
  {
    title: 'Letters from the Archive',
    description:
      'Epistolary novel spanning three generations of librarians and lost cities.',
    language: 'en',
    rating: 4.5,
    reviews: 720,
    categories: ['fiction'],
    author: 'E. Morgan',
    physical: 18.0,
    ebook: 9.99,
    stock: 27,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding boks database...');

  await prisma.inventory.deleteMany();
  await prisma.bookFormat.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.bookCategory.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@boks.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      firstName: 'Bookstore',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: 'alex@boks.local',
      passwordHash: await bcrypt.hash('Customer123!', 10),
      firstName: 'Alex',
      lastName: 'Reader',
      role: Role.CUSTOMER,
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: { name: 'Main Warehouse', code: 'MAIN' },
  });

  const publisher = await prisma.publisher.create({
    data: { name: 'Horizon Press', slug: 'horizon-press' },
  });

  const categoryDefs = [
    { name: 'Fiction', slug: 'fiction' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Self-Help', slug: 'self-help' },
    { name: 'Business', slug: 'business' },
    { name: 'Bestsellers', slug: 'bestsellers' },
  ];
  const categories = await Promise.all(
    categoryDefs.map((c) =>
      prisma.category.create({
        data: { ...c, description: `${c.name} titles` },
      }),
    ),
  );
  const categoryBySlug = Object.fromEntries(
    categories.map((c) => [c.slug, c]),
  );

  const authorNames = [...new Set(books.map((b) => b.author))];
  const authors = await Promise.all(
    authorNames.map((name) =>
      prisma.author.create({
        data: {
          name,
          slug: slugify(name),
          bio: `${name} is a featured boks author.`,
        },
      }),
    ),
  );
  const authorByName = Object.fromEntries(authors.map((a) => [a.name, a]));

  for (const b of books) {
    const book = await prisma.book.create({
      data: {
        title: b.title,
        slug: slugify(b.title),
        description: b.description,
        language: b.language,
        status: BookStatus.PUBLISHED,
        averageRating: b.rating,
        reviewCount: b.reviews,
        publisherId: publisher.id,
        coverKey: null,
        authors: {
          create: [{ authorId: authorByName[b.author].id }],
        },
        categories: {
          create: b.categories.map((slug) => ({
            categoryId: categoryBySlug[slug].id,
          })),
        },
        formats: {
          create: [
            {
              format: BookFormatType.PHYSICAL,
              price: b.physical,
              isbn: `978${Math.floor(Math.random() * 1e10)
                .toString()
                .padStart(10, '0')}`,
              sku: `PHY-${slugify(b.title).slice(0, 12).toUpperCase()}`,
              currency: 'USD',
            },
            {
              format: BookFormatType.EBOOK,
              price: b.ebook,
              previewPages: 15,
              currency: 'USD',
            },
          ],
        },
        inventory: {
          create: {
            warehouseId: warehouse.id,
            onHand: b.stock,
            lowStockThreshold: 10,
          },
        },
      },
    });
    console.log(`  + ${book.title}`);
  }

  console.log('Seed complete.');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log('Customer: alex@boks.local / Customer123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
