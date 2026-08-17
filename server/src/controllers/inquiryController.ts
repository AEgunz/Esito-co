import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, logoUrl } = req.body;
    const inquiry = await prisma.inquiry.create({
      data: { name, email, phone, subject: subject || 'Corporate Request', message, logoUrl }
    });
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error sending inquiry' });
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inquiries' });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inquiry' });
  }
};

export const deleteInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.inquiry.delete({ where: { id } });
    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inquiry' });
  }
};
