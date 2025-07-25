import { Router } from 'express';
import * as moodController from '../controllers/moodController';

const router = Router();

router.get('/', moodController.getEntries);

export default router;