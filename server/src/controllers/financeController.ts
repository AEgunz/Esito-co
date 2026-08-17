import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    // 1. Get Total Sales from Orders (excluding cancelled)
    const orders = await prisma.order.findMany({
      where: { NOT: { status: 'CANCELLED' } }
    });
    const ordersIncome = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // 2. Get Manual Incomes
    const manualIncomes = await prisma.manualIncome.findMany({
      orderBy: { date: 'desc' }
    });
    const totalManualIncome = manualIncomes.reduce((sum, i) => sum + Number(i.amount), 0);

    const totalIncome = ordersIncome + totalManualIncome;

    // 3. Get Total Expenses
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({
      ordersIncome,
      totalManualIncome,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      expenses,
      manualIncomes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial summary' });
  }
};

export const addManualIncome = async (req: Request, res: Response) => {
  try {
    const { description, amount, category, date } = req.body;
    const income = await prisma.manualIncome.create({
      data: {
        description,
        amount: Number(amount),
        category,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Error adding income' });
  }
};

export const deleteManualIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.manualIncome.delete({ where: { id: id as string } });
    res.json({ message: 'Income record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting income record' });
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
