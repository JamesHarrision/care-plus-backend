import { Router } from "express";
import { requireAuth, requireFamilyContext } from "../middlewares/auth.middleware";
import { healthRecordController } from "../controllers/health-record.controller";

const router = Router({ mergeParams: true });

router.get('/', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), healthRecordController.getHealthRecords);
router.post('/', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), healthRecordController.createHealthRecord);
router.patch('/:recordId', requireAuth, requireFamilyContext(['OWNER', 'MEMBER']), healthRecordController.updateHealthRecord);
router.delete('/:recordId', requireAuth, requireFamilyContext(['OWNER']), healthRecordController.deleteHealthRecord);

export default router