import express from 'express';
import auth from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    getAllUsers,
    adminAddBalance,
    getAllOrders,
    markOrderDelivered,
    cancelOrder
} from '../controllers/adminController.js';

const router = express.Router();

// 🔒 All admin routes must be protected and admin-only
// router.use(auth, isAdmin);

router.get('/users', getAllUsers); // ✅ Get all users with wallet balance

router.post('/wallet/top-up', adminAddBalance); // ✅ Admin adds balance to user's wallet

router.get('/orders', getAllOrders); // ✅ Get all orders (with user & tiffin info)

router.patch('/orders/:orderId/deliver', markOrderDelivered); // ✅ PATCH used for marking delivered

router.patch('/orders/:orderId/cancel', cancelOrder); // ✅ PATCH used for cancel order

export default router;
