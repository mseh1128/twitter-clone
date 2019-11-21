//movie schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
  usedBy: {
    content: {
      type: String
    },
    childType: {
      type: String
    },
    parent: {
      type: 'ObjectId'
    },
    media: [{ type: String }]
  },
  uploadedBy: {
    type: 'ObjectId'
  }
});

const Media = mongoose.model('Media', MediaSchema);
module.exports = Media;
