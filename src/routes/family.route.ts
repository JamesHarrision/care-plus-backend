import { Router } from "express";
import { FamilyController } from "../controllers/familyController";
import { requireAuth, requireFamilyContext, requireSystemRole } from "../middlewares/auth.middleware";

const router = Router();
const familyController = new FamilyController();

router.post("/", requireAuth, familyController.createFamily);

router.post("/join", requireAuth, familyController.joinFamily);

router.post('/:familyId/generate-invite',
  requireAuth,
  requireFamilyContext(["OWNER"]),
  familyController.generateInvite
);

router.get("/:familyId/pending-members",
  requireAuth,
  requireFamilyContext(["OWNER"]),
  familyController.getPendingMember
)

router.patch("/:familyId/members/:memberId/status",
  requireAuth,
  requireFamilyContext(["OWNER"]),
  familyController.reviewJoinRequest
)

export default router;