import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  tiffin: { type: mongoose.Types.ObjectId, ref: 'Tiffin', required: true },
  deliveryDate: { type: Date, required: true },
  slot: { type: String, enum: ['morning', 'evening'], required: true },
  delivered: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
