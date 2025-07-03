import OrderModel from '../models/Order.js';
import WalletModel from '../models/Wallet.js';
import TiffinModel from '../models/Tiffin.js';

export const createOrder = async (req, res) => {
  const { tiffinId, days, slot } = req.body;
  const userId = req.user.id; // Use authenticated user ID
  const daysNum = Number(days);
  const orders = [];
  for (let i = 0; i < daysNum; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    if (slot === 'both') {
      orders.push({ user: userId, tiffin: tiffinId, deliveryDate: date, slot: 'morning' });
      orders.push({ user: userId, tiffin: tiffinId, deliveryDate: date, slot: 'evening' });
    } else {
      orders.push({ user: userId, tiffin: tiffinId, deliveryDate: date, slot });
    }
  }
  const createdOrders = await OrderModel.insertMany(orders);
  res.json(createdOrders);
};

export const deliverOrder = async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order || order.delivered) return res.status(400).json({ msg: 'Invalid order' });
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access required' });
  const wallet = await WalletModel.findOne({ user: order.user });
  const tiffin = await TiffinModel.findById(order.tiffin);
  if (wallet.balance < tiffin.price) return res.status(400).json({ msg: 'Low balance' });
  wallet.balance -= tiffin.price;
  order.delivered = true;
  await Promise.all([wallet.save(), order.save()]);
  res.json({ msg: 'Order delivered' });
};


export const pauseOrder = async (req, res) => {
  const { userId, orderId } = req.body;
  if (!userId || !orderId) return res.status(400).json({ msg: 'userId and orderId required' });

  // Ensure authenticated user matches userId or is admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const order = await OrderModel.findOne({ _id: orderId, user: userId });
  if (!order) return res.status(404).json({ msg: 'Order not found' });
  if (order.delivered) return res.status(400).json({ msg: 'Cannot pause delivered order' });
  if (order.paused) return res.status(200).json({ msg: 'Order already paused' }); // Idempotent

  // Mark order as paused
  order.paused = true;
  await order.save();

  // Find the last undelivered, non-paused order for the same user and tiffin
  const lastOrder = await OrderModel.findOne({
    user: userId,
    tiffin: order.tiffin,
    delivered: false,
    paused: false,
  }).sort({ deliveryDate: -1 });

  // Extend subscription by adding one new order for the same tiffin and slot
  const newOrder = {
    user: userId,
    tiffin: order.tiffin,
    deliveryDate: new Date(),
    slot: order.slot,
  };

  // Set the delivery date to one day after the last order's delivery date, or tomorrow if no last order
  if (lastOrder) {
    newOrder.deliveryDate = new Date(lastOrder.deliveryDate);
    newOrder.deliveryDate.setDate(newOrder.deliveryDate.getDate() + 1);
  } else {
    newOrder.deliveryDate.setDate(newOrder.deliveryDate.getDate() + 1);
  }

  await OrderModel.create(newOrder);

  res.json({ msg: 'Order paused, subscription extended by 1 day for this tiffin' });
};


export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ msg: 'userId required' });

  // Ensure authenticated user matches userId or is admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const orders = await OrderModel.find({ user: userId })
    .populate('tiffin', 'name price')
    .sort({ deliveryDate: 1 });
  if (!orders || orders.length === 0) {
    return res.status(404).json({ msg: 'No orders found for this user' });
  }

  res.json(orders);
};