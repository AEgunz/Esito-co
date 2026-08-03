import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDeliveryFees = async (req: Request, res: Response) => {
  try {
    const fees = await prisma.deliveryFee.findMany();
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery fees' });
  }
};

export const getDeliveryFeeByCity = async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    const fee = await prisma.deliveryFee.findUnique({
      where: { city: city.toLowerCase() }
    });
    res.json(fee || { city, fee: 30 }); // Default 30 if not found
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery fee' });
  }
};

export const upsertDeliveryFee = async (req: Request, res: Response) => {
  try {
    const { city, fee } = req.body;
    const deliveryFee = await prisma.deliveryFee.upsert({
      where: { city: city.toLowerCase() },
      update: { fee },
      create: { city: city.toLowerCase(), fee }
    });
    res.json(deliveryFee);
  } catch (error) {
    res.status(500).json({ message: 'Error saving delivery fee' });
  }
};

export const deleteDeliveryFee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.deliveryFee.delete({ where: { id } });
    res.json({ message: 'Delivery fee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delivery fee' });
  }
};
