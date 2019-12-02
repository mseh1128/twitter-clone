const Media = require('../models/Media');

const invalidLogin = async (req, res, next) => {
  const { userId } = req.session;
  if (!userId) {
    res.json({ status: 'error', error: 'No User Logged In' });
  } else {
    next();
  }
};

const invalidLogin404 = async (req, res, next) => {
  const { userId } = req.session;
  if (!userId) {
    console.log('YOU ARE NOT LOGGED IN');
    res.status(404).send('You are not logged in!');
  } else {
    next();
  }
};

const invalidMediaParams = (req, res, next) => {
  const { content } = req.body;
  console.log(req.body);
  if (!content)
    res.json({
      status: 'error',
      error: 'The parameters given were invalid'
    });
};

const checkIndividualFile = (mediaID, userID, itemReqBody) =>
  new Promise(async (resolve, reject) => {
    let mediaItem;
    try {
      mediaItem = await Media.findById(mediaID).select('usedBy');
    } catch (err) {
      console.log('invalid mediaItem string');
      reject('invalid mediaItem string');
    }

    let sameItem = true;
    if (mediaItem) {
      console.log('found item');
      const { usedBy, uploadedBy } = mediaItem;

      if (usedBy.content !== itemReqBody.content) {
        sameItem = false;
        console.log('Content is different');
      }
      if (usedBy.childType !== itemReqBody.childType) {
        sameItem = false;
        console.log('Child Type is different');
      }
      if (usedBy.parent !== itemReqBody.parent) {
        sameItem = false;
        console.log('Parent is different');
      }

      // only thing not comparing is the media!

      const invalidMediaItem =
        (usedBy.media.length > 0 && !sameItem) ||
        (uploadedBy && !uploadedBy.equals(userID));
      if (!invalidMediaItem) {
        console.log('valid media item');
        mediaItem.usedBy = itemReqBody;
        mediaItem.save();
        resolve();
      } else {
        console.log('invalid media item, in use or uploaded by diff user');
        reject('invalid media item, in use or uploaded by diff user');
        // remove from media array if invalid
      }
    } else {
      reject('media item does not exist!');
    }
  });

const checkMedia = (media, userID, itemReqBody) =>
  new Promise((resolve, reject) => {
    if (media) {
      resolve(
        Promise.all(
          media.map(individualMediaFile => {
            return checkIndividualFile(
              individualMediaFile,
              userID,
              itemReqBody
            );
          })
        )
      );
    } else {
      resolve();
    }
  });

let itemToJSON = item => {
  const JSONItem = item.toJSON();
  JSONItem.id = JSONItem._id;
  let modifiedCreatedAt = Math.floor(
    new Date(JSONItem.createdAt).getTime() / 1000
  );
  delete JSONItem._id;
  delete JSONItem.timestamp;
  delete JSONItem.createdAt;
  delete JSONItem.updatedAt;
  JSONItem.timestamp = modifiedCreatedAt;
  delete JSONItem.__v;
  // console.log(JSONItem);
  return JSONItem;
};

module.exports = {
  invalidLogin,
  invalidLogin404,
  itemToJSON,
  invalidMediaParams,
  checkMedia
};
