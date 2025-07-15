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
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'cancelled', 'paused'], // ✅ Added 'cancelled' status
    default: 'pending'
  },
  extraRoti: {
    type: Number,
    default: 0, // ✅ Default to 0 if not added
    min: 0
  },
  TotalPrice: {
    type: Number,
    required: true
  }, tiffinId: {
    type: Number
  },
}, {
  timestamps: true
});

// ✅ Avoid OverwriteModelError in dev environments
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
