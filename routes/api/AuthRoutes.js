const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item').Item;
const auth = require('../../auth');
const { itemToJSON, invalidLogin } = require('../../lib/utils');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

router.post('/adduser', async (req, res) => {
  console.log('In add user');
  // console.log(req.body);
  const { username, password, email } = req.body;
  // username & email must be unique?
  const duplicateUser = await User.exists({ username, email });
  console.log(req.body);
  if (duplicateUser) {
    console.log('DUP USER DETECTED');
    return res.status(404).json({ status: 'error', error: "Duplicate user detected!"});
  }
  console.log('Not a duplicate user');

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
        res.json({ status: 'error', error: err });
      }
    });
  });
});

router.post('/verify', async (req, res) => {
  // console.log(req.body);
  const { email, key } = req.body;
  // find user by email
  // assume only 1 email
  const existingUser = await User.findOne({ email: email });
  if (!existingUser) {
    console.log("User was not found in verify!");
    return res.status(404).json({ status: 'error', error: 'User not found' }); // ie data not found
  } // ie data not found
  if (key === 'abracadabra' || key === 'fakeEncryptedKey') {
    existingUser.verified = true;
  } else {
    console.log("Key was incorrect in verify!");
    return res.status(404).json({ status: 'error', error: 'Invalid key' });
  }
  await existingUser.save();
  res.json({ status: 'OK' });
});

router.post('/login', async (req, res) => {
  // console.log(req.body);
  const { username, password } = req.body;

  try {
    //authenticate user
    const user = await auth.authenticate(username, password);
    // console.log(user);
    req.session.userId = user._id;
    res.json({ status: 'OK' });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      error: err
    });
    // res.json({ status: 'error', error: err });
    console.log(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) res.json({ status: 'error', error: err });
  });
  res.clearCookie('sid');
  res.json({ status: 'OK' });
  // Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
});

router.post('/follow', invalidLogin, async (req, res) => {
  let { username, follow } = req.body;
  // console.log(req.body);
  try {
    const followingUser = await User.findOne({ username });
    if (!followingUser) {
      res.json({
        status: 'error',
        error: 'The user you want to follow does not exist!'
      });
      return;
    }
    const existingUser = await User.findById(req.session.userId);
    // console.log(followingUser);
    if (followingUser.equals(existingUser)) {
      res.json({ status: 'error', error: 'You cannot follow yourself!' });
      return;
    }
    follow = JSON.parse(follow);
    if (follow == null) follow = true;
    console.log(follow);
    const followingUserAlready = existingUser.following.some(user =>
      user.equals(followingUser._id)
    );
    // console.log(`Following User Already: ${followingUserAlready}`);
    if (follow) {
      // follow user
      // following someone again does nothing
      if (followingUserAlready) {
        // assume no error should be thrown, just return as is, w/out changing anything
        res.json({ status: 'OK' });
        return;
      }
      existingUser.following.push(followingUser);
      followingUser.followers.push(existingUser);
      await existingUser.save();
      await followingUser.save();
    } else {
      // unfollow user
      if (!followingUserAlready) {
        // if trying to unfollow user we have not already followed don't do anything
        // not throwing error here, but might have to
        res.json({ status: 'OK' });
        return;
      }
      existingUser.following.pull(followingUser);
      followingUser.followers.pull(existingUser);
      await existingUser.save();
      await followingUser.save();
    }
    res.json({ status: 'OK' });
  } catch (err) {
    res.json({ status: 'error', error: err });
  }
});

module.exports = router;
