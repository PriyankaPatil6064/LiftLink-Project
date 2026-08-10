import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for authenticated users/vendors
 * @param {string} id - User or Vendor MongoDB _id
 * @param {string} role - 'user' | 'vendor' | 'admin'
 * @returns {string} JWT token
 */
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
