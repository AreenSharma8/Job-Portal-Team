const jwt = require('jsonwebtoken');

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const generateAccessToken = (user) => {
  return generateToken(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRE || '15m'
  );
};

const generateRefreshToken = (user) => {
  return generateToken(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRE || '7d'
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
