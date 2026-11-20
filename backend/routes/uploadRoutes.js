import express from 'express';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    file: {
      name: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    }
  });
});

export default router;
