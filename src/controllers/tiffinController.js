import TiffinModel from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';

export const createTiffin = async (req, res) => {
  try {
    const { name, description, price, type, availableSlots, availableDays } = req.body;
    const image = req.file?.path;

    // Prepare tiffinData based on type
    const tiffinData = {
      name,
      type: type || 'tiffin',
      description,
      price: Number(price),
      image,
    };

    if (tiffinData.type === 'tiffin') {
      tiffinData.availableSlots = availableSlots
        ? availableSlots.split(',').map(s => s.trim())
        : ['morning', 'evening'];
      tiffinData.availableDays = availableDays
        ? availableDays.split(',').map(d => d.trim())
        : [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ];
    } else if (tiffinData.type === 'thali') {
      tiffinData.availableSlots = [];
      tiffinData.availableDays = [];
    }

    const tiffin = await TiffinModel.create(tiffinData);
    return sendResponse(res, 201, true, 'Tiffin created successfully', tiffin);
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to create tiffin', error.message);
  }
};

export const listTiffins = async (req, res) => {
  try {
    const tiffins = await TiffinModel.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Tiffins fetched successfully', tiffins);
  } catch (error) {
    return sendResponse(res, 500, false, 'Failed to fetch tiffins', error.message);
  }
};
