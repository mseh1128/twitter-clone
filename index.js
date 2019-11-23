const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const config = require('./config');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const AuthRoutes = require('./routes/api/AuthRoutes');
const HelperRoutes = require('./routes/api/HelperRoutes');
const ItemRoutes = require('./routes/api/ItemRoutes');
const UserRoutes = require('./routes/api/UserRoutes');
const SearchRoute = require('./routes/api/SearchRoute');
const { invalidLogin, invalidMediaParams } = require('./lib/utils');
const Media = require('./models/Media');

app.use('/public', express.static('public'));

app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    name: 'sid',
    secret: config.JWT_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);
// bottom for form submissions
app.use(express.urlencoded({ extended: false }));

// Create mongo connection
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true });
const conn = mongoose.connection;

let gfs;

conn.on('error', err => console.log(err));

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

app.use((req, res, next) => {
  res.locals.gfs = gfs;
  next();
});

// could put these into a index.js file in routes for modularization!
app.use('/', AuthRoutes);
app.use('/', ItemRoutes);
app.use('/', SearchRoute);
app.use('/', HelperRoutes);
app.use('/user', UserRoutes);

const storage = new GridFsStorage({
  url: config.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage
  // fileFilter: function(req, file, cb) {
  //   if (file.fieldname !== 'content') {
  //     console.log('In here');
  //     return cb(null, false);
  //   }
  //   return cb(null, true);
  // }
});

// @route POST /upload
// @desc  Uploads file to DB
app.post(
  '/addmedia',
  [invalidLogin, upload.single('content')],
  async (req, res) => {
    // console.log(req.file);
    const { userId } = req.session;
    if (!req.file) {
      res.json({ status: 'error', error: 'The file could not be uploaded' });
    } else {
      res.json({ status: 'OK', id: req.file.id });
      const media = new Media({
        // Grab the file id that was stored in the database by the storage engine as the reference to your file
        _id: req.file.id,
        uploadedBy: userId
      });
      await media.save();
    }
  }
);

// @route GET /image/:filename
// @desc Display Image
app.get('/media/:id', async (req, res) => {
  let fileId;
  try {
    fileId = new mongoose.mongo.ObjectId(req.params.id);
  } catch (error) {
    return res.status(404).json({
      err: 'No file exists'
    });
  }

  const mediaExists = !(await Media.exists({ _id: fileId }));
  console.log(mediaExists);
  if (mediaExists) {
    console.log('The media file did not exist!');
    return res.status(404).json({
      err: 'The media file did not exist!'
    });
  }
  console.log('THE MEDIA FILE DOES EXIST');

  gfs.files.findOne({ _id: fileId }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    } else {
      try {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } catch (err) {
        console.log(err);
        console.log('The media file probably doesnt exist at this point');
        return res.status(404).json({
          err: 'The media file did not exist!'
        });
      }
    }
  });
});

const port = config.PORT;

app.listen(port, () => console.log(`Server started on port ${port}`));
