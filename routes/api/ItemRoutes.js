const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {
  itemToJSON,
  invalidLogin,
  invalidLogin404,
  sanitizeMedia
} = require('../../lib/utils');
const User = require('../../models/User');
const Item = require('../../models/Item').Item;
const Media = require('../../models/Media');

router.post('/additem', invalidLogin, async (req, res) => {
  const { content, childType, media } = req.body;
  let { parent } = req.body;
  const childIsRetweet = childType === 'retweet';
  const childIsReply = childType === 'reply';
  if (childType && !childIsRetweet && !childIsReply) {
    res.json({ status: 'error', error: 'Invalid child type' });
  }
  let parentItem;
  if (parent) {
    try {
      parentItem = await Item.findById(parent);
    } catch (err) {
      console.log('Parent doesnt exist');
      parent = null;
    }
  }

  const existingUser = await User.findById(req.session.userId);
  const { _id } = existingUser;
  // check that the user uploaded the media file!
  console.log(media);
  try {
    // console.log('REQUEST BODY IS: ');
    // console.log(req.body);
    const sanitizedMedia = await sanitizeMedia(media, _id, req.body);

    const item = new Item({
      username: existingUser.username,
      content,
      parent,
      childType,
      media: sanitizedMedia
    });

    const newItem = await item.save();
    existingUser.items.push(newItem);
    await existingUser.save();
    if (parentItem && childType) {
      // if child exists must be retweet or reply
      if (childIsRetweet) {
        parentItem.retweeted += 1;
        parentItem.retweets.push({ _id: newItem._id });
      } else {
        // if reply
        parentItem.replies.push({ _id: newItem._id });
      }
      await parentItem.save();
    }
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
    if (!item || item == null || item == undefined)
      return res.json({ status: 'error', error: 'Item does not exist' });
    const JSONItem = itemToJSON(item);
    res.json({ status: 'OK', item: JSONItem });
  } catch (err) {
    console.log(err);
    res.json({ status: 'error', error: err });
  }
});

router.post('/item/:id/like', invalidLogin, async (req, res) => {
  const { id } = req.params;
  let { like } = req.body;
  try {
    const item = await Item.findById(id);
    // const existingUser = await User.findById(req.session.userId);
    if (like != null) {
      if (typeof like === 'string' && !(like === 'true' || like === 'false')) {
        console.log('Invalid string passed');
        return res.json({ status: 'error' });
      } else {
        like = JSON.parse(like); // if only true/false
      }
    } else {
      like = true; // otherwise just ignore it & set it to true
    }

    const { userId } = req.session;
    // const existingUser = await User.findById(userId);
    // console.log(existingUser.likedItems);
    // const userAlreadyLiked = existingUser.likedItems.includes(id);
    // console.log(userAlreadyLiked);

    const userAlreadyLiked = item.likedUsers.includes(userId);

    if (like) {
      console.log('Like is true');
      if (!userAlreadyLiked) {
        console.log('Like is true & user has not already liked content');
        // existingUser.likedItems.push(itemID);
        // existingUser.likedItems.push({ _id: id });
        item.likedUsers.push({ _id: userId });
        item.property.likes += 1;
        item.save();
      }
      res.json({ status: 'OK' });
    } else {
      console.log('Like is false');
      if (userAlreadyLiked) {
        console.log(
          'Like is false & user has liked content before so can unlike'
        );
        // can only unlike item if originally liked it?
        // existingUser.likedItems.remove(id);
        item.likedUsers.pull({ _id: userId });
        item.property.likes -= 1;
        item.save();
      }
      res.json({ status: 'OK' });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: 'error' });
  }
});

router.delete('/item/:id', invalidLogin404, async (req, res) => {
  console.log('IN DELETE');
  let id = req.params.id;
  try {
    const existingUser = await User.findById(req.session.userId);
    const userItems = existingUser.items;
    const { gfs } = res.locals;
    if (userItems.some(item => item._id.toString() === id)) {
      const deletedItem = await Item.findOneAndDelete(id);
      const mediaIDArray = deletedItem.media;
      console.log('IN HERE');
      // const repliesArray = deletedItem.replies;
      // const retweetsArray = deletedItem.retweets;
      // Currently not updated replies/retweets to indicate parent is now null
      console.log(mediaIDArray);

      mediaIDArray.forEach(async mediaID => {
        if (mediaID) {
          try {
            await Media.findByIdAndDelete(mediaID);
            await gfs.remove({ _id: mediaID, root: 'uploads' });
          } catch (err) {
            console.log('Could not find media file');
            console.log('In delete error callback');
            return;
          }
        }
      });

      // repliesArray.forEach(async replyID => {
      //     try {
      //       await Item.findByIdAndDelete(replyID);
      //     } catch (err) {
      //       console.log('Could not find media file');
      //       return;
      //     }
      //   }
      // });

      // retweetsArray.forEach(async retweetID => {
      //   // findbyid and update
      //     try {
      //       await Item.findByIdAndUpdate(mediaID);
      //     } catch (err) {
      //       console.log('Could not find media file');
      //       return;
      //     }
      //   }
      // });

      existingUser.items.pull(id);
      existingUser.save();
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
