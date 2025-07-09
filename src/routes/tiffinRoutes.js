import express from 'express';
import auth from '../middleware/auth.js';
import multer from '../middleware/multer.js';
import { createTiffin, deleteTiffin, listTiffins, updateTiffin } from '../controllers/tiffinController.js';

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
 *     summary: Get all tiffins
 *     tags: [Tiffins]
 *     responses:
 *       200:
 *         description: List of all tiffins
 */

/**
 * @swagger
 * /api/tiffins:
 *   post:
 *     summary: Create a new tiffin or thali
 *     tags: [Tiffins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/TiffinInput'
 *     responses:
 *       201:
 *         description: Tiffin created successfully
 *       500:
 *         description: Error while creating
 */
router.get('/', listTiffins);
router.post('/', auth, multer.single('image'), createTiffin);

/**
 * @swagger
 * /api/tiffins/{id}:
 *   delete:
 *     summary: Delete a tiffin by ID
 *     tags: [Tiffins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tiffin ID to delete
 *     responses:
 *       200:
 *         description: Tiffin deleted successfully
 *       404:
 *         description: Tiffin not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, deleteTiffin);


/**
 * @swagger
 * /api/tiffins/{id}:
 *   patch:
 *     summary: Update a tiffin by ID
 *     tags: [Tiffins]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tiffin ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Tiffin Name"
 *               price:
 *                 type: number
 *                 example: 150
 *               type:
 *                 type: string
 *                 enum: [tiffin, thali]
 *                 example: tiffin
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Tiffin updated successfully
 *       404:
 *         description: Tiffin not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', auth, multer.single('image'), updateTiffin);



export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     TiffinInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Healthy Veg Tiffin"
 *         description:
 *           type: string
 *           example: "A balanced vegetarian meal for lunch"
 *         price:
 *           type: number
 *           example: 100
 *         type:
 *           type: string
 *           enum: [tiffin, thali]
 *           default: tiffin
 *         image:
 *           type: string
 *           format: binary
 *         availableSlots:
 *           type: string
 *           example: "morning,evening"
 *         availableDays:
 *           type: string
 *           example: "Monday,Tuesday,Wednesday"
 */

