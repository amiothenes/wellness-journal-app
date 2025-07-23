import { Router } from 'express';
import * as suggestionsController from '../controllers/suggestionsController';

const router = Router();

router.get('/', suggestionsController.getAllEntries);
router.post('/', suggestionsController.createEntry);
router.delete('/:id', suggestionsController.deleteEntry);

export default router;