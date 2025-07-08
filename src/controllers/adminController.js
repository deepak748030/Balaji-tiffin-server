import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Order from '../models/Order.js';
import Tiffin from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';

// ✅ Get all users
export const getAllUsers = async (req, res) => {
    try {
        // Fetch users
        const users = await User.find().select('-otp -__v');

        // Fetch wallets
        const wallets = await Wallet.find();
        const walletMap = {};
        wallets.forEach(w => {
            walletMap[w.user.toString()] = w.balance;
        });

        // Merge wallet balance into each user
        const usersWithWallet = users.map(user => {
            const balance = walletMap[user._id.toString()] || 0;
            return {
                ...user.toObject(),
                walletBalance: balance
            };
        });

        return sendResponse(res, 200, true, 'Users with wallet balances fetched successfully', usersWithWallet);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error fetching users and wallets', err.message);
    }
};
// ✅ Admin adds balance to any user’s wallet
export const adminAddBalance = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId || !amount || Number(amount) <= 0) {
            return sendResponse(res, 400, false, 'Invalid input');
        }

        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) return sendResponse(res, 404, false, 'Wallet not found');

        wallet.balance += Number(amount);
        await wallet.save();

        return sendResponse(res, 200, true, 'Balance added successfully', wallet);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error adding balance', err.message);
    }
};

// ✅ Get all orders with user & tiffin info
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'fullName phone')
            .populate('tiffin', 'name price')
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error fetching orders', err.message);
    }
};

// ✅ Mark an order as delivered
export const markOrderDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order || order.status === 'delivered') {
            return sendResponse(res, 400, false, 'Invalid or already delivered order');
        }

        if (order.status === 'cancelled' || order.status === 'paused') {
            return sendResponse(res, 400, false, 'Cannot deliver a cancelled or paused order');
        }

        const wallet = await Wallet.findOne({ user: order.user });
        const tiffin = await Tiffin.findById(order.tiffin);

        if (!wallet || wallet.balance < tiffin.price) {
            return sendResponse(res, 400, false, 'Insufficient balance in wallet');
        }

        wallet.balance -= tiffin.price;
        order.status = 'delivered';
        await Promise.all([wallet.save(), order.save()]);

        return sendResponse(res, 200, true, 'Order delivered and wallet updated', order);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error delivering order', err.message);
    }
};

// ✅ Cancel order
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) return sendResponse(res, 404, false, 'Order not found');

        if (order.status !== 'pending') {
            return sendResponse(res, 400, false, `Cannot cancel an order with status "${order.status}"`);
        }

        order.status = 'cancelled';
        await order.save();

        return sendResponse(res, 200, true, 'Order cancelled successfully', order);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error cancelling order', err.message);
    }
};
