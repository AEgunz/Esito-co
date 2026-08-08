import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, userName, productId } = req.body;

    if (!rating || !userName || !productId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userName,
        productId
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
