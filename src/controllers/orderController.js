import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import Tiffin from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';
import Transaction from '../models/Transaction.js';
import AdminSettings from '../models/AdminSettings.js';
import Pincode from '../models/Pincode.js';
import User from '../models/User.js';

export const createOrder = async (req, res) => {
  try {
    const { tiffinId, days, slot, extraRoti = 0 } = req.body;
    const userId = req.user.id;

    // ✅ Get user
    const user = await User.findById(userId);
    if (!user) return sendResponse(res, 404, false, 'User not found');

    // ✅ Check if pincode is available
    if (!user.pincode) {
      return sendResponse(res, 400, false, 'Pincode not set for user');
    }

    // ✅ Validate pincode delivery availability
    const pincodeExists = await Pincode.findOne({ pincode: user.pincode });
    if (!pincodeExists) {
      return sendResponse(res, 400, false, 'Delivery not available in your area');
    }

    // ✅ Get tiffin
    const tiffin = await Tiffin.findById(tiffinId);
    if (!tiffin) return sendResponse(res, 404, false, 'Tiffin not found');

    // ✅ Get wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return sendResponse(res, 404, false, 'Wallet not found');

    // ✅ Get admin settings (roti price)
    const settings = await AdminSettings.findOne();
    const rotiPrice = settings?.rotiPrice || 5;

    const totalDays = Number(days || 1);
    const rotiCount = Number(extraRoti || 0);
    const orders = [];
    let estimatedOrderCount = 0;

    // ✅ For tiffin: generate global tiffinId
    let globalTiffinId = null;
    if (tiffin.type === 'tiffin') {
      const lastOrder = await Order.findOne().sort({ tiffinId: -1 }); // GLOBAL
      globalTiffinId = lastOrder?.tiffinId ? lastOrder.tiffinId + 1 : 1;
    }

    if (tiffin.type === 'tiffin') {
      for (let i = 0; i < totalDays; i++) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + i);
        const basePrice = tiffin.price + rotiCount * rotiPrice;

        if (slot === 'both') {
          estimatedOrderCount += 2;
          orders.push(
            {
              user: userId,
              tiffin: tiffinId,
              deliveryDate,
              slot: 'morning',
              extraRoti: rotiCount,
              TotalPrice: basePrice,
              tiffinId: globalTiffinId
            },
            {
              user: userId,
              tiffin: tiffinId,
              deliveryDate,
              slot: 'evening',
              extraRoti: rotiCount,
              TotalPrice: basePrice,
              tiffinId: globalTiffinId
            }
          );
        } else {
          estimatedOrderCount += 1;
          orders.push({
            user: userId,
            tiffin: tiffinId,
            deliveryDate,
            slot,
            extraRoti: rotiCount,
            TotalPrice: basePrice,
            tiffinId: globalTiffinId
          });
        }
      }
    } else if (tiffin.type === 'thali') {
      estimatedOrderCount = 1;
      const today = new Date();
      const basePrice = tiffin.price + rotiCount * rotiPrice;

      // No tiffinId for thali
      orders.push({
        user: userId,
        tiffin: tiffinId,
        deliveryDate: today,
        extraRoti: rotiCount,
        TotalPrice: basePrice
      });
    }

    const totalCost = estimatedOrderCount * (tiffin.price + rotiCount * rotiPrice);

    // ✅ Check wallet balance (only for non-regular users)
    if (!user.isRegular && wallet.balance < totalCost) {
      return sendResponse(
        res,
        400,
        false,
        `Insufficient wallet balance. Need ₹${totalCost}, but you have ₹${wallet.balance}`
      );
    }

    // ✅ Save orders
    const createdOrders = await Order.insertMany(orders);
    return sendResponse(res, 201, true, 'Order(s) created successfully', createdOrders);
  } catch (error) {
    console.error('Order Creation Error:', error);
    return sendResponse(res, 500, false, 'Error creating order(s)', error.message);
  }
};

