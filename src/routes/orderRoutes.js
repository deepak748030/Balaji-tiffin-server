import express from 'express';
import auth from '../middleware/auth.js';
import { createOrder, deliverOrder, pauseOrder, getOrdersByUserId, cancelOrder } from '../controllers/orderController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tiffinId, days, slot]
 *             properties:
 *               tiffinId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *                 description: ID of the tiffin
 *               days:
 *                 type: number
 *                 example: 7
 *                 description: Number of days for the order
 *               slot:
 *                 type: string
 *                 enum: ['morning', 'evening', 'both']
 *                 example: "morning"
 *                 description: Delivery slot
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: string
 *                   tiffin:
 *                     type: string
 *                   deliveryDate:
 *                     type: string
 *                     format: date
 *                   slot:
 *                     type: string
 *                   delivered:
 *                     type: boolean
 *                   paused:
 *                     type: boolean
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, createOrder);

/**
 * @swagger
 * /api/orders/{id}/deliver:
 *   put:
 *     summary: Deliver an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order delivered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Order delivered"
 *       400:
 *         description: Invalid order or insufficient balance
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.put('/:id/deliver', auth, deliverOrder);

/**
 * @swagger
 * /api/orders/pause:
 *   put:
 *     summary: Pause a specific order and extend subscription by one day
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, orderId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *                 description: ID of the user
 *               orderId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c86"
 *                 description: ID of the order to pause
 *     responses:
 *       200:
 *         description: Order paused and subscription extended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Order paused, subscription extended by 1 day for this tiffin"
 *       400:
 *         description: Invalid order or user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Unauthorized access to user’s order
 *       404:
 *         description: Order not found
 */
router.put('/pause', auth, pauseOrder);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of orders for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: string
 *                   tiffin:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                   deliveryDate:
 *                     type: string
 *                     format: date
 *                   slot:
 *                     type: string
 *                   delivered:
 *                     type: boolean
 *                   paused:
 *                     type: boolean
 *       400:
 *         description: Invalid userId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Unauthorized access to user’s orders
 *       404:
 *         description: No orders found for this user
 */
router.get('/user/:userId', auth, getOrdersByUserId);


/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order cancelled successfully"
 *       400:
 *         description: Cannot cancel delivered/cancelled order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the order owner
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', auth, cancelOrder);



export default router;