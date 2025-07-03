import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import jwt from 'jsonwebtoken';

export const sendOtp = async (req, res) => {
  const { phone } = req.body;
  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone });
    await user.save();
    await new Wallet({ user: user._id }).save();
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  await user.save();
  console.log(`OTP for ${phone}: ${otp}`); // Replace with SMS service in production
  res.json({ msg: 'OTP sent' });
};

export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ phone, otp });
  if (!user) return res.status(400).json({ msg: 'Invalid OTP' });
  user.isVerified = true;
  user.otp = null;
  await user.save();
  const token = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
};
