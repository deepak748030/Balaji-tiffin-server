import express from 'express';
import { createPincode, listPincodes, deletePincode } from '../controllers/pincodeController.js';
import auth from '../middleware/auth.js'; // Optional — use if you want only logged-in users to access

const router = express.Router();

router.post('/', auth, createPincode);       // POST /api/pincodes
router.get('/', listPincodes);               // GET  /api/pincodes
router.delete('/:id', auth, deletePincode);  // DELETE /api/pincodes/:id

export default router;
