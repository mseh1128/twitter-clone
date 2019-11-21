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
const sanitizeMedia = (media, userID, itemReqBody) =>
  new Promise((resolve, reject) => {
    if (media) {
      let sameItem = true;
      const lastArrIdx = media.length - 1;
      media.forEach(async (mediaID, mediaIdx, mediaArr) => {
        if (mediaID) {
          console.log(mediaID);
          let mediaItem;
          try {
            mediaItem = await Media.findById(mediaID);
          } catch (err) {
            console.log('invalid mediaItem string');
            mediaArr.splice(mediaIdx, 1);
            if (mediaIdx === lastArrIdx) resolve(media);
            return;
          }
          console.log('MEDIA ITEM IS: ');
          console.log(mediaItem);
          if (mediaItem) {
            console.log('found item');
            const { usedBy, uploadedBy } = mediaItem;
            // const usedByString = JSON.stringify(usedBy);

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
            console.log('THE ITEM IS INVALID: ');
            console.log(invalidMediaItem);
            console.log(
              'The person who uploaded the image & the current user are the same'
            );
            if (uploadedBy) console.log(uploadedBy.equals(userID));
            else console.log('Uploaded by does not exist');
            if (!invalidMediaItem) {
              console.log('valid media item');
              mediaItem.usedBy = itemReqBody;
              mediaItem.save();
              console.log('MEDIA INDEX');
              console.log(mediaIdx);
              console.log('LAST ARR INDEX');
              console.log(lastArrIdx);
              if (mediaIdx === lastArrIdx) resolve(media);
            } else {
              console.log(
                'invalid media item, in use or uploaded by diff user'
              );
              reject('invalid media item, in use or uploaded by diff user');
              // remove from media array if invalid
              mediaArr.splice(mediaIdx, 1);
            }
            if (mediaIdx === lastArrIdx) resolve(media);
          } else {
            mediaArr.splice(mediaIdx, 1);
            if (mediaIdx === lastArrIdx) resolve(media);
          }
        } else {
          mediaArr.splice(mediaIdx, 1);
          if (mediaIdx === lastArrIdx) resolve(media);
        }
      });
    } else {
      resolve(media);
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
  sanitizeMedia
};
