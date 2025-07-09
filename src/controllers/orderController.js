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
        deliveryDate: today
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
    if (!order || order.status === 'delivered') {
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
    order.status = 'delivered';

    await Promise.all([wallet.save(), order.save()]);
    return sendResponse(res, 200, true, 'Order delivered and wallet updated');
  } catch (error) {
    return sendResponse(res, 500, false, 'Error delivering order', error.message);
  }
};



export const pauseOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    // Allow pause if requester is the user or an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Unauthorized');
    }

    // Find the order by its id and the owner
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found');
    }

    // Cannot pause an order that is delivered or cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return sendResponse(res, 400, false, 'Cannot pause a delivered or cancelled order');
    }

    // If order is already paused, simply return a message
    if (order.status === 'paused') {
      return sendResponse(res, 200, true, 'Order already paused');
    }

    // Mark the current order as paused
    order.status = 'paused';
    await order.save();

    // Find the last pending order for the same tiffin and slot (if any)
    const lastPendingOrder = await Order.findOne({
      user: userId,
      tiffin: order.tiffin,
      slot: order.slot,
      status: 'pending'
    }).sort({ deliveryDate: -1 });

    // Determine the new delivery date (extend by 1 day from the last order, or use today if not found)
    const newDate = new Date(lastPendingOrder ? lastPendingOrder.deliveryDate : new Date());
    newDate.setDate(newDate.getDate() + 1);

    // Create a new order for the extended day (status defaults to 'pending')
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

