import express from 'express';
import { getClients, createClient, updateClient } from '../controllers/clientController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getClients);
router.post('/', createClient);
router.put('/:id', updateClient);

export default router;
