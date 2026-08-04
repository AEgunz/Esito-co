import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth';
import AmeexService from '../utils/AmeexService';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      totalAmount,
      deliveryFee,
      firstName,
      lastName,
      email,
      phone,
      address,
      city
    } = req.body;

    const userId = req.user?.id;

    // 1. Save to Database First
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        deliveryFee: deliveryFee || 0,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            customerPhoto: item.customerPhoto,
            customText: item.customText,
            isSpecialDesign: item.isSpecialDesign || false
          }))
        }
      },
      include: { items: true }
    });

    // 2. Try creating AMEEX Parcel (Background/Fail-safe)
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } }
      });

      // Try to find the AMEEX City ID from our mapping
      const deliverySettings = await prisma.deliveryFee.findUnique({
        where: { city: order.city.toLowerCase() }
      });

      if (!deliverySettings || !deliverySettings.ameexId) {
        console.error(`⚠️ WARNING: City "${order.city}" has no AMEEX ID mapping. Using default "1". Please configure it in Admin > Delivery.`);
      }

      const orderForAmeex = {
        ...fullOrder,
        city: deliverySettings?.ameexId || '1'
      };

      console.log(`📡 Syncing with AMEEX: Sending City ID "${orderForAmeex.city}" for city "${order.city}"`);

      const trackingNumber = await AmeexService.createParcel(orderForAmeex);
      if (trackingNumber) {
        console.log(`✅ AMEEX Parcel Created: ${trackingNumber}`);
        await prisma.order.update({
          where: { id: order.id },
          data: { trackingNumber: String(trackingNumber) }
        });
      }
    } catch (ameexError) {
      console.error('AMEEX Integration Failed:', ameexError);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { firstName, lastName, email, phone, address, city, status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        status
      }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order' });
  }
};

// Webhook for AMEEX to update order status
export const ameexWebhook = async (req: Request, res: Response) => {
  try {
    const tracking_number = req.body.tracking_number as string;
    const status = req.body.status as string;

    if (!tracking_number || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = await prisma.order.findUnique({
      where: { trackingNumber: tracking_number }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const newStatus = AmeexService.mapStatus(status);

    await prisma.order.update({
      where: { trackingNumber: tracking_number },
      data: { status: newStatus as any }
    });

    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook internal error' });
  }
};
