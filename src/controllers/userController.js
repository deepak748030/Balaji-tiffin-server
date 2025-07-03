import UserModel from '../models/User.js';
import WalletModel from '../models/Wallet.js';

export const updateProfile = async (req, res) => {
  const { name, email, address } = req.body;
  const user = await UserModel.findByIdAndUpdate(req.user.id, { name, email, address }, { new: true });
  res.json(user);
};

export const topUp = async (req, res) => {
  const { amount } = req.body;
  const wallet = await WalletModel.findOne({ user: req.user.id });
  wallet.balance += Number(amount);
  await wallet.save();
  res.json(wallet);
};

export const getWallet = async (req, res) => {
  const wallet = await WalletModel.findOne({ user: req.user.id });
  res.json(wallet);
};
