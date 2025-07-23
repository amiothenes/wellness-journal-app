import { Router } from 'express';
import * as journalController from '../controllers/journalController';

const router = Router();

router.get('/', journalController.getAllEntries);
router.post('/', journalController.createEntry);
router.delete('/:id', journalController.deleteEntry);

export default router;