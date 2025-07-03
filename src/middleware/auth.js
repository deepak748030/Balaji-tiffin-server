import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const h = req.header('Authorization');
  if (!h) return res.status(401).json({ msg: 'No token provided' });
  const token = h.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET).user;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
};
