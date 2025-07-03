import express from 'express';
import auth from '../middleware/auth.js';
import multer from '../middleware/multer.js';
import { createTiffin, listTiffins } from '../controllers/tiffinController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tiffins
 *   description: Tiffin management endpoints
 */

/**
 * @swagger
 * /api/tiffins:
 *   get:
 *     summary: List all tiffins
 *     tags: [Tiffins]
 *     responses:
 *       200:
 *         description: List of tiffins
 */
router.get('/', listTiffins);

/**
 * @swagger
 * /api/tiffins:
 *   post:
 *     summary: Create a new tiffin
 *     tags: [Tiffins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Veg Tiffin"
 *               description:
 *                 type: string
 *                 example: "Delicious vegetarian tiffin"
 *               price:
 *                 type: number
 *                 example: 50
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Tiffin created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, multer.single('image'), createTiffin);

export default router;