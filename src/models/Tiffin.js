import mongoose from 'mongoose';

const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TiffinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['tiffin', 'thali'],
    default: 'tiffin'
  },
  description: String,
  image: String,
  price: { type: Number, required: true },
  availableSlots: {
    type: [String],
    enum: ['morning', 'evening'],
    default: ['morning', 'evening'],
    validate: {
      validator: function (v) {
        return this.type === 'tiffin' || v.length === 0;
      },
      message: 'availableSlots should only be used if type is tiffin.'
    }
  },
  availableDays: {
    type: [String],
    enum: allDays,
    default: allDays,
    validate: {
      validator: function (v) {
        return this.type === 'tiffin' || v.length === 0;
      },
      message: 'availableDays should only be used if type is tiffin.'
    }
  }
}, { timestamps: true });

export default mongoose.model('Tiffin', TiffinSchema);
