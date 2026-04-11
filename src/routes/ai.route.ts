import { Router } from 'express';
import { scanPrescription } from '../controllers/prescription.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/scan-prescription', requireAuth, upload.single('image'), scanPrescription);

export default router;
