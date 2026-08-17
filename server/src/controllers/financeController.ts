import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    // 1. Get Total Sales from COMPLETED orders (optional: you can include all except cancelled)
    const orders = await prisma.order.findMany({
      where: { NOT: { status: 'CANCELLED' } }
    });
    const totalIncome = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // 2. Get Total Expenses
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial summary' });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const { description, amount, category, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: Number(amount),
        category,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id: id as string } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
};
