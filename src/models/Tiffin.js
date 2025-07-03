import mongoose from 'mongoose';

const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TiffinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  price: { type: Number, required: true },
  availableSlots: { type: [String], enum: ['morning', 'evening'], default: ['morning', 'evening'] },
  availableDays: { type: [String], enum: allDays, default: allDays }
}, { timestamps: true });

export default mongoose.model('Tiffin', TiffinSchema);
