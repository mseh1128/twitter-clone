const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Item = require("../../models/Item").Item;
const auth = require("../../auth");
const config = require("../../config");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

router.post("/adduser", async (req, res) => {
  console.log(req.body);
  const { username, password, email } = req.body;
  // username & email must be unique?
  const user = new User({
    username,
    password,
    email
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, async (err, hash) => {
      // Hash password
      user.password = hash;

      try {
        const newUser = await user.save();

        res.json({ status: "OK" });
        // let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
          host: "localhost",
          port: 25,
          tls: {
            rejectUnauthorized: false
          }
        });

        let info = await transporter.sendMail({
          from: "noreply@domain.com", // sender address
          to: email, // list of receivers
          subject: "Key Info", // Subject line
          text: "validation key: <fakeEncryptedKey>", // plain text body
          html: "<p>validation key: <fakeEncryptedKey></p>" // html body
        });
      } catch (err) {
        // console.log(err);
        res.json({ status: "ERROR", error: err });
      }
    });
  });
});

router.post("/verify", async (req, res) => {
  console.log(req.body);
  const { email, key } = req.body;
  // find user by email
  // assume only 1 email
  const existingUser = await User.findOne({ email: email });
  if (!existingUser) {
    res.json({ status: "error", error: "User not found" }); // ie data not found
    return;
  } // ie data not found
  if (key === "abracadabra" || key === "fakeEncryptedKey") {
    existingUser.verified = true;
  } else {
    res.json({ status: "error", error: "Invalid key" });
    return;
  }
  await existingUser.save();
  res.json({ status: "OK" });
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  try {
    //authenticate user
    const user = await auth.authenticate(username, password);
    console.log(user);
    req.session.userId = user._id;
    res.json({ status: "OK" });
  } catch (err) {
    res.json({ status: "error", error: err });
    console.log(err);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) res.json({ status: "error", error: err });
  });
  res.clearCookie("sid");
  res.json({ status: "OK" });
  // Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
});

const invalidLogin = async (req, res, next) => {
  const { userId } = req.session;
  if (!userId) {
    res.json({ status: "error", error: "No User Logged In" });
  } else {
    next();
  }
};

router.post("/additem", invalidLogin, async (req, res) => {
  console.log(req.body);
  const { content, childType } = req.body;
  if (childType && childType !== "retweet" && childType !== "reply")
    res.json({ status: "error", error: "Invalid child type" });
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
    console.log(newItem);
    res.json({ status: "OK", id: newItem.id });
  } catch (err) {
    res.json({ status: "error", error: err });
  }
});

// allowed even if not logged in?
router.get("/item/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const item = await Item.findById(id);
    const JSONItem = itemToJSON(item);
    res.json({ status: "OK", item: JSONItem });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", error: err });
  }
});

let itemToJSON = item => {
  const JSONItem = item.toJSON();
  JSONItem.id = JSONItem._id;
  let modifiedCreatedAt = Math.floor(
    new Date(JSONItem.createdAt).getTime() / 1000
  );
  delete JSONItem._id;
  delete JSONItem.childType;
  delete JSONItem.timestamp;
  delete JSONItem.createdAt;
  delete JSONItem.updatedAt;
  JSONItem.timestamp = modifiedCreatedAt;
  delete JSONItem.__v;
  console.log(JSONItem);
  return JSONItem;
};

router.post("/search", async (req, res) => {
  const { timestamp, limit } = req.body;
  let unixTimeStamp = timestamp ? timestamp * 1000 : Date.now();
  console.log(unixTimeStamp);
  if (limit && limit > 100) {
    res.json({ status: "error", error: "Limit is 100!" });
    return;
  }
  let itemLimit = limit || 25;
  try {
    let items = await Item.find({ createdAt: { $lte: unixTimeStamp } }).limit(
      itemLimit
    );
    console.log(items);
    let JSONItems = items.map(item => itemToJSON(item));
    console.log(JSONItems);
    res.json({ status: "OK", items: JSONItems });
  } catch (err) {
    res.json({ error: err });
  }
});

router.post("/reset", async (req, res) => {
  try {
    await Item.remove({});
    await User.remove({});
    res.json({ status: "OK" });
  } catch (err) {
    console.log(err);
    res.json({ status: "error", error: err });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
  });
  res.clearCookie("sid");
  res.json({ status: "OK" });
  // Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
});

router.get("/login", (req, res) => {
  console.log(req.session);
  res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='username' name='username' placeholder='Username' required />
      <input type='password' name='password' placeholder='password' required />
      <input type='submit' />
    </form>
  `);
});

module.exports = router;
