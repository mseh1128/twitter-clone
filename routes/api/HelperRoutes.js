// ROUTES THAT ARE NOT PART OF API, BUT HELPFUL
// LIKE RESET

const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const Item = require('../../models/Item').Item;
const Media = require('../../models/Media');

router.post('/reset', async (req, res) => {
  try {
    await Item.remove({});
    await User.remove({});
    await Media.remove({});
    res.locals.gfs.remove({});
    res.json({ status: 'OK' });
  } catch (err) {
    console.log(err);
    res.json({ status: 'error', error: err });
  }
});

router.post('/resetFollow', async (req, res) => {
  try {
    await User.update(
      {},
      { $set: { followers: [], following: [] } },
      { multi: true }
    );
    res.json({ status: 'OK' });
  } catch (err) {
    console.log(err);
    res.json({ status: 'error', error: err });
  }
});

module.exports = router;
