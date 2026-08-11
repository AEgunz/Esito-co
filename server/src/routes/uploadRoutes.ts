import { Router } from 'express';
import upload from '../middlewares/upload';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = Router();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `image-${uniqueSuffix}.webp`;
    const outputPath = path.join(process.cwd(), 'uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process image: Resize to max 1200px width/height and convert to webp (compressed)
    await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 }) // 80% quality is a good balance
      .toFile(outputPath);

    // Return relative path
    const url = `/uploads/${filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Image Processing Error:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
});

export default router;
