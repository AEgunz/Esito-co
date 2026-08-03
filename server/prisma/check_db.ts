import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection...');
    await prisma.$connect();
    console.log('Connected successfully!');

    console.log('Checking Category table...');
    const catCount = await prisma.category.count();
    console.log('Category count:', catCount);

    console.log('Checking SubCategory table...');
    const subCount = await prisma.subCategory.count();
    console.log('SubCategory count:', subCount);

    console.log('Checking ChildCategory table...');
    const childCount = await prisma.childCategory.count();
    console.log('ChildCategory count:', childCount);

  } catch (e: any) {
    console.error('DB Check Failed:');
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
