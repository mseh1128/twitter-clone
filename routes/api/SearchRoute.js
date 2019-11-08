const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item').Item;
const { itemToJSON } = require('../../lib/utils');
// RESERVED ONLY FOR SEARCH ROUTE SO FAR

router.post('/search', async (req, res) => {
  // console.log(req.body);
  const { timestamp, q, username } = req.body;
  let { limit } = req.body;
  let { following } = req.body;
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
  if (following == null) following = true;
  try {
    const existingUser = await User.findById(req.session.userId).populate(
      'following'
    );
    const items = await getSearchItems(
      unixTimeStamp,
      itemLimit,
      q,
      username,
      following,
      existingUser
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
  loggedInUser
) => {
  // console.log(unixTimeStamp);
  // console.log(itemLimit);
  // console.log(query);
  console.log(following);
  // console.log(loggedInUser);
  // following can be true, false or null
  const itemOptions = { createdAt: { $lte: unixTimeStamp } };
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
  }
  if (inUsername && inUsername.length > 0) {
    // array exists & has atleast 1 item in it
    itemOptions['username'] = { $in: inUsername };
  }
  console.log(itemOptions);
  // if (username) itemOptions['username'] = username;
  const items = await Item.find(itemOptions).limit(itemLimit);
  return items;
};

module.exports = router;