import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Clear all
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.childCategory.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});

  await prisma.user.upsert({
    where: { email: 'admin@quickprint.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@quickprint.com',
      password: hashedPassword,
      name: 'Ayoub Admin',
      role: 'ADMIN',
    },
  });

  // Level 1: Apparel
  const cloths = await prisma.category.create({
    data: {
      name: 'Clothes',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80',
    }
  });

  // Level 1: Drinkware
  const drinkware = await prisma.category.create({
    data: {
      name: 'Drinkware',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558f6b21f?auto=format&fit=crop&q=80',
    }
  });

  // Level 2: Mugs
  const mugs = await prisma.subCategory.create({
    data: {
      name: 'Mugs',
      categoryId: drinkware.id
    }
  });

  // Level 3: Ceramic Mug
  const ceramicMug = await prisma.childCategory.create({
    data: {
      name: 'Ceramic Mug',
      subCategoryId: mugs.id
    }
  });

  // Level 3: Magic Mug
  const magicMug = await prisma.childCategory.create({
    data: {
      name: 'Magic Mug',
      subCategoryId: mugs.id
    }
  });

  // Mug Product
  await prisma.product.create({
    data: {
      name: 'Custom White Ceramic Mug',
      price: 45,
      oldPrice: 65,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558f6b21f?auto=format&fit=crop&q=80',
      description: 'High-quality 11oz ceramic mug. Perfect for your morning coffee or as a gift.',
      size: '11oz (200x90mm Print Area)',
      maskType: 'none',
      childCategoryId: ceramicMug.id
    }
  });

  console.log('Mug Categories and Product seeded!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
