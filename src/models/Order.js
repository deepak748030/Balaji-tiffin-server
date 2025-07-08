// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tiffin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tiffin',
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  slot: {
    type: String,
    enum: ['morning', 'evening', 'both'], // ✅ now supports 'both'
    required: true
  },
  delivered: {
    type: Boolean,
    default: false
  },
  paused: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ✅ Avoid OverwriteModelError in dev environments
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
