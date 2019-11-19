const express = require('express');
const router = express.Router();
const {
  itemToJSON,
  invalidLogin,
  invalidLogin404
} = require('../../lib/utils');
const User = require('../../models/User');
const Item = require('../../models/Item').Item;

router.post('/additem', invalidLogin, async (req, res) => {
  // console.log(req.body);
  const { content, childType } = req.body;
  if (childType && childType !== 'retweet' && childType !== 'reply')
    res.json({ status: 'error', error: 'Invalid child type' });
  const existingUser = await User.findById(req.session.userId);
  const item = new Item({
    username: existingUser.username,
    content,
    childType
  });
  try {
    const newItem = await item.save();
    existingUser.items.push(newItem);
    await existingUser.save();
    // console.log(newItem);
    res.json({ status: 'OK', id: newItem.id });
  } catch (err) {
    res.json({ status: 'error', error: err });
  }
});

router.get('/item/:id', async (req, res) => {
  let id = req.params.id;
  try {
    const item = await Item.findById(id);
    const JSONItem = itemToJSON(item);
    res.json({ status: 'OK', item: JSONItem });
  } catch (err) {
    console.log(err);
    res.json({ status: 'error', error: err });
  }
});

router.delete('/item/:id', invalidLogin404, async (req, res) => {
  let id = req.params.id;
  try {
    const existingUser = await User.findById(req.session.userId);
    console.log(existingUser.items);
    if (existingUser.items.some(item => item._id.toString() === id)) {
      await Item.findById(id)
        .remove()
        .exec();
      existingUser.items.pull(id);
      await existingUser.save();
      console.log('User has item');
      res.status(200).send('Item deleted!');
    } else {
      res.status(404).send('User logged in does not have this item!');
    }
  } catch (err) {
    res.status(404).send(err);
    console.log(err);
    // res.json({ status: 'error', error: err });
  }
});

module.exports = router;
