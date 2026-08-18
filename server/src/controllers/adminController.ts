import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';

export const syncDatabase = async (req: Request, res: Response) => {
    try {
        console.log('📡 Starting Database Sync (npx prisma db push)...');

        exec('npx prisma db push', (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Prisma Sync Error: ${error.message}`);
                return res.status(500).json({ message: 'Sync failed', details: error.message });
            }
            if (stderr) {
                console.log(`⚠️ Prisma Sync Stderr: ${stderr}`);
            }
            console.log(`✅ Prisma Sync Success: ${stdout}`);
            res.json({ message: 'Database synced successfully', output: stdout });
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error during sync', error: error.message });
    }
};
