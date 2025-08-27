import { Router } from 'express';
import * as journalController from '../controllers/journalController';

const router = Router();

router.get('/entries', journalController.getAllEntries);
router.get('/entries/today',journalController.getTodaysEntry);
router.get('/entries/:entryId/paragraphs', journalController.getAllParagraphs);
router.post('/', journalController.createEntry);
router.post('/entries/:entryId/paragraphs',journalController.createParagraph);
router.post('/ai-response/generate', journalController.generateAIResponseText); 
router.post('/ai-response', journalController.createAIResponse);
router.delete('/entries/:entryId', journalController.deleteEntry);
router.delete('/paragraphs/:paragraphId', journalController.deleteParagraph);

export default router;