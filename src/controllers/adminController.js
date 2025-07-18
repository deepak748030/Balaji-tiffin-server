import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Order from '../models/Order.js';
import Tiffin from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';
import AdminSettings from '../models/AdminSettings.js';
import Transaction from '../models/Transaction.js';

export const getAllUsers = async (req, res) => {
    try {
        // Fetch users
        const users = await User.find().select('-otp -__v');

        // Fetch wallets and map by userId string
        const wallets = await Wallet.find();
        const walletMap = new Map();
        wallets.forEach(w => {
            walletMap.set(w.user.toString(), w.balance);
        });

        // Merge wallet balance into each user object
        const usersWithWallet = users.map(user => {
            return {
                ...user.toObject(),
                walletBalance: walletMap.get(user._id.toString()) || 0
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

        // ✅ Validate inputs
        if (!userId || isNaN(amount) || Number(amount) <= 0) {
            return sendResponse(res, 400, false, 'Invalid input');
        }

        // ✅ Find or create wallet
        let wallet = await Wallet.findOne({ user: userId });

        if (!wallet) {
            // Create new wallet if not found
            wallet = new Wallet({
                user: userId,
                balance: Number(amount)
            });
        } else {
            // Update existing balance
            wallet.balance += Number(amount);
        }

        await wallet.save();

        // ✅ Create transaction for credit
        await Transaction.create({
            user: userId,
            amount: Number(amount),
            type: 'credit',
            message: `Admin added ₹${amount} to wallet`
        });

        return sendResponse(res, 200, true, 'Balance added successfully', wallet);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error adding balance', err.message);
    }
};


// ✅ Get all orders with user & tiffin info
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name phone address')
            .populate('tiffin', 'name price type')
            .sort({ createdAt: -1 });

        return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error fetching orders', err.message);
    }
};


// ✅ Mark an order as delivered and create a transaction

export const markOrderDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return sendResponse(res, 404, false, 'Order not found');
        }

        if (order.status === 'delivered') {
            return sendResponse(res, 400, false, 'Order already delivered');
        }

        if (order.status === 'cancelled' || order.status === 'paused') {
            return sendResponse(res, 400, false, 'Cannot deliver a cancelled or paused order');
        }

        const tiffin = await Tiffin.findById(order.tiffin);
        if (!tiffin) {
            return sendResponse(res, 404, false, 'Tiffin not found');
        }

        const wallet = await Wallet.findOne({ user: order.user });
        if (!wallet) {
            return sendResponse(res, 404, false, 'Wallet not found');
        }

        if (wallet.balance < tiffin.price) {
            return sendResponse(res, 400, false, `Insufficient balance. ₹${tiffin.price} required, but you have ₹${wallet.balance}`);
        }

        // Deduct only the amount of this single tiffin
        wallet.balance -= tiffin.price;
        order.status = 'delivered';

        // Create transaction for deduction
        await Promise.all([
            wallet.save(),
            order.save(),
            Transaction.create({
                user: order.user,
                amount: tiffin.price,
                type: 'deduct',
                message: `Order #${order._id} delivered. Deducted ₹${tiffin.price} for tiffin.`
            })
        ]);

        return sendResponse(res, 200, true, 'Order marked as delivered, wallet updated, transaction created', order);
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

        // Create a transaction with amount 0 for cancellation
        await Transaction.create({
            user: order.user,
            amount: 0,
            type: 'cancel',
            message: `Order #${order._id} cancelled by admin.`
        });

        return sendResponse(res, 200, true, 'Order cancelled successfully', order);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error cancelling order', err.message);
    }
};

// ✅ Admin manually creates user (and wallet)
export const adminCreateUser = async (req, res) => {
    try {
        const { phone, name, email, address, pincode, isRegular, role } = req.body;

        if (!phone) {
            return sendResponse(res, 400, false, 'Phone number is required');
        }

        const existing = await User.findOne({ phone });
        if (existing) {
            return sendResponse(res, 400, false, 'User with this phone already exists');
        }

        const user = await User.create({
            phone,
            name,
            email,
            address,
            pincode,
            isRegular: !!isRegular,
            role: role === 'admin' ? 'admin' : 'user'

        });

        // 🔄 Create wallet
        await Wallet.create({ user: user._id });

        return sendResponse(res, 201, true, 'User created successfully', user);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error creating user', err.message);
    }
};

export const toggleIsRegular = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return sendResponse(res, 404, false, 'User not found');

        user.isRegular = !user.isRegular;
        await user.save();

        return sendResponse(res, 200, true, `User isRegular updated to ${user.isRegular}`, user);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error toggling isRegular', err.message);
    }
};

export const updateRotiPrice = async (req, res) => {
    try {
        const { rotiPrice } = req.body;

        if (typeof rotiPrice !== 'number' || rotiPrice < 0) {
            return sendResponse(res, 400, false, 'Invalid roti price');
        }

        const settings = await AdminSettings.findOneAndUpdate(
            {},
            { rotiPrice },
            { upsert: true, new: true }
        );

        return sendResponse(res, 200, true, 'Roti price updated', settings);
    } catch (err) {
        return sendResponse(res, 500, false, 'Error updating roti price', err.message);
    }
};

// GET /api/admin/settings/roti-price
export const getRotiPrice = async (req, res) => {
    try {
        const settings = await AdminSettings.findOne();
        const rotiPrice = settings?.rotiPrice ?? 0;

        return sendResponse(res, 200, true, 'Roti price fetched', { rotiPrice });
    } catch (err) {
        return sendResponse(res, 500, false, 'Error fetching roti price', err.message);
    }
};