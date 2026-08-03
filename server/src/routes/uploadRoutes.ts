import { Router } from 'express';
import upload from '../middlewares/upload';

const router = Router();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return relative path instead of absolute localhost URL
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Error processing image' });
  }
});

export default router;
