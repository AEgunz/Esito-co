import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env at the very beginning
dotenv.config();

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import uploadRoutes from './routes/uploadRoutes';
import orderRoutes from './routes/orderRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import templateRoutes from './routes/templateRoutes';
import reviewRoutes from './routes/reviewRoutes';
import ameexRoutes from './routes/ameexRoutes';
import couponRoutes from './routes/couponRoutes';

const app = express();

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ameex', ameexRoutes);
app.use('/api/coupons', couponRoutes);

app.get('/', (req, res) => {
  res.send('Estilo-co API is running v2');
});

export default app;
