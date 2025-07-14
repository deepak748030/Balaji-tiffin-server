import express from 'express';
import { createPincode, listPincodes, deletePincode } from '../controllers/pincodeController.js';
import auth from '../middleware/auth.js'; // Optional — use if you want only logged-in users to access

const router = express.Router();



export default router;
