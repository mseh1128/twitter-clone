const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item').Item;

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      res.json({ status: 'error', error: 'That user does not exist!' });
      return;
    }
    const { email, followers, following } = existingUser;
    res.json({
      status: 'OK',
      user: {
        email,
        followers: followers.length,
        following: following.length
      }
    });
  } catch (err) {
    res.json({ status: 'error', error: err });
  }
});

router.get('/:username/posts', async (req, res) => {
  const { username } = req.params;
  let { limit } = req.query;
  if (limit && parseInt(limit) > 200) {
    limit = 200;
    // res.json({ status: 'error', error: 'Limit is 200!' });
    // return;
  }
  if (limit && parseInt(limit) < 0) {
    limit = 0;
    // res.json({
    //   status: 'error',
    //   error: 'This index is not valid!'
    // });
    // return;
  }
  let itemLimit = parseInt(limit) || 50;
  if (parseInt(limit) === 0) itemLimit = 0;
  console.log(`Item Limit: ${itemLimit}`);
  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      res.json({ status: 'error', error: 'That user does not exist!' });
      return;
    }
    const { items } = existingUser;
    const itemsID = items.map(({ _id }) => _id).slice(0, itemLimit); // first limit # items
    res.json({
      status: 'OK',
      items: itemsID
    });
  } catch (err) {
    res.json({ status: 'error', error: err });
  }
});
router.get('/:username/followers', async (req, res) => {
  const { username } = req.params;
  let { limit } = req.query;
  if (limit && parseInt(limit) > 200) {
    limit = 200;
    // res.json({
    //   status: 'error',
    //   error: 'Limit is 200!'
    // });
    // return;
  }
  if (limit && parseInt(limit) < 0) {
    limit = 0;
    // res.json({
    //   status: 'error',
    //   error: 'This index is not valid!'
    // });
    // return;
  }
  let itemLimit = parseInt(limit) || 50;
  if (parseInt(limit) === 0) itemLimit = 0; // if user asking for 0 items, don't give them anything?
  console.log(`Item Limit: ${itemLimit}`);
  try {
    const existingUser = await User.findOne({ username }).populate('followers');
    if (!existingUser) {
      res.json({
        status: 'error',
        error: 'That user does not exist!'
      });
      return;
    }
    const { followers } = existingUser;
    const followersUsernames = followers
      .map(({ username }) => username)
      .slice(0, itemLimit);
    console.log(followersUsernames);
    res.json({
      status: 'OK',
      users: followersUsernames
    });
  } catch (err) {
    res.json({
      status: 'error',
      error: err
    });
  }
});

router.get('/:username/following', async (req, res) => {
  const { username } = req.params;
  let { limit } = req.query;
  if (limit && parseInt(limit) > 200) {
    limit = 200;
    // res.json({
    //   status: 'error',
    //   error: 'Limit is 200!'
    // });
    // return;
  }
  if (limit && parseInt(limit) < 0) {
    limit = 0;
    // res.json({
    //   status: 'error',
    //   error: 'This index is not valid!'
    // });
    // return;
  }
  let itemLimit = parseInt(limit) || 50;
  if (parseInt(limit) === 0) itemLimit = 0; // if user asking for 0 items, don't give them anything?
  console.log(`Item Limit: ${itemLimit}`);
  try {
    const existingUser = await User.findOne({ username }).populate('following');
    if (!existingUser) {
      res.json({
        status: 'error',
        error: 'That user does not exist!'
      });
      return;
    }
    const { following } = existingUser;
    const followingUsernames = following
      .map(({ username }) => username)
      .slice(0, itemLimit);
    console.log(followingUsernames);
    res.json({
      status: 'OK',
      users: followingUsernames
    });
  } catch (err) {
    res.json({
      status: 'error',
      error: err
    });
  }
});

module.exports = router;
