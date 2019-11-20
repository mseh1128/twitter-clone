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
  itemToJSON
};
