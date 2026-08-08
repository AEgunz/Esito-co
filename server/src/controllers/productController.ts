import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string;
    const subCategoryId = req.query.subCategoryId as string;
    const childCategoryId = req.query.childCategoryId as string;

    const products = await prisma.product.findMany({
      where: {
        ...(childCategoryId ? { childCategoryId } : {}),
        ...(subCategoryId ? { subCategoryId } : {}),
        ...(categoryId ? { subCategory: { categoryId } } : {}),
      },
      include: {
        subCategory: {
          include: { category: true }
        },
        childCategory: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subCategory: {
          include: { category: true }
        },
        childCategory: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, oldPrice, image, images, subCategoryId, childCategoryId, size, maskType, colors, requiresCustomPhotos, photoCount } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        image,
        images: images || [],
        subCategoryId,
        childCategoryId: childCategoryId || null,
        size,
        maskType,
        colors: colors || [],
        requiresCustomPhotos: Boolean(requiresCustomPhotos),
        photoCount: Number(photoCount) || 0
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Prisma Error:', error);
    res.status(500).json({
        message: 'Database Error',
        details: error.message || 'Unknown error'
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, price, oldPrice, image, images, subCategoryId, childCategoryId, size, maskType, colors, requiresCustomPhotos, photoCount } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        image,
        images: images || [],
        subCategoryId,
        childCategoryId: childCategoryId || null,
        size,
        maskType,
        colors: colors || [],
        requiresCustomPhotos: Boolean(requiresCustomPhotos),
        photoCount: Number(photoCount) || 0
      },
    });
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({
      where: { id },
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};
