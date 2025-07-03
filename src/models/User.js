import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: String,
  isVerified: { type: Boolean, default: false },
  name: String,
  email: String,
  address: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
