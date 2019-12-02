const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {
  itemToJSON,
  invalidLogin,
  invalidLogin404,
  checkMedia
} = require('../../lib/utils');
const User = require('../../models/User');
const Item = require('../../models/Item').Item;
const Media = require('../../models/Media');

const getExistingData = (parent, userID) =>
  new Promise(async (resolve, reject) => {
    let parentItem;
    let existingUser;
    if (parent) {
      try {
        const [parentItem, existingUser] = await Promise.all([
          Item.findById(parent).select('retweeted replies retweets'),
          User.findById(userID).select('username items')
        ]);
        resolve({ parentItem, existingUser });
      } catch (err) {
        console.log('Parent doesnt exist');
        reject('Parent doesnt exist');
      }
    } else {
      existingUser = await User.findById(userID);
      resolve({ parentItem, existingUser });
    }
  });

router.post('/additem', invalidLogin, async (req, res) => {
  const { content, childType, media } = req.body;
  let { parent } = req.body;
  const childIsRetweet = childType === 'retweet';
  const childIsReply = childType === 'reply';
  if (childType && !childIsRetweet && !childIsReply) {
    res.json({ status: 'error', error: 'Invalid child type' });
  }
  try {
    const { parentItem, existingUser } = await getExistingData(
      parent,
      req.session.userId
    );

    const { _id } = existingUser;
    // check that the user uploaded the media file!
    // console.log(media);

    // console.log('REQUEST BODY IS: ');
    // console.log(req.body);
    // checkMedia will throw error if could not clean media!
    await checkMedia(media, _id, req.body);

    const item = new Item({
      username: existingUser.username,
      content,
      parent,
      childType,
      media: media
    });

    const newItem = await item.save();
    res.json({ status: 'OK', id: newItem.id });
    existingUser.items.push(newItem);

    if (parentItem && childType) {
      // if child exists must be retweet or reply
      if (childIsRetweet) {
        parentItem.retweeted += 1;
        parentItem.retweets.push({ _id: newItem._id });
      } else {
        // if reply
        parentItem.replies.push({ _id: newItem._id });
      }
      Promise.all([parentItem.save(), existingUser.save()]);
    } else {
      existingUser.save();
    }
    // console.log(newItem);
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
    const item = await Item.findById(id).select('likedUsers property');
    // const existingUser = await User.findById(req.session.userId);

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
    res.json({ status: 'error' });
  }
});

router.delete('/item/:id', invalidLogin404, async (req, res) => {
  console.log('IN DELETE');
  let id = req.params.id;
  try {
    const { gfs } = res.locals;
    // const existingUser = await ;
    // const itemToDelete = await ;
    const [existingUser, itemToDelete] = await Promise.all([
      User.findById(req.session.userId).select('items username'),
      Item.findById(id)
    ]);
    // if (userItems.some(item => item._id.toString() === id)) {
    // const deletedItem = await Item.findOneAndDelete(id);
    if (!itemToDelete || itemToDelete == null || itemToDelete == undefined) {
      console.log('Deleted item did not exist');
      return res.status(404).send('Deleted item does not exist');
    }
    if (existingUser.username !== itemToDelete.username) {
      console.log('User does not have the item!');
      return res.status(404).send('User logged in does not have this item!');
    }
    console.log('Item exists, the user has the item');
    const mediaIDArray = itemToDelete.media;
    // const repliesArray = itemToDelete.replies;
    // const retweetsArray = itemToDelete.retweets;
    // Currently not updated replies/retweets to indicate parent is now null

    if (mediaIDArray && mediaIDArray.length > 0) {
      const promiseList = mediaIDArray.reduce((acc, mediaID) => {
        return acc.concat([
          Media.findByIdAndDelete(mediaID),
          gfs.remove({ _id: mediaID, root: 'uploads' })
        ]);
      }, []);
      Promise.all(
        mediaIDArray.reduce((acc, mediaID) => {
          return acc.concat([
            Media.findByIdAndDelete(mediaID),
            gfs.remove({ _id: mediaID, root: 'uploads' })
          ]);
        }, [])
      );
    }

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
    res.status(200).send('Item deleted!');

    existingUser.items.pull(id);
    await Promise.all([itemToDelete.remove(), existingUser.save()]);
    // await itemToDelete.save();
    console.log('User had the item');
    // } else {
    //   console.log('User does not have the item!');
    //   res.status(404).send('User logged in does not have this item!');
    // }
  } catch (err) {
    res.status(404).send(err);
    console.log(err);
    // res.json({ status: 'error', error: err });
  }
});

module.exports = router;
