const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    property: {
      likes: {
        type: Number,
        default: 0
      }
    },
    retweeted: {
      type: Number,
      default: 0
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    childType: {
      type: String,
      required: false,
      default: null,
      trim: true
    },
    parent: {
      type: 'ObjectId',
      required: false,
      default: null
    },
    children: [{ type: 'ObjectId' }],
    media: [{ type: 'ObjectId' }]
  },
  {
    timestamps: true
  }
);

ItemSchema.index({ '$**': 'text' }); // include all strings in index
const Item = mongoose.model('Item', ItemSchema);
module.exports = { ItemSchema, Item };
