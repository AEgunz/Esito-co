import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        code: (code as string).toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null
      }
    });
    res.status(201).json(coupon);
  } catch (error: any) {
    if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Error creating coupon' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({
      where: { id: id as string }
    });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) return res.status(400).json({ message: 'Code is required' });

    const coupon = await prisma.coupon.findUnique({
      where: { code: (code as string).toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'Invalid or inactive promo code' });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    }

    if (orderAmount < Number(coupon.minOrderAmount)) {
      return res.status(400).json({ message: `Minimum order amount for this code is ${coupon.minOrderAmount} DH` });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
    } else {
      discount = Number(coupon.discountValue);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountAmount: discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon' });
  }
};
