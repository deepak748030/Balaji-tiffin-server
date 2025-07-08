import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Order from '../models/Order.js';
import Tiffin from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';
import mongoose from 'mongoose';

// ✅ Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-otp -__v');
        return sendResponse(res, 200, true, 'Users fetched successfully', users);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error fetching users', err.message);
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
        if (!order || order.delivered) {
            return sendResponse(res, 400, false, 'Invalid or already delivered order');
        }

        const wallet = await Wallet.findOne({ user: order.user });
        const tiffin = await Tiffin.findById(order.tiffin);

        if (!wallet || wallet.balance < tiffin.price) {
            return sendResponse(res, 400, false, 'Insufficient balance in wallet');
        }

        wallet.balance -= tiffin.price;
        order.delivered = true;
        await Promise.all([wallet.save(), order.save()]);

        return sendResponse(res, 200, true, 'Order delivered and wallet updated');
    } catch (err) {
        return sendResponse(res, 500, false, 'Error delivering order', err.message);
    }
};

// ✅ Cancel order (delete)
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        // Update order status to 'cancelled' without deleting the order
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status: 'cancelled' },
            { new: true }
        );
        if (!order) return sendResponse(res, 404, false, 'Order not found');

        return sendResponse(res, 200, true, 'Order cancelled successfully', order);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error cancelling order', err.message);
    }
};
