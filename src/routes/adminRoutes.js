import express from 'express';
import auth from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    getAllUsers,
    adminAddBalance,
    getAllOrders,
    markOrderDelivered,
    cancelOrder,
    toggleIsRegular,
    adminCreateUser,
    updateRotiPrice,
    getRotiPrice
} from '../controllers/adminController.js';
import { createPincode, deletePincode, listPincodes } from '../controllers/pincodeController.js';

const router = express.Router();

// 🔒 All admin routes must be protected and admin-only
router.use(auth, isAdmin);

router.get('/users', getAllUsers); // ✅ Get all users with wallet balance

router.post('/wallet/top-up', adminAddBalance); // ✅ Admin adds balance to user's wallet

router.get('/orders', getAllOrders); // ✅ Get all orders (with user & tiffin info)

router.patch('/orders/:orderId/deliver', markOrderDelivered); // ✅ PATCH used for marking delivered

router.patch('/orders/:orderId/cancel', cancelOrder); // ✅ PATCH used for cancel order

// Admin creates a user manually
router.post('/users', adminCreateUser);

// Admin toggles isRegular flag
router.patch('/users/:userId/toggle-regular', toggleIsRegular);

router.post('/pincode/', createPincode);       // POST /api/pincodes
router.get('/pincode/', listPincodes);               // GET  /api/pincodes
router.delete('/pincode/:id', deletePincode);  // DELETE /api/pincodes/:id


// 🔧 Roti price settings
router.patch('/settings/roti-price', updateRotiPrice); // Update price
router.get('/settings/roti-price', getRotiPrice);      // Get current price

export default router;
