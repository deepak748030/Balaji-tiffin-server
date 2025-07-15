import UserModel from '../models/User.js';
import WalletModel from '../models/Wallet.js';
import { sendResponse } from '../utils/sendResponse.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, email, address, pincode } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { name, email, address, pincode },
      { new: true }
    );

    if (!user) return sendResponse(res, 404, false, 'User not found');

    return sendResponse(res, 200, true, 'Profile updated successfully', user);
  } catch (err) {
    return sendResponse(res, 500, false, 'Error updating profile', err.message);
  }
};


export const topUp = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return sendResponse(res, 400, false, 'Invalid amount');
    }

    const wallet = await WalletModel.findOne({ user: req.user.id });

    if (!wallet) return sendResponse(res, 404, false, 'Wallet not found');

    wallet.balance += Number(amount);
    await wallet.save();

    return sendResponse(res, 200, true, 'Wallet topped up successfully', wallet);
  } catch (err) {
    return sendResponse(res, 500, false, 'Error topping up wallet', err.message);
  }
};

export const getWallet = async (req, res) => {
  try {
    const wallet = await WalletModel.findOne({ user: req.user.id });

    if (!wallet) return sendResponse(res, 404, false, 'Wallet not found');

    return sendResponse(res, 200, true, 'Wallet fetched successfully', wallet);
  } catch (err) {
    return sendResponse(res, 500, false, 'Error fetching wallet', err.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return sendResponse(res, 400, false, 'User ID is required');


    const user = await UserModel.findById(userId).select('-__v');

    if (!user) return sendResponse(res, 404, false, 'User not found');

    return sendResponse(res, 200, true, 'User fetched successfully', {
      phone: user.phone,
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _id: user._id,
      pincode: user.pincode || '',
      isRegular: user.isRegular || false,
    });
  } catch (err) {
    return sendResponse(res, 500, false, 'Error fetching user', err.message);
  }
};
