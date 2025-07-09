import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { sendResponse } from '../utils/sendResponse.js';
import { sendOtpViaSMS, generateOtp } from '../utils/otpService.js'; // ✅ using renamed helper

// export const sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     if (!phone) {
//       return sendResponse(res, 400, false, 'Phone number is required');
//     }

//     let user = await User.findOne({ phone });
//     if (!user) {
//       user = new User({ phone });
//       await user.save();
//       await new Wallet({ user: user._id }).save();
//     }

//     const otp = generateOtp();
//     user.otp = otp;
//     await user.save();

//     // ✅ Send via external SMS service
//     const smsResponse = await sendOtpViaSMS(phone, otp);

//     if (!smsResponse.status) {
//       return sendResponse(res, 500, false, 'OTP sending failed via SMS API');
//     }

//     // Optional: remove this in production
//     console.log(`OTP for ${phone}: ${otp}`);

//     return sendResponse(res, 200, true, 'OTP sent successfully');
//   } catch (err) {
//     return sendResponse(res, 500, false, 'Error sending OTP', err.message);
//   }
// };



export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return sendResponse(res, 400, false, 'Phone number is required');
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
      await new Wallet({ user: user._id }).save();
    }

    // ✅ Always use static OTP
    const otp = '111111';
    user.otp = otp;
    await user.save();

    // ✅ No external SMS sent — only log for development
    console.log(`OTP for ${phone}: ${otp}`);

    return sendResponse(res, 200, true, 'OTP sent successfully');
  } catch (err) {
    return sendResponse(res, 500, false, 'Error sending OTP', err.message);
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return sendResponse(res, 400, false, 'Phone and OTP are required');
    }

    const user = await User.findOne({ phone, otp });
    if (!user) return sendResponse(res, 400, false, 'Invalid OTP');

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data for response
    const userData = {
      _id: user._id,
      phone: user.phone,
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return sendResponse(res, 200, true, 'OTP verified successfully', {
      token,
      user: userData
    });
  } catch (err) {
    return sendResponse(res, 500, false, 'Error verifying OTP', err.message);
  }
};
