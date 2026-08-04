import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching templates' });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, imageUrl, type } = req.body;
    const template = await prisma.template.create({
      data: { name, imageUrl, type }
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error creating template' });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.template.delete({ where: { id } });
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template' });
  }
};
