import cron from 'node-cron';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import Tiffin from '../models/Tiffin.js';

export const init = () => {
  // Daily check at 00:05
  cron.schedule('5 0 * * *', async () => {
    const today = new Date().toISOString().split('T')[0];
    const orders = await Order.find({ delivered: false });
    for (let o of orders) {
      if (new Date(o.deliveryDate).toISOString().split('T')[0] === today) {
        const wallet = await Wallet.findOne({ user: o.user });
        const t = await Tiffin.findById(o.tiffin);
        if (wallet.balance >= t.price) {
          wallet.balance -= t.price;
          o.delivered = true;
          await Promise.all([wallet.save(), o.save()]);
          console.log(`Order ${o._id} delivered and payment deducted`);
        } else {
          console.log(`Low balance for user ${o.user} on order ${o._id}`);
        }
      }
    }
  });
};
