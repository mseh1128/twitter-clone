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
  const { content, childType, parent, media } = req.body;
  if (childType && childType !== 'retweet' && childType !== 'reply')
    res.json({ status: 'error', error: 'Invalid child type' });
  if (childType === 'retweet' && parent !== null) {
    // try finding the parent & incrementing its retweeted field
    // convert parent to objectID
    const parentID = new mongoose.mongo.ObjectId(parent);
    const parentItem = await Item.findById(parentID);
    if (parentItem) {
      parentItem.retweeted += 1;
      await parentItem.save();
    }
  }
  // check that the user uploaded the media file!
  if (media) {
    // need to add field
    // gfs.files.findOne({_id: fileId})
  }

  const existingUser = await User.findById(req.session.userId);
  const item = new Item({
    username: existingUser.username,
    content,
    parent,
    media
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

router.post('/item/:id/like', invalidLogin, async (req, res) => {
  let id = req.params.id;
  let { like } = req.body;
  try {
    let itemID = new mongoose.mongo.ObjectId(id);
    const item = await Item.findById(itemID);
    // const existingUser = await User.findById(req.session.userId);
    like = JSON.parse(like);
    if (like == null) like = true;
    const userAlreadyLiked = existingUser.likedItems.includes(itemID);
    if (like) {
      if (!userAlreadyLiked) {
        console.log('Like is true & user has not already liked content');
        // existingUser.likedItems.push(itemID);
        existingUser.likedItems.push({ _id: itemID });
        existingUser.save();
        item.save();
        item.property.likes += 1;
        res.json({ status: 'OK' });
      }
    } else {
      if (existingUser.likedItems.includes(itemID)) {
        console.log(
          'Like is false & user has liked content before so can unlike'
        );
        // can only unlike item if originally liked it?
        // existingUser.likedItems.remove(itemID);
        doc.subdocs.pull({ _id: 4815162342 });
        item.property.likes -= 1;
        existingUser.save();
        item.save();
        res.json({ status: 'OK' });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({ status: 'error' });
  }
});

router.delete('/item/:id', invalidLogin404, async (req, res) => {
  let id = req.params.id;
  try {
    const existingUser = await User.findById(req.session.userId);
    console.log(existingUser.items);
    if (existingUser.items.some(item => item._id.toString() === id)) {
      const existingItem = Item.findById(id);
      const mediaIDArray = existingItem.media;
      await Item.findById(id)
        .remove()
        .exec();
      mediaIDArray.forEach(mediaID => {
        gfs.remove({ _id: mediaID, root: 'uploads' }, (err, gridStore) => {
          if (err) {
            console.log('COULD NOT FIND THIS MEDIA ID');
          }
        });
      });
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
