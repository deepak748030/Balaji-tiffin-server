import TiffinModel from '../models/Tiffin.js';

export const createTiffin = async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file?.path;
  const tiffin = await new TiffinModel({ name, description, price: Number(price), image }).save();
  res.json(tiffin);
};

export const listTiffins = async (req, res) => {
  const tiffins = await TiffinModel.find();
  res.json(tiffins);
};
