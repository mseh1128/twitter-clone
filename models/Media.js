//movie schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
  usedBy: {
    type: 'ObjectId'
  },
  inUse: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: 'ObjectId'
  }
});

const Media = mongoose.model('Media', MediaSchema);
module.exports = Media;
