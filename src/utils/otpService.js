// utils/otpService.js
import axios from 'axios';
import FormData from 'form-data';

export const sendOtpViaSMS = async (phone, otp) => {
    try {
        const form = new FormData();
        form.append('otp', otp);
        form.append('type', 'SMS');
        form.append('numberOrMail', phone);

        const res = await axios.post(
            'https://api.codemindstudio.in/api/start_verification',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Api-Key': 'a50aefcbd62bc072a07fe907437a88f0',
                    'Api-Salt': 'a2f13eae4d2bea02fbd68fa69e84423f2665aa1c032f8c7f4a24fa4c3a8d21cb'
                }
            }
        );

        return res.data; // { message, status }
    } catch (err) {
        return { message: 'OTP sending failed', status: false };
    }
};

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
