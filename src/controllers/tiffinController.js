import TiffinModel from '../models/Tiffin.js';
import { sendResponse } from '../utils/sendResponse.js';

export const createTiffin = async (req, res) => {
  try {
    const { name, description, price, type, availableSlots, availableDays } = req.body;
    const image = req.file?.path;

    const tiffinData = {
      name,
      type: type || 'tiffin',
      description,
      price: Number(price),
      image,
    };

    if (type === 'tiffin') {
      tiffinData.availableSlots = availableSlots ? availableSlots.split(',') : undefined;
      tiffinData.availableDays = availableDays ? availableDays.split(',') : undefined;
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
