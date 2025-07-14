import Pincode from '../models/Pincode.js';
import { sendResponse } from '../utils/sendResponse.js';

// ✅ Create a new pincode
export const createPincode = async (req, res) => {
    try {
        const { pincode } = req.body;

        if (!pincode) {
            return sendResponse(res, 400, false, 'Pincode is required');
        }

        const exists = await Pincode.findOne({ pincode });
        if (exists) {
            return sendResponse(res, 400, false, 'Pincode already exists');
        }

        const newPincode = await Pincode.create({ pincode });
        return sendResponse(res, 201, true, 'Pincode created successfully', newPincode);
    } catch (error) {
        return sendResponse(res, 500, false, 'Failed to create pincode', error.message);
    }
};

// ✅ Get all pincodes
export const listPincodes = async (req, res) => {
    try {
        const pincodes = await Pincode.find().sort({ createdAt: -1 });
        return sendResponse(res, 200, true, 'Pincodes fetched successfully', pincodes);
    } catch (error) {
        return sendResponse(res, 500, false, 'Failed to fetch pincodes', error.message);
    }
};

// ✅ Delete a pincode
export const deletePincode = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Pincode.findByIdAndDelete(id);
        if (!deleted) {
            return sendResponse(res, 404, false, 'Pincode not found');
        }

        return sendResponse(res, 200, true, 'Pincode deleted successfully');
    } catch (error) {
        return sendResponse(res, 500, false, 'Failed to delete pincode', error.message);
    }
};
