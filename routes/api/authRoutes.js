const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../auth');
const config = require('../../config');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

router.post('/adduser', async (req, res) => {
  console.log(req.body);
  const { username, password, email } = req.body;
  const user = new User({
    username,
    password,
    email
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, async (err, hash) => {
      // Hash password
      user.password = hash;

      try {
        const newUser = await user.save();

        res.json({ status: 'OK' });
        // let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
          host: 'localhost',
          port: 25,
          tls: {
            rejectUnauthorized: false
          }
        });

        let info = await transporter.sendMail({
          from: 'noreply@domain.com', // sender address
          to: email, // list of receivers
          subject: 'Key Info', // Subject line
          text: 'validation key: <fakeEncryptedKey>', // plain text body
          html: '<p>validation key: <fakeEncryptedKey></p>' // html body
        });
      } catch (err) {
        console.log(err);
      }
    });
  });
});

router.post('/verify', async (req, res) => {
  console.log(req.body);
  const { email, key } = req.body;
  // find user by email
  // assume only 1 email
  const existingUser = await User.findOne({ email: email });
  if (!existingUser) res.json({ status: 'ERROR', error: 'User not found' }); // ie data not found
  if (key === 'abracadabra' || key === 'fakeEncryptedKey') {
    existingUser.verified = true;
  } else {
    res.json({ status: 'ERROR', error: 'Invalid key' });
  }
  await existingUser.save();
  res.json({ status: 'OK' });
});

router.post('/login', async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  try {
    //authenticate user
    const user = await auth.authenticate(username, password);
    console.log(user);
    req.session.userId = user._id;
    res.json({ status: 'OK' });
  } catch (err) {
    res.json({ status: 'ERROR', error: err });
    console.log(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
  });
  res.clearCookie('sid');
  res.json({ status: 'OK' });
  // Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
});

const invalidLogin = async (req, res, next) => {
  const { userId } = req.session;
  if (!userId) {
    // Forbidden
    // res.sendStatus(403);
    res.json({ status: 'ERROR', error: 'No User Logged In' });
  } else {
    next();
  }
};

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
  });
  res.clearCookie('sid');
  res.json({ status: 'OK' });
  // Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
});

router.get('/login', (req, res) => {
  console.log(req.session);
  res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='username' name='username' placeholder='Username' required />
      <input type='password' name='password' placeholder='password' required />
      <input type='submit' />
    </form>
  `);
});

module.exports = router;
