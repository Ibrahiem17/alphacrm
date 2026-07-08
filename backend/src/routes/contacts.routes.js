import { Router } from 'express';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  contactSchema,
} from '../controllers/contacts.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', listContacts);
router.get('/:id', getContact);
router.post('/', validate(contactSchema), createContact);
router.put('/:id', validate(contactSchema), updateContact);
router.delete('/:id', authorize('ADMIN'), deleteContact);

export default router;
