import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import nodemailer from 'nodemailer';

// Email transporter configuration
// NOTE: You need to add these to your Railway Variables for this to work
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.titan.email', // Example for Titan/Hostinger
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'contact@estilo-co.ma',
        pass: process.env.SMTP_PASS || 'your-email-password'
    }
});

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, logoUrl } = req.body;
    const inquiry = await prisma.inquiry.create({
      data: { name, email, phone, subject: subject || 'New Message', message, logoUrl }
    });
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error sending inquiry' });
  }
};

// Webhook for receiving incoming emails (e.g., from Mailgun or Sendgrid Inbound)
export const receiveEmailWebhook = async (req: Request, res: Response) => {
    try {
        // Standard format for most inbound email services
        const { sender, recipient, subject, 'body-plain': message, from } = req.body;

        await prisma.inquiry.create({
            data: {
                name: from || sender.split('<')[0].trim() || 'Email User',
                email: sender || from,
                phone: 'N/A',
                subject: subject || 'Inbound Email',
                message: message || 'Empty message body',
                status: 'NEW'
            }
        });

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Error processing email');
    }
};

export const replyToInquiry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;

        const inquiry = await prisma.inquiry.findUnique({ where: { id: id as string } });
        if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

        // 1. Send Email
        await transporter.sendMail({
            from: `"Estilo-co" <contact@estilo-co.ma>`,
            to: inquiry.email,
            subject: `Re: ${inquiry.subject}`,
            text: replyMessage,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Estilo-co Support</h2>
                    <p>${replyMessage.replace(/\n/g, '<br>')}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">Original Message from ${inquiry.name}:<br><em>${inquiry.message}</em></p>
                </div>
            `
        });

        // 2. Update Status
        await prisma.inquiry.update({
            where: { id: id as string },
            data: { status: 'REPLIED' }
        });

        res.json({ message: 'Reply sent successfully' });
    } catch (error: any) {
        console.error('Reply Error:', error);
        res.status(500).json({ message: 'Failed to send email: ' + error.message });
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
      where: { id: id as string },
      data: { status: status as string }
    });
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating inquiry' });
  }
};

export const deleteInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.inquiry.delete({
      where: { id: id as string }
    });
    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inquiry' });
  }
};
