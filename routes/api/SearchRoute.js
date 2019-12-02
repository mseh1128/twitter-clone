const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item').Item;
const { itemToJSON } = require('../../lib/utils');
// RESERVED ONLY FOR SEARCH ROUTE SO FAR

router.post('/search', async (req, res) => {
  // console.log(req.body);
  const { timestamp, q, username } = req.body;
  let { limit, following, rank, hasMedia, replies, parent } = req.body;
  let unixTimeStamp = timestamp ? timestamp * 1000 : Date.now();
  // console.log(unixTimeStamp);
  if (limit && parseInt(limit) > 100) {
    limit = 100;
    // res.json({ status: 'error', error: 'Limit is 100!' });
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
  let itemLimit = parseInt(limit) || 25;
  if (parseInt(limit) === 0) itemLimit = 0;
  console.log(itemLimit);
  // Milestone 2 Code Goes Here
  // following = JSON.parse(following);
  // if (following == null) following = true;
  if (following != null) {
    if (
      typeof following === 'string' &&
      !(following === 'true' || following === 'false')
    ) {
      return res.json({
        status: 'error',
        error: 'Invalid following value, throwing error'
      });
    } else {
      following = JSON.parse(following); // if only true/false
    }
  } else {
    following = true; // otherwise just ignore it & set it to true
  }

  // Milestone 3 Code Goes Here
  if (rank == null) rank = 'interest';
  if (!(rank === 'time' || rank === 'interest')) {
    console.log('Invalid rank value, throwing error');
    return res.json({
      status: 'error',
      error: 'Invalid rank value, throwing error'
    });
  }

  // hasMedia = JSON.parse(hasMedia);
  // if (hasMedia == null) hasMedia = false;
  if (hasMedia != null) {
    if (
      typeof hasMedia === 'string' &&
      !(hasMedia === 'true' || hasMedia === 'false')
    ) {
      return res.json({
        status: 'error',
        error: 'Invalid hasMedia value passed'
      });
    } else {
      hasMedia = JSON.parse(hasMedia); // if only true/false
    }
  } else {
    hasMedia = false; // otherwise just ignore it & set it to true
  }

  // replies = JSON.parse(replies);
  // if (replies == null) replies = true;
  if (replies != null) {
    if (
      typeof replies === 'string' &&
      !(replies === 'true' || replies === 'false')
    ) {
      return res.json({
        status: 'error',
        error: 'Invalid replies value, throwing error'
      });
    } else {
      replies = JSON.parse(replies); // if only true/false
    }
  } else {
    replies = true; // otherwise just ignore it & set it to true
  }

  if (!replies) {
    // Parent === null means ignore it
    parent = null;
  }

  try {
    const existingUser = await User.findById(req.session.userId)
      .populate('following')
      .select('following')
      .lean();
    const items = await getSearchItems(
      unixTimeStamp,
      itemLimit,
      q,
      username,
      following,
      existingUser,
      rank,
      parent,
      replies,
      hasMedia
    );
    // console.log(items);
    let JSONItems = items.map(item => itemToJSON(item));
    res.json({ status: 'OK', items: JSONItems });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
});

const getSearchItems = async (
  unixTimeStamp,
  itemLimit,
  query,
  username,
  following,
  loggedInUser,
  rank,
  parent,
  replies,
  hasMedia
) => {
  // console.log(unixTimeStamp);
  // console.log(itemLimit);
  // console.log(query);
  // console.log(following);
  // console.log(loggedInUser);
  // following can be true, false or null
  const itemOptions = { createdAt: { $lte: unixTimeStamp } };
  console.log('Rank');
  console.log(rank);
  console.log('Parent');
  console.log(parent);
  console.log('Replies');
  console.log(replies);
  console.log('hasMedia');
  console.log(hasMedia);

  // Milestone 2 Code
  if (query) itemOptions['$text'] = { $search: query };
  let inUsername = [];
  // if (username) itemOptions['username'] = { username };
  if (username) inUsername.push(username);
  if (loggedInUser && following) {
    console.log('LOGGED IN AND FOLLOWING IS TRUE');
    const followingUsernames = loggedInUser.following.map(
      ({ username }) => username
    );
    inUsername = inUsername.concat(
      followingUsernames.filter(item => inUsername.indexOf(item) < 0)
    );
    itemOptions['username'] = { $in: inUsername };
  }
  console.log(itemOptions);
  // if (username) itemOptions['username'] = username;
  if (!replies) {
    itemOptions['childType'] = { $ne: 'reply' };
  }

  if (parent != null) {
    console.log('PARENT IS NOT NULL');
    // parent & replies must be true to reach here
    // include replies & retweets
    try {
      const item = await Item.findById(parent);
      const retweetedRepliedIDs = item.retweets.concat(item.replies);
      console.log(retweetedRepliedIDs);
      itemOptions['_id'] = { $in: retweetedRepliedIDs };
      // itemOptions['username'] = { $in: inUsername }
    } catch {
      console.log('Invalid item');
    }
  }

  if (hasMedia) itemOptions['media'] = { $exists: true, $not: { $size: 0 } };

  // Milestone 3 Code
  if (rank === 'time') {
    // sort from lowest to highest
    const items = await Item.find(itemOptions)
      .sort({ _id: -1 })
      .limit(itemLimit);
    return items;
  } else {
    console.log('IN HERE');
    const items = await Item.find(itemOptions);
    items.sort((a, b) => {
      const AInterest = a.property.likes + a.retweeted;
      const BInterest = b.property.likes + b.retweeted;
      return BInterest > AInterest ? 1 : BInterest < AInterest ? -1 : 0;
    });
    return items.splice(0, itemLimit);
  }
};

module.exports = router;
