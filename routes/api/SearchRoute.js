const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Item = require('../../models/Item').Item;

// RESERVED ONLY FOR SEARCH ROUTE SO FAR

router.post('/search', async (req, res) => {
  // console.log(req.body);
  const { timestamp, limit, q, username, following } = req.body;
  let unixTimeStamp = timestamp ? timestamp * 1000 : Date.now();
  // console.log(unixTimeStamp);
  if (limit && parseInt(limit) > 100) {
    res.json({ status: 'error', error: 'Limit is 100!' });
    return;
  }
  if (limit && parseInt(limit) < 0) {
    res.json({
      status: 'error',
      error: 'This index is not valid!'
    });
    return;
  }
  let itemLimit = parseInt(limit) || 25;
  if (parseInt(limit) === 0) itemLimit = 0;
  // console.log(itemLimit);
  try {
    let items = await Item.find({ createdAt: { $lte: unixTimeStamp } }).limit(
      itemLimit
    );
    // console.log(items);
    let JSONItems = items.map(item => itemToJSON(item));
    // console.log(JSONItems);
    res.json({ status: 'OK', items: JSONItems });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
});

module.exports = router;
