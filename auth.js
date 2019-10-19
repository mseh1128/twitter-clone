const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.authenticate = (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get user by username
      const user = await User.findOne({ username });

      // match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          if (!user.verified) reject('Authentication Failed');
          resolve(user);
        } else {
          reject('Authentication Failed');
        }
      });
    } catch (err) {
      // username not found
      reject('Authentication Failed');
    }
  });
};
