//movie schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
  uploadedBy: {
    type: 'ObjectId'
  },
  inUse: {
    type: Boolean,
    default: false
  },
  fileID: {
    type: Schema.Types.ObjectId // There is no need to create references here
  }
});

const Media = mongoose.model('Media', MediaSchema);
module.exports = Media;
