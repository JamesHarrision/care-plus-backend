import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

export const scanPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No image file provided' });
      return;
    }

    const { buffer, mimetype } = req.file;

    const result = await AIService.scanPrescription(buffer, mimetype);

    if (!result.isPrescription || !result.extracted || result.extracted.length === 0) {
      res.status(422).json({
        status: 'error',
        message: 'Không thể nhận diện toa thuốc từ ảnh'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        extracted: result.extracted,
        confidence: result.confidence
      }
    });
  } catch (error: any) {
    console.error('Scan Prescription Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
