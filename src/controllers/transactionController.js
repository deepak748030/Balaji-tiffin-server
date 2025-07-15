import Transaction from '../models/Transaction.js';
import { sendResponse } from '../utils/sendResponse.js';

export const getTransactionsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // ✅ Only allow access if admin or self
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return sendResponse(res, 403, false, 'Unauthorized to view these transactions');
        }

        const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

        if (!transactions || transactions.length === 0) {
            return sendResponse(res, 404, false, 'No transactions found');
        }

        return sendResponse(res, 200, true, 'Transactions fetched successfully', transactions);
    } catch (error) {
        return sendResponse(res, 500, false, 'Failed to fetch transactions', error.message);
    }
};