export const deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order || order.status === 'delivered') {
      return sendResponse(res, 400, false, 'Invalid or already delivered order');
    }

    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Only admin can deliver orders');
    }

    const [wallet, tiffin, user] = await Promise.all([
      Wallet.findOne({ user: order.user }),
      Tiffin.findById(order.tiffin),
      User.findById(order.user)
    ]);

    if (!wallet || !tiffin || !user) {
      return sendResponse(res, 404, false, 'Wallet, Tiffin, or User not found');
    }

    // ✅ Only allow negative balance if isRegular
    if (!user.isRegular && wallet.balance < tiffin.price) {
      return sendResponse(res, 400, false, 'Insufficient balance in wallet');
    }

    // ✅ Deduct price (can go negative if isRegular)
    wallet.balance -= tiffin.price;
    order.status = 'delivered';

    await Promise.all([wallet.save(), order.save()]);

    // ✅ Log transaction
    await Transaction.create({
      user: user._id,
      amount: tiffin.price,
      type: 'deduct',
      message: `Tiffin delivered on ${order.deliveryDate.toDateString()} (${order.slot || 'default'})`
    });

    return sendResponse(res, 200, true, 'Order delivered, wallet deducted, transaction recorded');
  } catch (error) {
    return sendResponse(res, 500, false, 'Error delivering order', error.message);
  }
};



export const pauseOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    // Only the user or an admin can pause the order
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Unauthorized');
    }

    const order = await Order.findOne({ _id: orderId, user: userId }).populate('tiffin');
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // ✅ Only tiffin-type orders can be paused
    if (!order.tiffin || order.tiffin.type !== 'tiffin') {
      return sendResponse(res, 400, false, 'Only tiffin orders can be paused');
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return sendResponse(res, 400, false, 'Cannot pause a delivered or cancelled order');
    }

    if (order.status === 'paused') {
      return sendResponse(res, 200, true, 'Order already paused');
    }

    // ✅ Mark the current order as paused
    order.status = 'paused';
    await order.save();

    // ✅ Find last pending order with same tiffinId and slot
    const lastPending = await Order.findOne({
      user: userId,
      tiffinId: order.tiffinId,
      slot: order.slot
    }).sort({ deliveryDate: -1 });

    const newDate = new Date(lastPending ? lastPending.deliveryDate : new Date());
    newDate.setDate(newDate.getDate() + 1);

    // ✅ Find Tiffin again by tiffinId (in case populate was skipped or needed fresh)
    const tiffinDoc = await Tiffin.findOne({ _id: order.tiffin });

    if (!tiffinDoc) {
      return sendResponse(res, 404, false, 'Tiffin not found');
    }

    const newOrder = await Order.create({
      user: userId,
      tiffin: tiffinDoc._id,
      tiffinId: order.tiffinId,
      deliveryDate: newDate,
      slot: order.slot,
      extraRoti: order.extraRoti,
      TotalPrice: order.TotalPrice
    });
    // console.log(newOrder)
    return sendResponse(res, 200, true, 'Order paused. Extra day added.', newOrder);

  } catch (error) {
    return sendResponse(res, 500, false, 'Error pausing order', error.message);
  }
};


export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // optional type filter: 'tiffin' or 'thali'

    // ✅ Access control: only self or admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Unauthorized');
    }

    // ✅ Build query
    const query = { user: userId };

    if (type === 'tiffin' || type === 'thali') {
      // Get all tiffin IDs of the given type
      const tiffins = await Tiffin.find({ type }).select('_id');
      const tiffinIds = tiffins.map(t => t._id);
      query.tiffin = { $in: tiffinIds };
    }

    // ✅ Fetch and populate orders
    const orders = await Order.find(query)
      .populate('tiffin', 'name price type')
      .sort({ deliveryDate: 1 });

    if (!orders.length) {
      return sendResponse(res, 404, false, 'No orders found');
    }

    return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
  } catch (error) {
    return sendResponse(res, 500, false, 'Error fetching orders', error.message);
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Only the owner or an admin can cancel the order
    if (req.user.id !== order.user.toString() && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Unauthorized');
    }

    // Cannot cancel already delivered or cancelled order
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return sendResponse(res, 400, false, 'Order already delivered or cancelled');
    }

    order.status = 'cancelled';
    await order.save();

    return sendResponse(res, 200, true, 'Order cancelled successfully', order);
  } catch (error) {
    return sendResponse(res, 500, false, 'Error cancelling order', error.message);
  }
};
