import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all categories...');
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          include: { childCategories: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${categories.length} categories.`);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Error fetching categories',
      details: error instanceof Error ? error.message : 'Unknown Prisma error'
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;
    if (!name || !image) {
      return res.status(400).json({ message: 'Name and Image are required' });
    }
    const category = await prisma.category.create({
      data: { name, description, image },
    });
    res.status(201).json(category);
  } catch (error: any) {
    console.error('Create Category Error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, description, image } = req.body;
        const category = await prisma.category.update({
            where: { id },
            data: { name, description, image }
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.category.delete({ where: { id } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
};

// SubCategory (Level 2)
export const createSubCategory = async (req: Request, res: Response) => {
    try {
        const { name, categoryId } = req.body;
        const sub = await prisma.subCategory.create({
            data: { name, categoryId }
        });
        res.status(201).json(sub);
    } catch (error) {
        res.status(500).json({ message: 'Error creating sub-category' });
    }
};

export const deleteSubCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.subCategory.delete({ where: { id } });
        res.json({ message: 'Sub-category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sub-category' });
    }
};

// ChildCategory (Level 3)
export const createChildCategory = async (req: Request, res: Response) => {
    try {
        const { name, subCategoryId } = req.body;
        const child = await prisma.childCategory.create({
            data: { name, subCategoryId }
        });
        res.status(201).json(child);
    } catch (error) {
        res.status(500).json({ message: 'Error creating child-category' });
    }
};

export const deleteChildCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.childCategory.delete({ where: { id } });
        res.json({ message: 'Child-category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting child-category' });
    }
};
