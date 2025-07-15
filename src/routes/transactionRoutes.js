import express from 'express';
import auth from '../middleware/auth.js';
import { getTransactionsByUserId } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/:userId', auth, getTransactionsByUserId);

export default router;
