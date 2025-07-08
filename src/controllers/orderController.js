import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import Tiffin from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';

export const createOrder = async (req, res) => {
  try {
    const { tiffinId, days, slot } = req.body;
    const userId = req.user.id;

    const tiffin = await Tiffin.findById(tiffinId);
    if (!tiffin) return sendResponse(res, 404, false, 'Tiffin not found');

    const totalDays = Number(days || 1);
    const orders = [];

    if (tiffin.type === 'tiffin') {
      for (let i = 0; i < totalDays; i++) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + i);

        if (slot === 'both') {
          orders.push(
            { user: userId, tiffin: tiffinId, deliveryDate, slot: 'morning' },
            { user: userId, tiffin: tiffinId, deliveryDate, slot: 'evening' }
          );
        } else {
          orders.push({ user: userId, tiffin: tiffinId, deliveryDate, slot });
        }
      }
    } else if (tiffin.type === 'thali') {
      const today = new Date();
      orders.push({
        user: userId,
        tiffin: tiffinId,
        deliveryDate: today,
        slot: ''
      });
    }

    const createdOrders = await Order.insertMany(orders);
    return sendResponse(res, 201, true, 'Order(s) created successfully', createdOrders);
  } catch (error) {
    return sendResponse(res, 500, false, 'Error creating order(s)', error.message);
  }
};


export const deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order || order.delivered) {
      return sendResponse(res, 400, false, 'Invalid or already delivered order');
    }

    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Only admin can deliver orders');
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
  } catch (error) {
    return sendResponse(res, 500, false, 'Error delivering order', error.message);
  }
};


export const pauseOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Unauthorized');
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return sendResponse(res, 404, false, 'Order not found');
    if (order.delivered) return sendResponse(res, 400, false, 'Cannot pause a delivered order');
    if (order.paused) return sendResponse(res, 200, true, 'Order already paused');

    order.paused = true;
    await order.save();

    // find the last valid (undelivered and unpaused) order of the same tiffin and slot
    const last = await Order.findOne({
      user: userId,
      tiffin: order.tiffin,
      slot: order.slot,
      delivered: false,
      paused: false
    }).sort({ deliveryDate: -1 });

    const newDate = new Date(last?.deliveryDate || new Date());
    newDate.setDate(newDate.getDate() + 1);

    const newOrder = await Order.create({
      user: userId,
      tiffin: order.tiffin,
      deliveryDate: newDate,
      slot: order.slot
    });

    return sendResponse(res, 200, true, 'Order paused. Extra day added', newOrder);
  } catch (error) {
    return sendResponse(res, 500, false, 'Error pausing order', error.message);
  }
};


export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Unauthorized');
    }

    const orders = await Order.find({ user: userId })
      .populate('tiffin', 'name price type')
      .sort({ deliveryDate: 1 });

    if (!orders || orders.length === 0) {
      return sendResponse(res, 404, false, 'No orders found');
    }

    return sendResponse(res, 200, true, 'Orders fetched successfully', orders);
  } catch (error) {
    return sendResponse(res, 500, false, 'Error fetching orders', error.message);
  }
};
