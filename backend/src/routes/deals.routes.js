import { Router } from 'express';
import {
  listDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  moveStage,
  dealSchema,
  stageSchema,
} from '../controllers/deals.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', listDeals);
router.get('/:id', getDeal);
router.post('/', validate(dealSchema), createDeal);
router.put('/:id', validate(dealSchema), updateDeal);
router.delete('/:id', authorize('ADMIN'), deleteDeal);
router.patch('/:id/stage', validate(stageSchema), moveStage);

export default router;
