import { Router } from 'express';
import { createMedicationSchedule } from '../controllers/medication.controller';
import { requireAuth, requireFamilyContext } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, requireFamilyContext(["OWNER", "MEMBER"]), createMedicationSchedule);

export default router;
