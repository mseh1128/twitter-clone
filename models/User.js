const mongoose = require("mongoose");
const ItemSchema = require("./Item").ItemSchema;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  items: [ItemSchema]
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
