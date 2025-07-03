import UserModel from '../models/User.js';
import WalletModel from '../models/Wallet.js';

export const updateProfile = async (req, res) => {
  const { name, email, address } = req.body;
  const user = await UserModel.findByIdAndUpdate(req.user.id, { name, email, address }, { new: true });
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
};

export const topUp = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ msg: 'Invalid amount' });
  const wallet = await WalletModel.findOne({ user: req.user.id });
  if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });
  wallet.balance += Number(amount);
  await wallet.save();
  res.json(wallet);
};

export const getWallet = async (req, res) => {
  const wallet = await WalletModel.findOne({ user: req.user.id });
  if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });
  res.json(wallet);
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ msg: 'userId required' });

  // Ensure authenticated user matches userId or is admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const user = await UserModel.findById(userId).select('-otp -__v');
  if (!user) return res.status(404).json({ msg: 'User not found' });

  res.json({
    phone: user.phone,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
};